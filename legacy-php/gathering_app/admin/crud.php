<?php
declare(strict_types=1);

function crud_def(string $key): array
{
    $defs = admin_resources();
    if (!isset($defs[$key])) not_found_admin();
    $d = $defs[$key];
    require_login($d['role'] ?? 'editor');
    $d['key'] = $key;
    return $d;
}

function crud_field(array $f): array
{
    return ['name' => $f[0], 'label' => $f[1], 'type' => $f[2], 'o' => $f[3] ?? []];
}

function crud_options(array $o): array
{
    $opts = $o['options'] ?? [];
    return is_callable($opts) ? $opts() : $opts;
}

function crud_list(string $key): void
{
    $d = crud_def($key);
    if (empty($d['list'])) {
        redirect($d['back'] ?? '/admin');
    }
    $where = [];
    $params = [];
    $qText = get('q');
    if ($qText !== '' && !empty($d['search'])) {
        $where[] = '(' . implode(' OR ', array_map(fn($c) => "`$c` LIKE ?", $d['search'])) . ')';
        foreach ($d['search'] as $c) $params[] = '%' . $qText . '%';
    }
    foreach ($d['filter'] ?? [] as $col => $opts) {
        $v = get($col);
        if ($v !== '' && isset($opts[$v])) {
            $where[] = "`$col` = ?";
            $params[] = $v;
        }
    }
    $base = $d['list_sql'] ?? "SELECT * FROM `{$d['table']}`";
    $sql = "SELECT * FROM ($base) t" . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . " ORDER BY {$d['order']} LIMIT 500";
    $rows = all($sql, $params);
    admin_view('admin/crud_list', ['d' => $d, 'rows' => $rows, 'title' => $d['title']]);
}

function crud_edit(string $key, ?int $id): void
{
    $d = crud_def($key);
    $row = null;
    if ($id !== null) {
        $row = one("SELECT * FROM `{$d['table']}` WHERE id = ?", [$id]);
        if (!$row) not_found_admin();
    }
    $errors = [];
    if (is_post()) {
        admin_csrf();
        [$data, $errors] = crud_collect($d, $row);
        if (!$errors) {
            try {
                if (isset($d['before_save'])) $data = $d['before_save']($data, $id);
                if ($id === null) {
                    $cols = array_keys($data);
                    q("INSERT INTO `{$d['table']}` (`" . implode('`,`', $cols) . '`) VALUES (' . implode(',', array_fill(0, count($cols), '?')) . ')', array_values($data));
                    $id = last_id();
                    audit('create', $key, $id, $data['title'] ?? $data['name'] ?? $data['question'] ?? $data['label'] ?? null);
                } else {
                    $sets = implode(', ', array_map(fn($c) => "`$c` = ?", array_keys($data)));
                    q("UPDATE `{$d['table']}` SET $sets WHERE id = ?", [...array_values($data), $id]);
                    audit('update', $key, $id, $data['title'] ?? $data['name'] ?? $data['question'] ?? $data['label'] ?? null);
                }
                if (isset($d['after_save'])) $d['after_save']($id, $data);
                flash('ok', ucfirst($d['singular']) . ' saved.');
                redirect(post('_after') === 'list' ? ($d['back'] ?? "/admin/$key") : "/admin/$key/$id");
            } catch (InvalidArgumentException $ex) {
                $errors['_form'] = $ex->getMessage();
            } catch (PDOException $ex) {
                if ((int)($ex->errorInfo[1] ?? 0) === 1062) {
                    $errors['_form'] = 'Something with the same web address or value already exists. Please change it.';
                } else {
                    app_log('admin', 'save failed: ' . $ex->getMessage());
                    $errors['_form'] = 'Could not save. Please try again.';
                }
            }
        }
        $row = array_merge($row ?? [], $_POST);
    }
    if ($row === null) {
        $row = [];
        foreach ($d['fields'] as $f) {
            $f = crud_field($f);
            $row[$f['name']] = $_GET[$f['name']] ?? ($f['o']['default'] ?? '');
        }
    }
    $title = $id ? 'Edit ' . $d['singular'] : 'Add ' . $d['singular'];
    admin_view('admin/crud_edit', ['d' => $d, 'row' => $row, 'id' => $id, 'errors' => $errors, 'title' => $title]);
}

