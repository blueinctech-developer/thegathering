<?php
/**
 * Front controller. Every page request (except real files like images/CSS)
 * is routed here by .htaccess. The application code lives outside public_html.
 */
define('PUBLIC_DIR', __DIR__);

// Local development server (php -S): let it serve real static files directly.
if (PHP_SAPI === 'cli-server') {
    $file = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if ($file !== __DIR__ . '/' && is_file($file) && !str_ends_with($file, '.php')) {
        return false;
    }
}

// Find the app folder. If app-location.php exists (staging copies), use ONLY what it returns,
// so a staging site can never fall back to the live site's app folder and database.
$hasLocationFile = is_file(__DIR__ . '/app-location.php');
$appDir = $hasLocationFile ? require __DIR__ . '/app-location.php' : null;
if (!$appDir && !$hasLocationFile) {
    $dir = __DIR__;
    for ($i = 0; $i < 4; $i++) {
        $dir = dirname($dir);
        if (is_file($dir . '/gathering_app/bootstrap.php')) {
            $appDir = $dir . '/gathering_app';
            break;
        }
    }
}
if (!$appDir || !is_file($appDir . '/bootstrap.php')) {
    http_response_code(503);
    echo 'Application folder not found. See docs/DEPLOYMENT.md.';
    exit;
}

require $appDir . '/bootstrap.php';
require APP_DIR . '/routes.php';
