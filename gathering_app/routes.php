<?php
declare(strict_types=1);

$path = request_path();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Normalise: strip trailing slash and ".php"/".html" from old-style URLs.
if ($path !== '/' && preg_match('~^(.+?)(?:/|\.php|\.html?)$~', parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '', $m)
    && !str_starts_with($path, '/admin') && $method === 'GET' && $m[1] !== '/index') {
    $qs = $_SERVER['QUERY_STRING'] ?? '';
    redirect($m[1] . ($qs !== '' ? "?$qs" : ''), 301);
}
if ($path === '/index') {
    redirect('/', 301);
}

if (str_starts_with($path, '/admin')) {
    require APP_DIR . '/admin/routes.php';
    exit;
}

try {
    db();
} catch (PDOException $ex) {
    app_log('db', 'connection failed: ' . $ex->getMessage());
    http_response_code(503);
    header('Retry-After: 300');
    echo render('public/maintenance');
    exit;
}

send_security_headers();

/** Simple pattern router: returns captured params or null. */
function route_match(string $pattern, string $path): ?array
{
    $re = '~^' . preg_replace('~\{(\w+)\}~', '(?P<$1>[a-z0-9-]+)', $pattern) . '$~i';
    if (preg_match($re, $path, $m)) {
        return array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);
    }
    return null;
}

// Form submissions
if ($method === 'POST') {
    if ($p = route_match('/forms/{type}', $path)) {
        form_handle($p['type']);
    }
    http_response_code(405);
    exit;
}

$routes = [
    '/' => 'home',
    '/about' => 'about',
    '/outreach' => 'outreach',
    '/speakers' => 'speakers',
    '/speakers/{slug}' => 'speaker',
    '/schedule' => 'schedule',
    '/register' => 'register',
    '/venue' => 'venue',
    '/media' => 'media',
    '/gallery' => 'gallery',
    '/gallery/{slug}' => 'album',
    '/news' => 'news',
    '/news/{slug}' => 'post',
    '/give' => 'give',
    '/volunteer' => 'volunteer',
    '/prayer' => 'prayer',
    '/testimonies' => 'testimonies',
    '/faqs' => 'faqs',
    '/contact' => 'contact',
    '/privacy' => 'privacy',
    '/robots.txt' => 'robots',
    '/sitemap.xml' => 'sitemap',
    '/cron/mail' => 'cron_mail',
];

foreach ($routes as $pattern => $handler) {
    $params = route_match($pattern, $path);
    if ($params !== null) {
        require APP_DIR . '/controllers/public.php';
        $fn = 'page_' . $handler;
        $fn($params);
        exit;
    }
}

// Saved redirects (old URLs → new URLs), managed in Admin > Redirects.
$r = one('SELECT * FROM redirects WHERE from_path = ?', [$path]);
if ($r) {
    q('UPDATE redirects SET hits = hits + 1 WHERE id = ?', [$r['id']]);
    redirect($r['to_path'], (int)$r['code'] === 302 ? 302 : 301);
}

// Custom pages created in the admin (e.g. /our-history)
if (preg_match('~^/([a-z0-9-]+)$~', $path, $m)) {
    $page = page_get($m[1]);
    if ($page && (int)$page['is_published'] === 1 && (int)$page['is_system'] === 0) {
        view('public/page', ['page' => $page, 'meta' => [
            'title' => $page['meta_title'] ?: $page['title'],
            'description' => $page['meta_description'] ?: excerpt((string)($page['intro'] ?: $page['body'])),
            'image' => $page['hero_media_id'] ? media_url((int)$page['hero_media_id'], 1600, true) : '',
        ]]);
        exit;
    }
}

not_found();
