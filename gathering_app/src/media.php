<?php
declare(strict_types=1);

const MEDIA_WIDTHS = [480, 960, 1600];
const MEDIA_MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MEDIA_MAX_DOC_BYTES = 25 * 1024 * 1024;

/**
 * Handle one entry from $_FILES. Returns ['id'=>int] or ['error'=>string].
 */
function media_upload(array $file, ?string $alt = null, string $allow = 'image'): array
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        $map = [
            UPLOAD_ERR_INI_SIZE => 'The file is larger than the server allows.',
            UPLOAD_ERR_FORM_SIZE => 'The file is too large.',
            UPLOAD_ERR_PARTIAL => 'The upload was interrupted. Please try again.',
            UPLOAD_ERR_NO_FILE => 'No file was chosen.',
        ];
        return ['error' => $map[$file['error'] ?? 4] ?? 'Upload failed.'];
    }
    if (!is_uploaded_file($file['tmp_name'])) {
        return ['error' => 'Upload failed.'];
    }
    return media_store($file['tmp_name'], (string)($file['name'] ?? 'file'), $alt, $allow);
}

/** Store a file already on disk (used by uploads and by the asset import script). */
function media_store(string $tmpPath, string $originalName, ?string $alt = null, string $allow = 'image'): array
{
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string)$finfo->file($tmpPath);
    $size = (int)filesize($tmpPath);
    $imageTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
    $docTypes = ['application/pdf' => 'pdf'];

    $isImage = isset($imageTypes[$mime]);
    $isDoc = isset($docTypes[$mime]);
    if ($allow === 'image' && !$isImage) {
        return ['error' => 'Please upload a JPG, PNG, WebP or GIF image.'];
    }
    if ($allow === 'document' && !$isDoc) {
        return ['error' => 'Please upload a PDF document.'];
    }
    if ($allow === 'any' && !$isImage && !$isDoc) {
        return ['error' => 'Only images (JPG, PNG, WebP, GIF) and PDF files are allowed.'];
    }
    if ($isImage && $size > MEDIA_MAX_IMAGE_BYTES) {
        return ['error' => 'Images must be under 15 MB.'];
    }
    if ($isDoc && $size > MEDIA_MAX_DOC_BYTES) {
        return ['error' => 'Documents must be under 25 MB.'];
    }

    $sub = 'uploads/' . date('Y/m');
    $dir = PUBLIC_DIR . '/' . $sub;
    if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
        return ['error' => 'Could not create the upload folder.'];
    }
    $base = bin2hex(random_bytes(8));
    $uid = $_SESSION['uid'] ?? null;

    if ($isDoc) {
        // Keep a readable, safe name for downloads.
        $nice = slugify(pathinfo($originalName, PATHINFO_FILENAME));
        $rel = "$sub/$nice-$base.pdf";
        if (!copy($tmpPath, PUBLIC_DIR . '/' . $rel)) {
            return ['error' => 'Could not save the file.'];
        }
        q('INSERT INTO media (path, kind, original_name, mime, bytes, alt, uploaded_by) VALUES (?,?,?,?,?,?,?)',
            [$rel, 'document', mb_substr($originalName, 0, 255), $mime, $size, $alt, $uid]);
        return ['id' => last_id(), 'path' => $rel];
    }

    $img = match ($mime) {
        'image/jpeg' => @imagecreatefromjpeg($tmpPath),
        'image/png' => @imagecreatefrompng($tmpPath),
        'image/webp' => @imagecreatefromwebp($tmpPath),
        'image/gif' => @imagecreatefromgif($tmpPath),
    };
    if (!$img) {
        return ['error' => 'That image could not be read. Please try a different file.'];
    }
    if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
        $exif = @exif_read_data($tmpPath);
        $o = (int)($exif['Orientation'] ?? 1);
        $img = match ($o) {
            3 => imagerotate($img, 180, 0),
            6 => imagerotate($img, -90, 0),
            8 => imagerotate($img, 90, 0),
            default => $img,
        };
    }
    $hasAlpha = in_array($mime, ['image/png', 'image/webp', 'image/gif'], true) && image_has_alpha($img);
    $ext = $hasAlpha ? 'png' : 'jpg';

    // Master copy: re-encoded (removes any embedded payload/metadata), max 2400px wide.
    $master = image_resize($img, 2400);
    $w = imagesx($master);
    $h = imagesy($master);
    $rel = "$sub/$base.$ext";
    image_save($master, PUBLIC_DIR . '/' . $rel, $ext);
    image_save($master, PUBLIC_DIR . "/$sub/$base.webp", 'webp');

    $made = [];
    foreach (MEDIA_WIDTHS as $vw) {
        if ($vw >= $w) {
            continue;
        }
        $v = image_resize($master, $vw);
        image_save($v, PUBLIC_DIR . "/$sub/$base-$vw.$ext", $ext);
        image_save($v, PUBLIC_DIR . "/$sub/$base-$vw.webp", 'webp');
        $made[] = $vw;
        if ($v !== $master) {
            imagedestroy($v);
        }
    }
    q('INSERT INTO media (path, kind, original_name, mime, bytes, width, height, variants, alt, uploaded_by) VALUES (?,?,?,?,?,?,?,?,?,?)', [
        $rel, 'image', mb_substr($originalName, 0, 255), $ext === 'png' ? 'image/png' : 'image/jpeg',
        (int)filesize(PUBLIC_DIR . '/' . $rel), $w, $h, implode(',', $made), $alt, $uid,
    ]);
    return ['id' => last_id(), 'path' => $rel];
}