/** Read and validate POSTed fields. Returns [data, errors]. */
function crud_collect(array $d, ?array $existing): array
{
    $data = [];
    $errors = [];
    foreach ($d['fields'] as $raw) {
        $f = crud_field($raw);
        $n = $f['name'];
        $o = $f['o'];
        switch ($f['type']) {
            case 'checkbox':
                $data[$n] = isset($_POST[$n]) ? 1 : 0;
                break;
            case 'image':
            case 'document':
                $current = $existing[$n] ?? null;
                $file = $_FILES[$n] ?? null;
                if ($file && ($file['error'] ?? 4) !== UPLOAD_ERR_NO_FILE) {
                    $res = media_upload($file, post($n . '_alt') ?: null, $f['type']);
                    if (isset($res['error'])) {
                        $errors[$n] = $res['error'];
                        $data[$n] = $current;
                    } else {
                        $data[$n] = $res['id'];
                    }
                } elseif (isset($_POST[$n . '_remove'])) {
                    $data[$n] = null;
                } elseif (post($n . '_pick') !== '' && ctype_digit(post($n . '_pick'))) {
                    $data[$n] = (int)post($n . '_pick');
                } else {
                    $data[$n] = $current;
                }
                if ($f['type'] === 'image' && $data[$n] && isset($_POST[$n . '_alt'])) {
                    q('UPDATE media SET alt = ? WHERE id = ?', [mb_substr(post($n . '_alt'), 0, 255) ?: null, $data[$n]]);
                }
                break;
            case 'richtext':
                $data[$n] = clean_html((string)($_POST[$n] ?? ''));
                break;
            case 'number':
                $v = post($n);
                if ($v !== '' && !preg_match('/^-?\d+$/', $v)) $errors[$n] = 'Please enter a whole number.';
                $data[$n] = $v === '' ? ($n === 'sort_order' ? 0 : null) : (int)$v;
                break;
            case 'datetime':
                $v = post($n);
                $data[$n] = $v === '' ? null : date('Y-m-d H:i:s', strtotime($v) ?: time());
                break;
            case 'date':
                $v = post($n);
                $data[$n] = $v === '' ? null : (preg_match('/^\d{4}-\d{2}-\d{2}$/', $v) ? $v : null);
                break;
            case 'time':
                $v = post($n);
                $data[$n] = $v === '' ? null : (preg_match('/^\d{2}:\d{2}/', $v) ? substr($v, 0, 5) . ':00' : null);
                break;
            case 'select':
                $v = post($n);
                $opts = crud_options($o);
                if ($v !== '' && !array_key_exists($v, $opts)) $errors[$n] = 'Please choose a valid option.';
                $data[$n] = $v === '' ? null : $v;
                break;
            case 'url':
                $v = post($n);
                if ($v !== '' && !valid_http_url($v)) $errors[$n] = 'Please enter a full link starting with https://';
                $data[$n] = $v === '' ? null : $v;
                break;
            case 'slug':
                if (!empty($o['lock_if_system']) && !empty($existing['is_system'])) {
                    continue 2;
                }
                $v = post($n);
                $src = post($o['from'] ?? 'title');
                $data[$n] = unique_slug($d['table'], $v !== '' ? $v : $src, $existing['id'] ?? null);
                break;
            default:
                $v = post($n);
                $data[$n] = $v === '' ? null : $v;
        }
        if (!empty($o['required']) && ($data[$n] === null || $data[$n] === '') && !isset($errors[$n])) {
            $errors[$n] = 'This is required.';
        }
    }
    return [$data, $errors];
}

function crud_delete(string $key, int $id): void
{
    $d = crud_def($key);
    admin_csrf();
    $row = one("SELECT * FROM `{$d['table']}` WHERE id = ?", [$id]);
    if (!$row) not_found_admin();
    if (isset($d['no_delete_if']) && $d['no_delete_if']($row)) {
        flash('err', 'This built-in item cannot be deleted. You can unpublish it instead.');
        redirect("/admin/$key/$id");
    }
    q("DELETE FROM `{$d['table']}` WHERE id = ?", [$id]);
    audit('delete', $key, $id, $row['title'] ?? $row['name'] ?? $row['question'] ?? $row['label'] ?? null);
    flash('ok', ucfirst($d['singular']) . ' deleted.');
    redirect($d['back'] ?? "/admin/$key");
}

