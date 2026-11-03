<?php
declare(strict_types=1);

const SESSION_IDLE_SECONDS = 7200;

function current_user(): ?array
{
    static $user = false;
    if ($user !== false) {
        return $user;
    }
    start_session();
    $user = null;
    if (!empty($_SESSION['uid'])) {
        if (time() - (int)($_SESSION['last_seen'] ?? 0) > SESSION_IDLE_SECONDS) {
            logout_user();
            return null;
        }
        $row = one('SELECT id, name, email, role, is_active FROM users WHERE id = ?', [(int)$_SESSION['uid']]);
        if ($row && (int)$row['is_active'] === 1) {
            $_SESSION['last_seen'] = time();
            $user = $row;
        } else {
            logout_user();
        }
    }
    return $user;
}

function is_admin(): bool
{
    return (current_user()['role'] ?? '') === 'admin';
}

/** Gate for every admin route. $role 'admin' restricts to Administrators. */
function require_login(string $role = 'editor'): array
{
    $u = current_user();
    if (!$u) {
        flash('notice', 'Please sign in to continue.');
        redirect('/admin/login?next=' . rawurlencode($_SERVER['REQUEST_URI'] ?? '/admin'));
    }
    if ($role === 'admin' && $u['role'] !== 'admin') {
        http_response_code(403);
        view('admin/forbidden', ['title' => 'Not allowed']);
        exit;
    }
    return $u;
}

/** Returns null on success or an error message. */
function attempt_login(string $email, string $password): ?string
{
    $email = mb_strtolower(trim($email));
    $ipBucket = 'login-ip:' . ip_hash();
    $userBucket = 'login-user:' . hash('sha256', $email);
    if (!rate_limit($ipBucket, 10, 900, false) || !rate_limit($userBucket, 5, 900, false)) {
        return 'Too many sign-in attempts. Please wait 15 minutes and try again.';
    }
    $u = one('SELECT * FROM users WHERE email = ?', [$email]);
    // Always run a hash check so response time does not reveal whether the email exists.
    $hash = $u['password_hash'] ?? '$2y$10$usesomesillystringfore7hnbRJHxXVLeakoG8K30oukPsA.ztMG';
    $ok = password_verify($password, $hash);
    if (!$u || !$ok || (int)$u['is_active'] !== 1) {
        rate_limit($ipBucket, 10, 900);
        rate_limit($userBucket, 5, 900);
        audit('login_failed', 'user', $u['id'] ?? null);
        return 'That email and password do not match an active account.';
    }
    if (password_needs_rehash($u['password_hash'], PASSWORD_DEFAULT)) {
        q('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), $u['id']]);
    }
    rate_clear($userBucket);
    start_session();
    session_regenerate_id(true);
    $_SESSION['uid'] = (int)$u['id'];
    $_SESSION['last_seen'] = time();
    $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    q('UPDATE users SET last_login_at = NOW() WHERE id = ?', [$u['id']]);
    audit('login', 'user', $u['id']);
    return null;
}

function logout_user(): void
{
    start_session();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'] ?? '', $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function password_problem(string $pw): ?string
{
    if (mb_strlen($pw) < 10) {
        return 'Use at least 10 characters.';
    }
    if (!preg_match('/[A-Za-z]/', $pw) || !preg_match('/\d/', $pw)) {
        return 'Use a mix of letters and numbers.';
    }
    return null;
}

/** Creates a reset token and queues the email. Always behaves the same whether or not the email exists. */
function send_password_reset(string $email): void
{
    $email = mb_strtolower(trim($email));
    if (!rate_limit('reset:' . ip_hash(), 5, 3600)) {
        return;
    }
    $u = one('SELECT id, name, email FROM users WHERE email = ? AND is_active = 1', [$email]);
    if (!$u) {
        return;
    }
    $token = bin2hex(random_bytes(32));
    q('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [$u['id'], hash('sha256', $token), date('Y-m-d H:i:s', time() + 3600)]);
    $link = url('/admin/reset?token=' . $token);
    $html = mail_layout('Reset your password', '<p>Hello ' . e($u['name']) . ',</p><p>Someone (hopefully you) asked to reset the password for your website admin account. This link works for one hour:</p>'
        . '<p><a href="' . e($link) . '" style="display:inline-block;background:#ffcc00;color:#0b0b0c;font-weight:bold;padding:12px 20px;border-radius:8px;text-decoration:none">Choose a new password</a></p>'
        . '<p style="color:#6b7280;font-size:13px">If you did not ask for this, you can ignore this email. Your password will not change.</p>');
    $text = "Hello {$u['name']},\n\nReset your website admin password (link valid for one hour):\n$link\n\nIf you did not ask for this, ignore this email.";
    $id = mail_queue('reset', $u['email'], 'Reset your ' . setting('site_name', 'The Gathering') . ' admin password', $html, $text);
    mail_send_one($id);
    audit('password_reset_requested', 'user', $u['id']);
}

function reset_token_user(string $token): ?array
{
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
        return null;
    }
    return one('SELECT pr.id AS reset_id, u.id, u.email FROM password_resets pr JOIN users u ON u.id = pr.user_id
        WHERE pr.token_hash = ? AND pr.used_at IS NULL AND pr.expires_at > NOW() AND u.is_active = 1', [hash('sha256', $token)]);
}
