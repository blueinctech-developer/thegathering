<?php
/**
 * Copy this file to config.php (same folder) and fill in real values.
 * This folder lives OUTSIDE public_html, so it is never served to visitors.
 * Never commit or email config.php - it holds passwords.
 */
return [
    // 'production' on the live domain, 'staging' on new.thegatheringcof.org, 'local' for development.
    // Anything other than 'production' sends "noindex" so search engines ignore it.
    'env' => 'production',

    // Full public URL with no trailing slash.
    'base_url' => 'https://thegatheringcof.org',

    // Timezone used for event dates and the countdown.
    // Use a PHP timezone name, e.g. 'Africa/Lagos', 'Europe/London', 'America/New_York'. CONFIRM before launch.
    'timezone' => 'UTC',

    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'u000000000_gathering',   // from hPanel > Databases
        'user' => 'u000000000_gathering',
        'pass' => 'CHANGE_ME',
    ],

    'mail' => [
        // 'smtp' for real sending. 'file' writes emails to storage/mail (local testing only).
        'transport'  => 'smtp',
        'host'       => 'smtp.hostinger.com',
        'port'       => 465,
        'encryption' => 'ssl',               // 'ssl' (port 465) or 'tls' (port 587) or '' (local sink)
        'username'   => 'noreply@thegatheringcof.org',
        'password'   => 'CHANGE_ME',
        'from_email' => 'noreply@thegatheringcof.org',
        'from_name'  => 'The Gathering',
    ],

    // Long random string. Generate one with: php -r "echo bin2hex(random_bytes(32));"
    'app_key' => 'CHANGE_ME_TO_A_LONG_RANDOM_STRING',

    // Needed once, to create the first administrator at /admin/setup. Remove after setup.
    'setup_token' => 'CHANGE_ME_ONE_TIME_TOKEN',

    // Secret for the web cron URL (/cron/mail?key=...). Leave blank to allow CLI cron only.
    'cron_key' => '',
];
