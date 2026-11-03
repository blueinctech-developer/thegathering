<?php
declare(strict_types=1);

require APP_DIR . '/admin/resources.php';
require APP_DIR . '/admin/crud.php';
require APP_DIR . '/admin/controllers.php';

send_security_headers(true);
try {
    db();
} catch (PDOException $ex) {
    app_log('db', 'connection failed: ' . $ex->getMessage());
    http_response_code(503);
    echo 'Database unavailable. Check config.php database settings.';
    exit;
}
start_session();

$p = substr(request_path(), strlen('/admin')) ?: '/';
$p = '/' . trim($p, '/');
$post = is_post();

// Pages that work without signing in
switch ($p) {
    case '/login': admin_login(); exit;
    case '/logout': if ($post) { admin_csrf(); audit('logout', 'user', current_user()['id'] ?? null); logout_user(); } redirect('/admin/login');
    case '/forgot': admin_forgot(); exit;
    case '/reset': admin_reset(); exit;
    case '/setup': admin_setup(); exit;
}

require_login();

$seg = explode('/', trim($p, '/'));
$resources = admin_resources();

// Generic content types: /admin/{key}, /admin/{key}/new, /admin/{key}/{id}, /admin/{key}/{id}/delete|up|down
if (isset($resources[$seg[0]])) {
    $key = $seg[0];
    $id = $seg[1] ?? null;
    $action = $seg[2] ?? null;
    if ($id === null) crud_list($key);
    elseif ($id === 'new') crud_edit($key, null);
    elseif (ctype_digit($id) && $action === null) crud_edit($key, (int)$id);
    elseif (ctype_digit($id) && $action === 'delete' && $post) crud_delete($key, (int)$id);
    elseif (ctype_digit($id) && in_array($action, ['up', 'down'], true) && $post) crud_move($key, (int)$id, $action);
    elseif ($key === 'albums' && ctype_digit($id) && $action === 'upload' && $post) admin_album_upload((int)$id);
    elseif ($key === 'albums' && ctype_digit($id) && $action === 'photos' && $post) admin_photos_save((int)$id);
    elseif ($key === 'testimonies' && ctype_digit($id) && $action === 'status' && $post) admin_testimony_status((int)$id);
    else not_found_admin();
    exit;
}

match (true) {
    $p === '/' => admin_dashboard(),
    $p === '/settings' => admin_settings(),
    $p === '/schedule' => admin_schedule(),
    $p === '/submissions' => admin_submissions(),
    $p === '/submissions/export' => admin_submissions_export(),
    (bool)preg_match('~^/submissions/(\d+)$~', $p, $m) => admin_submission((int)$m[1]),
    $p === '/emails' => admin_emails(),
    $p === '/media' => admin_media(),
    $p === '/users' => admin_users(),
    (bool)preg_match('~^/users/(\d+|new)$~', $p, $m) => admin_user_edit($m[1] === 'new' ? null : (int)$m[1]),
    $p === '/account' => admin_account(),
    $p === '/audit' => admin_audit(),
    default => not_found_admin(),
};
