<?php
// STAGING ONLY. Points this copy of the site at the separate "gathering_app_staging" folder,
// which has its own config.php and its own (staging) database. Remove this file for the live site.
foreach ([dirname(__DIR__), dirname(__DIR__, 2), dirname(__DIR__, 3)] as $base) {
    if (is_file($base . '/gathering_app_staging/bootstrap.php')) {
        return $base . '/gathering_app_staging';
    }
}
return null;