function crud_move(string $key, int $id, string $dir): void
{
    $d = crud_def($key);
    admin_csrf();
    $rows = all("SELECT id FROM `{$d['table']}` ORDER BY {$d['order']}");
    $ids = array_map('intval', array_column($rows, 'id'));
    $i = array_search($id, $ids, true);
    if ($i !== false) {
        $j = $dir === 'up' ? $i - 1 : $i + 1;
        if (isset($ids[$j])) {
            [$ids[$i], $ids[$j]] = [$ids[$j], $ids[$i]];
        }
        foreach ($ids as $pos => $rid) {
            q("UPDATE `{$d['table']}` SET sort_order = ? WHERE id = ?", [$pos * 10, $rid]);
        }
    }
    redirect($d['back'] ?? "/admin/$key");
}

/** Render one form field for the admin editor. */
function crud_input(array $raw, array $row, array $errors): string
{
    $f = crud_field($raw);
    $n = $f['name'];
    $o = $f['o'];
    $id = 'f-' . $n;
    $v = $row[$n] ?? '';
    $err = $errors[$n] ?? null;
    $req = !empty($o['required']) ? ' required' : '';
    $help = !empty($o['help']) ? '<p class="help">' . e($o['help']) . '</p>' : '';
    $errHtml = $err ? '<p class="field-error">' . e($err) . '</p>' : '';
    $label = '<label for="' . $id . '">' . e($f['label']) . (!empty($o['required']) ? ' <span class="req">*</span>' : '') . '</label>';
    $cls = 'field' . ($err ? ' has-error' : '') . (in_array($f['type'], ['richtext', 'textarea', 'image', 'document'], true) ? ' field--wide' : '');

    switch ($f['type']) {
        case 'checkbox':
            return '<div class="field field--check field--wide"><label><input type="checkbox" name="' . $n . '" value="1"' . ((string)$v === '1' ? ' checked' : '') . '> ' . e($f['label']) . '</label>' . $help . '</div>';
        case 'textarea':
            return "<div class=\"$cls\">$label<textarea id=\"$id\" name=\"$n\" rows=\"5\"$req>" . e($v) . "</textarea>$help$errHtml</div>";
        case 'richtext':
            return "<div class=\"$cls\">$label" . '<div class="rte" data-rte><div class="rte__bar" role="toolbar" aria-label="Formatting">'
                . '<button type="button" data-cmd="bold" title="Bold"><b>B</b></button><button type="button" data-cmd="italic" title="Italic"><i>I</i></button>'
                . '<button type="button" data-cmd="h2" title="Heading">H2</button><button type="button" data-cmd="h3" title="Sub-heading">H3</button>'
                . '<button type="button" data-cmd="insertUnorderedList" title="Bullet list">• List</button><button type="button" data-cmd="insertOrderedList" title="Numbered list">1. List</button>'
                . '<button type="button" data-cmd="blockquote" title="Quote">❝</button><button type="button" data-cmd="link" title="Add link">Link</button>'
                . '<button type="button" data-cmd="unlink" title="Remove link">Unlink</button><button type="button" data-cmd="removeFormat" title="Clear formatting">Clear</button>'
                . '<button type="button" data-cmd="source" title="Edit HTML">&lt;/&gt;</button></div>'
                . '<div class="rte__area" contenteditable="true" aria-labelledby="' . $id . '-l">' . clean_html((string)$v) . '</div>'
                . "<textarea id=\"$id\" name=\"$n\" class=\"rte__src\" hidden>" . e(clean_html((string)$v)) . "</textarea></div>$help$errHtml</div>";
        case 'select':
            $h = "<div class=\"$cls\">$label<select id=\"$id\" name=\"$n\"$req>";
            $opts = crud_options($o);
            if (empty($o['required']) && !isset($opts[''])) $h .= '<option value="">None</option>';
            foreach ($opts as $k => $lab) {
                $h .= '<option value="' . e((string)$k) . '"' . ((string)$k === (string)$v ? ' selected' : '') . '>' . e($lab) . '</option>';
            }
            return $h . "</select>$help$errHtml</div>";
        case 'image':
        case 'document':
            $m = $v ? media_get((int)$v) : null;
            $h = "<div class=\"$cls\">$label<div class=\"upload\">";
            if ($m && $f['type'] === 'image') {
                $h .= '<img class="upload__preview" src="' . e(media_url($m, 480)) . '" alt="">';
            } elseif ($m) {
                $h .= '<a class="upload__doc" href="' . e(media_url($m)) . '" target="_blank">' . e($m['original_name'] ?: basename($m['path'])) . '</a>';
            }
            $h .= '<div class="upload__controls"><input type="file" id="' . $id . '" name="' . $n . '" accept="' . ($f['type'] === 'image' ? 'image/jpeg,image/png,image/webp,image/gif' : 'application/pdf') . '">';
            $h .= '<p class="help">' . ($m ? 'Choose a new file to replace the current one.' : 'Choose a file to upload.') . ' ' . ($f['type'] === 'image' ? 'JPG, PNG or WebP, up to 15 MB.' : 'PDF, up to 25 MB.') . '</p>';
            if ($f['type'] === 'image') {
                $h .= '<label class="sub-label" for="' . $id . '-alt">Image description (alt text)</label><input type="text" id="' . $id . '-alt" name="' . $n . '_alt" value="' . e($m['alt'] ?? '') . '" placeholder="Describe the photo for people using screen readers">';
                $h .= '<p class="help"><a href="/admin/media?pick=' . e($n) . '" target="_blank" rel="opener">Or choose from the media library</a> and paste its number here: <input type="text" name="' . $n . '_pick" inputmode="numeric" size="6" class="input-sm" aria-label="Media library number"></p>';
            }
            if ($m) $h .= '<label class="check-inline"><input type="checkbox" name="' . $n . '_remove" value="1"> Remove</label>';
            return $h . "</div></div>$help$errHtml</div>";
        case 'datetime':
            $val = $v ? date('Y-m-d\TH:i', strtotime((string)$v)) : '';
            return "<div class=\"$cls\">$label<input type=\"datetime-local\" id=\"$id\" name=\"$n\" value=\"" . e($val) . "\"$req>$help$errHtml</div>";
        case 'date':
            return "<div class=\"$cls\">$label<input type=\"date\" id=\"$id\" name=\"$n\" value=\"" . e($v ? substr((string)$v, 0, 10) : '') . "\"$req>$help$errHtml</div>";
        case 'time':
            return "<div class=\"$cls\">$label<input type=\"time\" id=\"$id\" name=\"$n\" value=\"" . e($v ? substr((string)$v, 0, 5) : '') . "\"$req>$help$errHtml</div>";
        case 'slug':
            if (!empty($o['lock_if_system']) && !empty($row['is_system'])) {
                return "<div class=\"$cls\">$label<input type=\"text\" id=\"$id\" value=\"" . e($v) . "\" disabled><p class=\"help\">Built-in page. The address cannot change.</p></div>";
            }
            return "<div class=\"$cls\">$label<input type=\"text\" id=\"$id\" name=\"$n\" value=\"" . e($v) . "\" pattern=\"[a-z0-9-]*\" placeholder=\"Created automatically if left blank\">$help$errHtml</div>";
        default:
            $type = match ($f['type']) { 'number' => 'number', 'url' => 'url', 'email' => 'email', default => 'text' };
            return "<div class=\"$cls\">$label<input type=\"$type\" id=\"$id\" name=\"$n\" value=\"" . e($v) . "\"$req>$help$errHtml</div>";
    }
}

