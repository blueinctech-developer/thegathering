<?php
/**
 * Create an administrator from the command line.
 * Usage: php bin/create-admin.php "Full Name" email@example.org
 * You will be asked for the password (it is not shown or stored in your shell history).
 */
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require dirname(__DIR__) . '/bootstrap.php';

[$self, $name, $email] = array_pad($argv, 3, null);
if (!$name || !$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Usage: php bin/create-admin.php \"Full Name\" email@example.org\n");
    exit(1);
}
$pw = getenv('ADMIN_PASSWORD') ?: null;
if (!$pw) {
    echo 'Password: ';
    $pw = trim((string)fgets(STDIN));
}
if ($err = password_problem($pw)) {
    fwrite(STDERR, "$err\n");
    exit(1);
}
q('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)', [$name, mb_strtolower($email), password_hash($pw, PASSWORD_DEFAULT), 'admin']);
echo "Administrator created: $email\n";
