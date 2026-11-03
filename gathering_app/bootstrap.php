<?php
declare(strict_types=1);

define('APP_DIR', __DIR__);
if (!defined('PUBLIC_DIR')) {
    define('PUBLIC_DIR', dirname(__DIR__) . '/public_html');
}

$configFile = APP_DIR . '/config/config.php';
if (!is_file($configFile)) {
    http_response_code(503);
    echo 'Site configuration missing. Copy config/config.example.php to config/config.php.';
    exit;
}
$GLOBALS['__config'] = require $configFile;

date_default_timezone_set($GLOBALS['__config']['timezone'] ?? 'UTC');
mb_internal_encoding('UTF-8');

$isLocal = ($GLOBALS['__config']['env'] ?? 'production') === 'local';
ini_set('display_errors', $isLocal ? '1' : '0');
ini_set('log_errors', '1');
@mkdir(APP_DIR . '/storage/logs', 0755, true);
ini_set('error_log', APP_DIR . '/storage/logs/php-error.log');
error_reporting(E_ALL);

require APP_DIR . '/src/core.php';
require APP_DIR . '/src/sanitize.php';
require APP_DIR . '/src/media.php';
require APP_DIR . '/src/mail.php';
require APP_DIR . '/src/auth.php';
require APP_DIR . '/src/forms.php';
require APP_DIR . '/src/content.php';