/** Display a list cell nicely. */
function crud_cell(string $col, $v, array $row): string
{
    if (str_ends_with($col, '_media_id')) {
        return $v ? '<img class="thumb" src="' . e(media_url((int)$v, 480)) . '" alt="">' : '<span class="thumb thumb--empty"></span>';
    }
    if (in_array($col, ['is_published', 'is_featured', 'is_current', 'registration_open'], true)) {
        return (int)$v === 1 ? '<span class="pill pill--ok">Yes</span>' : '<span class="pill">No</span>';
    }
    if ($col === 'status') {
        $map = ['published' => 'ok', 'approved' => 'ok', 'pending' => 'warn', 'draft' => '', 'rejected' => 'bad'];
        return '<span class="pill pill--' . ($map[$v] ?? '') . '">' . e(ucfirst((string)$v)) . '</span>';
    }
    if (preg_match('/_at$|_on$/', $col)) {
        return e($v ? fmt_date((string)$v, str_contains((string)$v, ':') && !str_ends_with((string)$v, '00:00:00') ? 'j M Y, g:i A' : 'j M Y') : '-');
    }
    if ($col === 'body') return e(excerpt((string)$v, 90));
    if ($col === 'slug') return '<code>/' . e($v) . '</code>';
    return e($v === null || $v === '' ? '-' : $v);
}