function image_has_alpha(GdImage $img): bool
{
    $w = imagesx($img);
    $h = imagesy($img);
    $step = max(1, (int)floor(min($w, $h) / 40));
    for ($x = 0; $x < $w; $x += $step) {
        for ($y = 0; $y < $h; $y += $step) {
            if (((imagecolorat($img, $x, $y) >> 24) & 0x7F) > 0) {
                return true;
            }
        }
    }
    return false;
}

function image_resize(GdImage $img, int $maxW): GdImage
{
    $w = imagesx($img);
    $h = imagesy($img);
    if ($w <= $maxW) {
        return $img;
    }
    $nh = (int)round($h * $maxW / $w);
    $out = imagecreatetruecolor($maxW, $nh);
    imagealphablending($out, false);
    imagesavealpha($out, true);
    imagecopyresampled($out, $img, 0, 0, 0, 0, $maxW, $nh, $w, $h);
    return $out;
}

function image_save(GdImage $img, string $path, string $ext): void
{
    match ($ext) {
        'png' => (function () use ($img, $path) { imagesavealpha($img, true); imagepng($img, $path, 7); })(),
        'webp' => (function () use ($img, $path) { imagesavealpha($img, true); imagewebp($img, $path, 80); })(),
        default => (function () use ($img, $path) {
            // flatten onto white for JPEG
            $w = imagesx($img); $h = imagesy($img);
            $bg = imagecreatetruecolor($w, $h);
            imagefill($bg, 0, 0, imagecolorallocate($bg, 255, 255, 255));
            imagecopy($bg, $img, 0, 0, 0, 0, $w, $h);
            imageinterlace($bg, true);
            imagejpeg($bg, $path, 82);
            imagedestroy($bg);
        })(),
    };
}

function media_get(?int $id): ?array
{
    static $cache = [];
    if (!$id) {
        return null;
    }
    if (!array_key_exists($id, $cache)) {
        $cache[$id] = one('SELECT * FROM media WHERE id = ?', [$id]);
    }
    return $cache[$id];
}

/** Public URL of a media item; $width picks the closest generated variant. */
function media_url($idOrRow, ?int $width = null, bool $absolute = false): string
{
    $m = is_array($idOrRow) ? $idOrRow : media_get($idOrRow ? (int)$idOrRow : null);
    if (!$m) {
        return '';
    }
    $path = $m['path'];
    if ($width && $m['kind'] === 'image' && $m['variants']) {
        foreach (explode(',', $m['variants']) as $vw) {
            if ((int)$vw >= $width) {
                $path = preg_replace('/\.(jpg|png)$/', "-$vw.$1", $m['path']);
                break;
            }
        }
    }
    return ($absolute ? base_url() : '') . '/' . $path;
}

/** Responsive <picture> with WebP + JPEG/PNG fallback. */
function picture($idOrRow, string $alt, string $sizes = '100vw', string $class = '', bool $eager = false): string
{
    $m = is_array($idOrRow) ? $idOrRow : media_get($idOrRow ? (int)$idOrRow : null);
    if (!$m || $m['kind'] !== 'image') {
        return '';
    }
    $ext = pathinfo($m['path'], PATHINFO_EXTENSION);
    $stem = substr($m['path'], 0, -strlen($ext) - 1);
    $widths = array_filter(array_map('intval', explode(',', (string)$m['variants'])));
    $webp = [];
    $fall = [];
    foreach ($widths as $w) {
        $webp[] = "/$stem-$w.webp {$w}w";
        $fall[] = "/$stem-$w.$ext {$w}w";
    }
    $webp[] = "/$stem.webp {$m['width']}w";
    $fall[] = "/$stem.$ext {$m['width']}w";
    $alt = $alt !== '' ? $alt : (string)$m['alt'];
    return '<picture' . ($class ? ' class="' . e($class) . '"' : '') . '>'
        . '<source type="image/webp" srcset="' . e(implode(', ', $webp)) . '" sizes="' . e($sizes) . '">'
        . '<img src="/' . e($m['path']) . '" srcset="' . e(implode(', ', $fall)) . '" sizes="' . e($sizes) . '"'
        . ' width="' . (int)$m['width'] . '" height="' . (int)$m['height'] . '" alt="' . e($alt) . '"'
        . ($eager ? ' fetchpriority="high"' : ' loading="lazy"') . ' decoding="async">'
        . '</picture>';
}

/** Delete files for a media row (all variants) and the row itself. */
function media_delete(int $id): void
{
    $m = media_get($id);
    if (!$m) {
        return;
    }
    $ext = pathinfo($m['path'], PATHINFO_EXTENSION);
    $stem = substr($m['path'], 0, -strlen($ext) - 1);
    $files = [PUBLIC_DIR . '/' . $m['path'], PUBLIC_DIR . "/$stem.webp"];
    foreach (array_filter(explode(',', (string)$m['variants'])) as $w) {
        $files[] = PUBLIC_DIR . "/$stem-$w.$ext";
        $files[] = PUBLIC_DIR . "/$stem-$w.webp";
    }
    foreach ($files as $f) {
        if (is_file($f) && str_starts_with(realpath($f) ?: '', realpath(PUBLIC_DIR . '/uploads') ?: '/nonexistent')) {
            @unlink($f);
        }
    }
    q('DELETE FROM media WHERE id = ?', [$id]);
}
