<?php
declare(strict_types=1);

/* ---------- config & environment ---------- */

function config(string $key, $default = null)
{
    $value = $GLOBALS['__config'];
    foreach (explode('.', $key) as $part) {
        if (!is_array($value) || !array_key_exists($part, $value)) {
            return $default;
        }
        $value = $value[$part];
    }
    return $value;
}

function is_production(): bool
{
    return config('env') === 'production';
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');
}

/* ---------- database ---------- */

function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $c = config('db');
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $c['host'], (int)($c['port'] ?? 3306), $c['name']);
        $pdo = new PDO($dsn, $c['user'], $c['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec("SET time_zone = '" . (new DateTime())->format('P') . "'");
    }
    return $pdo;
}

function q(string $sql, array $params = []): PDOStatement
{
    $st = db()->prepare($sql);
    $st->execute($params);
    return $st;
}

function one(string $sql, array $params = []): ?array
{
    $row = q($sql, $params)->fetch();
    return $row === false ? null : $row;
}

function all(string $sql, array $params = []): array
{
    return q($sql, $params)->fetchAll();
}

function scalar(string $sql, array $params = [])
{
    $v = q($sql, $params)->fetchColumn();
    return $v === false ? null : $v;
}

function last_id(): int
{
    return (int)db()->lastInsertId();
}

/* ---------- settings ---------- */

function settings_all(bool $refresh = false): array
{
    static $cache = null;
    if ($cache === null || $refresh) {
        $cache = [];
        foreach (all('SELECT skey, svalue FROM settings') as $r) {
            $cache[$r['skey']] = (string)$r['svalue'];
        }
    }
    return $cache;
}

function setting(string $key, string $default = ''): string
{
    $s = settings_all();
    return isset($s[$key]) && $s[$key] !== '' ? $s[$key] : $default;
}

function setting_save(string $key, string $value): void
{
    q('INSERT INTO settings (skey, svalue) VALUES (?, ?) ON DUPLICATE KEY UPDATE svalue = VALUES(svalue)', [$key, $value]);
}

/* ---------- output helpers ---------- */

