<?php
/**
 * Build the upload packages in dist/:
 *   thegathering-staging.zip     → gathering_app_staging/ + staging_public/ (with app-location.php)
 *   thegathering-production.zip  → gathering_app/ + production_public/
 * Never includes config.php, logs, test emails or uploaded files.
 * Usage: php tools/build_package.php
 */
$root = dirname(__DIR__);
$dist = "$root/dist";
@mkdir($dist, 0755, true);

function should_skip(string $rel): bool
{
    $rel = str_replace('\\', '/', $rel);
    $skip = [
        '~^gathering_app/config/config\.php$~',
        '~^gathering_app/storage/logs/(?!\.keep$).+~',
        '~^gathering_app/storage/mail/(?!\.keep$).+~',
        '~^public_html/app-location\.php$~',
        '~(^|/)\.DS_Store$~',
        '~(^|/)Thumbs\.db$~',
    ];
    foreach ($skip as $re) {
        if (preg_match($re, $rel)) return true;
    }
    return false;
}

function add_tree(ZipArchive $zip, string $root, string $src, string $dest, array &$manifest): void
{
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator("$root/$src", FilesystemIterator::SKIP_DOTS));
    foreach ($it as $file) {
        $rel = substr(str_replace('\\', '/', $file->getPathname()), strlen(str_replace('\\', '/', $root)) + 1);
        if (should_skip($rel)) continue;
        $target = $dest . substr($rel, strlen($src));
        $zip->addFile($file->getPathname(), $target);
        $manifest[] = $target;
    }
}

foreach (['staging', 'production'] as $kind) {
    $zipPath = "$dist/thegathering-$kind.zip";
    @unlink($zipPath);
    $zip = new ZipArchive();
    $zip->open($zipPath, ZipArchive::CREATE);
    $manifest = [];
    $app = $kind === 'staging' ? 'gathering_app_staging' : 'gathering_app';
    $pub = $kind === 'staging' ? 'staging_public' : 'production_public';
    add_tree($zip, $root, 'gathering_app', $app, $manifest);
    add_tree($zip, $root, 'public_html', $pub, $manifest);
    if ($kind === 'staging') {
        $zip->addFile("$root/tools/staging/app-location.php", "$pub/app-location.php");
        $manifest[] = "$pub/app-location.php";
    }
    $zip->addFromString('README-UPLOAD.txt', "See docs/DEPLOYMENT.md.\n\n$app/  -> place NEXT TO public_html (never inside it)\n$pub/ -> move its contents (including hidden .htaccess) into "
        . ($kind === 'staging' ? "the staging subdomain folder (e.g. public_html/new)" : "public_html") . "\nThen create $app/config/config.php from config.example.php.\n");
    $zip->close();
    // Safety check: no secrets in the package
    $bad = array_filter($manifest, fn($m) => preg_match('~config/config\.php$|\.log$|\.eml$~', $m));
    printf("%-30s %4d files  %6.1f KB%s\n", basename($zipPath), count($manifest), filesize($zipPath) / 1024, $bad ? '  !! CONTAINS: ' . implode(', ', $bad) : '  (no config/logs; includes site photos)');
}
