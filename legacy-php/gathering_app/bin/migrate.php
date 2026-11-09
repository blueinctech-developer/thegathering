<?php
/**
 * Apply any SQL files in sql/ that have not been applied yet.
 * Usage: php bin/migrate.php
 * (On Hostinger without SSH, import the files in order with phpMyAdmin instead.)
 */
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require dirname(__DIR__) . '/bootstrap.php';

$pdo = db();
$hasTable = (bool)scalar("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'schema_migrations'");
$applied = $hasTable ? array_column(all('SELECT version FROM schema_migrations'), 'version') : [];

$files = glob(APP_DIR . '/sql/*.sql');
sort($files);
foreach ($files as $file) {
    $version = basename($file, '.sql');
    if (in_array($version, $applied, true)) {
        echo "skip  $version\n";
        continue;
    }
    $sql = file_get_contents($file);
    // Split on semicolons at line ends (our SQL files contain no procedures).
    $statements = array_filter(array_map('trim', preg_split('/;\s*\R/', $sql)));
    foreach ($statements as $st) {
        if ($st === '' || str_starts_with($st, '--') && !str_contains($st, "\n")) continue;
        $pdo->exec($st);
    }
    echo "apply $version\n";
}
echo "Done.\n";