/* ---------- gallery photos manager (shown under the album form) ---------- */

function admin_album_photos(?int $albumId): string
{
    if (!$albumId) {
        return '<div class="panel"><p class="muted">Save the album first, then you can upload photos.</p></div>';
    }
    return render('admin/album_photos', [
        'albumId' => $albumId,
        'photos' => all('SELECT p.*, m.path, m.variants FROM photos p JOIN media m ON m.id = p.media_id WHERE p.album_id = ? ORDER BY p.sort_order, p.id', [$albumId]),
    ]);
}

function admin_album_upload(int $albumId): void
{
    require_login();
    admin_csrf();
    if (!one('SELECT id FROM albums WHERE id = ?', [$albumId])) not_found_admin();
    $files = $_FILES['photos'] ?? null;
    $ok = 0;
    $errs = [];
    if ($files && is_array($files['name'])) {
        $next = (int)scalar('SELECT COALESCE(MAX(sort_order), 0) FROM photos WHERE album_id = ?', [$albumId]);
        foreach ($files['name'] as $i => $name) {
            $one = ['name' => $name, 'type' => $files['type'][$i], 'tmp_name' => $files['tmp_name'][$i], 'error' => $files['error'][$i], 'size' => $files['size'][$i]];
            if ($one['error'] === UPLOAD_ERR_NO_FILE) continue;
            $res = media_upload($one, null, 'image');
            if (isset($res['error'])) {
                $errs[] = $name . ': ' . $res['error'];
                continue;
            }
            $next += 10;
            q('INSERT INTO photos (album_id, media_id, sort_order) VALUES (?,?,?)', [$albumId, $res['id'], $next]);
            $ok++;
        }
    }
    audit('upload_photos', 'albums', $albumId, "$ok photos");
    if ($ok) flash('ok', "$ok photo" . ($ok === 1 ? '' : 's') . ' uploaded. Add captions and descriptions below.');
    if ($errs) flash('err', implode(' · ', $errs));
    if (!$ok && !$errs) flash('err', 'No photos were chosen. If you chose very large files, upload fewer at a time.');
    redirect("/admin/albums/$albumId#photos");
}

function admin_photos_save(int $albumId): void
{
    require_login();
    admin_csrf();
    foreach ((array)($_POST['photo'] ?? []) as $pid => $p) {
        $pid = (int)$pid;
        if (!empty($p['delete'])) {
            $mid = scalar('SELECT media_id FROM photos WHERE id = ? AND album_id = ?', [$pid, $albumId]);
            q('DELETE FROM photos WHERE id = ? AND album_id = ?', [$pid, $albumId]);
            if ($mid && !scalar('SELECT COUNT(*) FROM photos WHERE media_id = ?', [$mid])) media_delete((int)$mid);
            continue;
        }
        q('UPDATE photos SET caption = ?, alt = ?, sort_order = ? WHERE id = ? AND album_id = ?', [
            mb_substr(trim((string)($p['caption'] ?? '')), 0, 255) ?: null,
            mb_substr(trim((string)($p['alt'] ?? '')), 0, 255) ?: null,
            (int)($p['sort_order'] ?? 0), $pid, $albumId,
        ]);
    }
    audit('update_photos', 'albums', $albumId);
    flash('ok', 'Photos updated.');
    redirect("/admin/albums/$albumId#photos");
}