function e($v): string
{
    return htmlspecialchars((string)($v ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function base_url(): string
{
    return rtrim((string)config('base_url', ''), '/');
}

function url(string $path = '/'): string
{
    return base_url() . '/' . ltrim($path, '/');
}

function asset(string $path): string
{
    $file = PUBLIC_DIR . '/' . ltrim($path, '/');
    $v = is_file($file) ? substr((string)filemtime($file), -6) : '1';
    return '/' . ltrim($path, '/') . '?v=' . $v;
}

function redirect(string $to, int $code = 303): never
{
    header('Location: ' . $to, true, $code);
    exit;
}

function request_path(): string
{
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $path = '/' . trim(rawurldecode($path), '/');
    return $path;
}

function is_post(): bool
{
    return ($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST';
}

function post(string $key, string $default = ''): string
{
    $v = $_POST[$key] ?? $default;
    return is_string($v) ? trim($v) : $default;
}

function get(string $key, string $default = ''): string
{
    $v = $_GET[$key] ?? $default;
    return is_string($v) ? trim($v) : $default;
}

function slugify(string $text): string
{
    $text = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text) ?: $text;
    $text = strtolower(preg_replace('~[^A-Za-z0-9]+~', '-', $text) ?? '');
    return trim($text, '-') ?: 'item';
}

function unique_slug(string $table, string $base, ?int $ignoreId = null): string
{
    $slug = slugify($base);
    $candidate = $slug;
    $i = 2;
    while (true) {
        $row = one("SELECT id FROM `$table` WHERE slug = ?" . ($ignoreId ? ' AND id <> ?' : ''), $ignoreId ? [$candidate, $ignoreId] : [$candidate]);
        if (!$row) {
            return $candidate;
        }
        $candidate = $slug . '-' . $i++;
    }
}

function fmt_date(?string $dt, string $format = 'j M Y'): string
{
    if (!$dt) {
        return '';
    }
    try {
        return (new DateTime($dt))->format($format);
    } catch (Exception) {
        return '';
    }
}

/** "Fri 14 – Sun 16 August 2026" style range */
function fmt_date_range(?string $start, ?string $end): string
{
    if (!$start) {
        return '';
    }
    $s = new DateTime($start);
    if (!$end) {
        return $s->format('l j F Y');
    }
    $en = new DateTime($end);
    if ($s->format('Y-m-d') === $en->format('Y-m-d')) {
        return $s->format('l j F Y');
    }
    if ($s->format('Y-m') === $en->format('Y-m')) {
        return $s->format('j') . '–' . $en->format('j F Y');
    }
    if ($s->format('Y') === $en->format('Y')) {
        return $s->format('j M') . ' – ' . $en->format('j M Y');
    }
    return $s->format('j M Y') . ' – ' . $en->format('j M Y');
}

function excerpt(string $html, int $len = 160): string
{
    $t = trim(preg_replace('/\s+/', ' ', html_entity_decode(strip_tags($html), ENT_QUOTES, 'UTF-8')) ?? '');
    return mb_strlen($t) > $len ? rtrim(mb_substr($t, 0, $len - 1)) . '…' : $t;
}

/** Plain text (admin-entered) → safe paragraphs */
function nl2p(string $text): string
{
    $text = trim($text);
    if ($text === '') {
        return '';
    }
    $parts = preg_split("/\R{2,}/", $text) ?: [];
    return implode('', array_map(fn($p) => '<p>' . nl2br(e(trim($p))) . '</p>', $parts));
}

/* ---------- sessions, flash, CSRF ---------- */

function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_name('tg_sess');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.gc_maxlifetime', '7200');
    session_start();
}

function flash(string $key, $value = null)
{
    start_session();
    if ($value !== null) {
        $_SESSION['_flash'][$key] = $value;
        return null;
    }
    $v = $_SESSION['_flash'][$key] ?? null;
    unset($_SESSION['_flash'][$key]);
    return $v;
}

function csrf_token(): string
{
    start_session();
    if (empty($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf'];
}

function csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(csrf_token()) . '">';
}

function csrf_valid(): bool
{
    start_session();
    $sent = $_POST['_csrf'] ?? '';
    return is_string($sent) && !empty($_SESSION['_csrf']) && hash_equals($_SESSION['_csrf'], $sent);
}

/* ---------- security helpers ---------- */

function client_ip(): string
{
    // Hostinger's CDN passes the visitor IP in these headers.
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP'] as $h) {
        if (!empty($_SERVER[$h]) && filter_var($_SERVER[$h], FILTER_VALIDATE_IP)) {
            return $_SERVER[$h];
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

function ip_hash(): string
{
    return hash_hmac('sha256', client_ip(), (string)config('app_key'));
}

/** Returns true if the bucket is still under its limit (and records a hit). */
function rate_limit(string $bucket, int $max, int $windowSeconds, bool $record = true): bool
{
    $bucket = substr($bucket, 0, 190);
    $since = date('Y-m-d H:i:s', time() - $windowSeconds);
    $count = (int)scalar('SELECT COUNT(*) FROM rate_hits WHERE bucket = ? AND created_at > ?', [$bucket, $since]);
    if ($count >= $max) {
        return false;
    }
    if ($record) {
        q('INSERT INTO rate_hits (bucket) VALUES (?)', [$bucket]);
    }
    if (random_int(1, 50) === 1) {
        q('DELETE FROM rate_hits WHERE created_at < ?', [date('Y-m-d H:i:s', time() - 86400)]);
    }
    return true;
}

function rate_clear(string $bucket): void
{
    q('DELETE FROM rate_hits WHERE bucket = ?', [substr($bucket, 0, 190)]);
}

function audit(string $action, ?string $entity = null, $entityId = null, ?string $details = null): void
{
    $uid = $_SESSION['uid'] ?? null;
    q('INSERT INTO audit_log (user_id, action, entity, entity_id, details, ip_hash) VALUES (?,?,?,?,?,?)', [
        $uid, $action, $entity, $entityId === null ? null : (string)$entityId,
        $details === null ? null : mb_substr($details, 0, 500), ip_hash(),
    ]);
}

function app_log(string $channel, string $message): void
{
    // Never pass personal data or secrets into this log.
    $line = '[' . date('c') . "] $channel: " . str_replace(["\r", "\n"], ' ', $message) . PHP_EOL;
    @file_put_contents(APP_DIR . '/storage/logs/app.log', $line, FILE_APPEND | LOCK_EX);
}

function send_security_headers(bool $admin = false): void
{
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
    $frames = "https://www.youtube.com https://www.youtube-nocookie.com https://www.facebook.com https://www.google.com https://maps.google.com https://player.vimeo.com https://w.soundcloud.com https://open.spotify.com https://www.googletagmanager.com";
    $scripts = "'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net";
    header("Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src $scripts; frame-src $frames; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.facebook.com; form-action 'self'; base-uri 'self'; object-src 'none'");
    if ($admin) {
        header('Cache-Control: no-store, private');
        header('X-Robots-Tag: noindex, nofollow');
    }
    if (!is_production()) {
        header('X-Robots-Tag: noindex, nofollow');
    }
}

/* ---------- templates ---------- */

function render(string $template, array $vars = []): string
{
    extract($vars, EXTR_SKIP);
    ob_start();
    require APP_DIR . '/templates/' . $template . '.php';
    return (string)ob_get_clean();
}

function view(string $template, array $vars = []): void
{
    echo render($template, $vars);
}

function not_found(): never
{
    http_response_code(404);
    send_security_headers();
    view('public/404', ['meta' => ['title' => 'Page not found', 'noindex' => true]]);
    exit;
}

/* ---------- links ---------- */

function is_external(string $href): bool
{
    return (bool)preg_match('~^https?://~i', $href) && !str_starts_with($href, base_url());
}

function ext_attrs(string $href): string
{
    return is_external($href) ? ' target="_blank" rel="noopener noreferrer"' : '';
}

function tel_href(string $phone): string
{
    return 'tel:' . preg_replace('/[^0-9+]/', '', $phone);
}

function wa_href(string $number, string $text = ''): string
{
    $digits = preg_replace('/\D/', '', $number);
    return 'https://wa.me/' . $digits . ($text !== '' ? '?text=' . rawurlencode($text) : '');
}

function valid_http_url(string $u): bool
{
    return (bool)filter_var($u, FILTER_VALIDATE_URL) && preg_match('~^https?://~i', $u);
}
