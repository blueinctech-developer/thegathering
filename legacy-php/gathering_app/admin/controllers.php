<?php
declare(strict_types=1);

function admin_view(string $tpl, array $vars = []): void
{
    $vars['content'] = render($tpl, $vars);
    view('admin/layout', $vars);
}

function admin_csrf(): void
{
    if (!csrf_valid()) {
        http_response_code(419);
        flash('err', 'Your session expired or the form was open too long. Please try again.');
        redirect($_SERVER['HTTP_REFERER'] ?? '/admin');
    }
}

function not_found_admin(): never
{
    http_response_code(404);
    if (current_user()) {
        admin_view('admin/message', ['title' => 'Not found', 'message' => 'That admin page does not exist.']);
    } else {
        echo 'Not found';
    }
    exit;
}

/* ---------- authentication ---------- */

function admin_login(): void
{
    if (current_user()) redirect('/admin');
    $error = null;
    $email = '';
    if (is_post()) {
        if (!csrf_valid()) {
            $error = 'Your session expired. Please try again.';
        } else {
            $email = post('email');
            $error = attempt_login($email, (string)($_POST['password'] ?? ''));
            if (!$error) {
                $next = get('next');
                redirect(preg_match('~^/admin(/[a-z0-9/_?=&%-]*)?$~i', $next) ? $next : '/admin');
            }
        }
    }
    if (!scalar('SELECT COUNT(*) FROM users')) {
        view('admin/auth', ['mode' => 'nousers', 'title' => 'Set up']);
        return;
    }
    view('admin/auth', ['mode' => 'login', 'error' => $error, 'email' => $email, 'notice' => flash('notice'), 'title' => 'Sign in']);
}

function admin_forgot(): void
{
    $sent = false;
    if (is_post() && csrf_valid()) {
        send_password_reset(post('email'));
        $sent = true;
    }
    view('admin/auth', ['mode' => 'forgot', 'sent' => $sent, 'title' => 'Reset password']);
}

function admin_reset(): void
{
    $token = get('token') ?: post('token');
    $u = reset_token_user($token);
    $error = null;
    if (!$u) {
        view('admin/auth', ['mode' => 'reset_invalid', 'title' => 'Link expired']);
        return;
    }
    if (is_post() && csrf_valid()) {
        $pw = (string)($_POST['password'] ?? '');
        if ($pw !== (string)($_POST['password2'] ?? '')) {
            $error = 'The two passwords do not match.';
        } elseif ($e = password_problem($pw)) {
            $error = $e;
        } else {
            q('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($pw, PASSWORD_DEFAULT), $u['id']]);
            q('UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL', [$u['id']]);
            $_SESSION['uid'] = null;
            audit('password_reset', 'user', $u['id']);
            flash('notice', 'Your password has been changed. Please sign in.');
            redirect('/admin/login');
        }
    }
    view('admin/auth', ['mode' => 'reset', 'token' => $token, 'error' => $error, 'title' => 'Choose a new password']);
}

/** One-time creation of the first administrator. Requires the setup token from config.php. */
function admin_setup(): void
{
    if (scalar('SELECT COUNT(*) FROM users')) redirect('/admin/login');
    $error = null;
    if (is_post() && csrf_valid()) {
        $token = (string)config('setup_token', '');
        if (!rate_limit('setup:' . ip_hash(), 10, 3600)) {
            $error = 'Too many attempts. Try again later.';
        } elseif ($token === '' || str_starts_with($token, 'CHANGE_ME') || !hash_equals($token, post('setup_token'))) {
            $error = 'The setup code is not correct. It is the "setup_token" value in config.php.';
        } elseif (!filter_var(post('email'), FILTER_VALIDATE_EMAIL) || post('name') === '') {
            $error = 'Please enter your name and a valid email address.';
        } elseif ((string)$_POST['password'] !== (string)$_POST['password2']) {
            $error = 'The two passwords do not match.';
        } elseif ($e = password_problem((string)$_POST['password'])) {
            $error = $e;
        } else {
            q('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)', [post('name'), mb_strtolower(post('email')), password_hash((string)$_POST['password'], PASSWORD_DEFAULT), 'admin']);
            audit('setup_admin', 'user', last_id());
            attempt_login(post('email'), (string)$_POST['password']);
            flash('ok', 'Welcome! Your administrator account is ready. Start with Settings.');
            redirect('/admin');
        }
    }
    view('admin/auth', ['mode' => 'setup', 'error' => $error, 'title' => 'First-time setup']);
}

/* ---------- dashboard ---------- */

function admin_dashboard(): void
{
    $ev = current_event();
    $counts = [];
    foreach (all("SELECT form_type, SUM(status='new') AS new_count, COUNT(*) AS total FROM submissions WHERE status <> 'spam' GROUP BY form_type") as $r) {
        $counts[$r['form_type']] = $r;
    }
    $checklist = [
        ['Upload the logo', setting('logo_media_id') !== '', '/admin/settings#brand'],
        ['Add the contact email and phone', setting('contact_email') !== '' || setting('contact_phone') !== '', '/admin/settings#contact'],
        ['Set where form notifications go', setting('notify_default') !== '' || setting('contact_email') !== '', '/admin/settings#forms'],
        ['Create the current event', (bool)$ev, '/admin/events'],
        ['Publish the About page', page_published('about'), '/admin/pages'],
        ['Publish the Privacy Policy', page_published('privacy'), '/admin/pages'],
        ['Add the social media links', (bool)social_links(), '/admin/settings#contact'],
        ['Upload a social sharing image', setting('og_media_id') !== '', '/admin/settings#seo'],
    ];
    admin_view('admin/dashboard', [
        'title' => 'Dashboard',
        'event' => $ev,
        'regCount' => $ev ? registered_count((int)$ev['id']) : 0,
        'regRows' => $ev ? (int)scalar('SELECT COUNT(*) FROM registrations WHERE event_id = ?', [$ev['id']]) : 0,
        'counts' => $counts,
        'failedEmails' => (int)scalar("SELECT COUNT(*) FROM email_outbox WHERE status = 'failed'"),
        'pendingTestimonies' => (int)scalar("SELECT COUNT(*) FROM testimonies WHERE status = 'pending'"),
        'recent' => all("SELECT id, form_type, reference, name, status, email_status, created_at FROM submissions WHERE status <> 'spam' ORDER BY id DESC LIMIT 8"),
        'checklist' => $checklist,
    ]);
}

/* ---------- settings ---------- */

function settings_schema(): array
{
    $forms = [];
    foreach (form_defs() as $k => $f) {
        $forms[] = ["form_{$k}_enabled", "Turn on the {$f['label']} form", 'checkbox', ''];
    }
    $notify = [['notify_default', 'Default notification email(s)', 'text', 'Where new form submissions are sent unless set below. Separate several addresses with commas.']];
    foreach (form_defs() as $k => $f) {
        $notify[] = ["notify_$k", "{$f['label']} notifications (optional)", 'text', 'Leave blank to use the default.'];
    }
    return [
        'general' => ['General', [
            ['site_name', 'Site / ministry name', 'text', 'Used in page titles, emails and the footer.'],
            ['site_tagline', 'Tagline', 'text', 'Short line shown in search results and on the homepage when no event is set.'],
            ['welcome_heading', 'Homepage welcome heading', 'text', ''],
            ['welcome_body', 'Homepage welcome text', 'richtext', ''],
            ['footer_text', 'Footer text', 'textarea', 'A sentence about the ministry for the footer.'],
        ]],
        'home' => ['Homepage', [
            ['hero_media_id', 'Homepage background photo', 'image', 'Used when the current event has no photo of its own. A wide photo of worship or the crowd works best.'],
            ['hero_summary', 'Short line under the theme', 'textarea', 'One sentence about The Gathering.'],
            ['marquee_words', 'Moving word strip', 'text', 'Words separated by commas, e.g. Prayer, Compassion, Impact.'],
            ['mission_lines', 'Mission statement lines', 'textarea', 'One short line per row. Shown large on the homepage.'],
            ['why_heading', '"Why it matters" heading', 'text', ''],
            ['why_body', '"Why it matters" text', 'textarea', ''],
            ['land_heading', 'Gathering Land heading', 'text', ''],
            ['land_body', 'Gathering Land text', 'textarea', ''],
            ['land_figure', 'Gathering Land headline figure', 'text', 'e.g. 2.66 acres'],
            ['land_figure_label', 'Text under the figure', 'text', ''],
            ['partner_heading', 'Partner call-to-action heading', 'text', ''],
            ['partner_body', 'Partner call-to-action text', 'textarea', ''],
            ['programme_note', 'Note under the programme', 'text', 'e.g. The full programme will be confirmed by the ministry team.'],
        ]],
        'bus' => ['Free bus', [
            ['bus_heading', 'Heading', 'text', 'e.g. Join the bus, free to and fro'],
            ['bus_body', 'Introduction', 'textarea', ''],
            ['bus_time', 'Departure time', 'text', 'e.g. 8:00 AM daily'],
            ['bus_fee', 'Fee', 'text', 'e.g. Free, to and fro'],
            ['bus_dropoff', 'Drop-off / event location', 'textarea', ''],
            ['bus_media_id', 'Bus flyer image', 'image', ''],
        ]],
        'brand' => ['Logo & colours', [
            ['logo_media_id', 'Logo (for light backgrounds)', 'image', 'PNG with a transparent background works best.'],
            ['logo_light_media_id', 'Logo (white version, for dark backgrounds)', 'image', 'Used on the homepage photo and in emails. Optional.'],
            ['favicon_media_id', 'Browser icon (square)', 'image', 'Square image, at least 512×512px.'],
            ['parent_logo_media_id', 'Parent ministry logo (white, for the footer)', 'image', ''],
            ['parent_org_name', 'Parent ministry name', 'text', ''],
            ['parent_org_url', 'Parent ministry website', 'url', ''],
            ['org_legal', 'Legal / registration line (footer)', 'textarea', ''],
            ['brand_primary', 'Main brand colour', 'color', 'Used for headers, buttons and dark sections.'],
            ['brand_accent', 'Accent colour', 'color', 'Used for highlights and the Register button.'],
        ]],
        'contact' => ['Contact & social', [
            ['contact_intro', 'Contact page introduction', 'textarea', ''],
            ['contact_email', 'Public contact email', 'email', ''],
            ['contact_phone', 'Phone number', 'text', 'Include the country code, e.g. +234 800 000 0000.'],
            ['whatsapp_number', 'WhatsApp number', 'text', 'Include the country code. Creates a wa.me chat link.'],
            ['whatsapp_community_url', 'WhatsApp group / channel link', 'url', 'Optional. e.g. https://chat.whatsapp.com/…'],
            ['postal_address', 'Address', 'textarea', ''],
            ['social_facebook', 'Facebook page link', 'url', ''],
            ['social_instagram', 'Instagram link', 'url', ''],
            ['social_youtube', 'YouTube channel link', 'url', ''],
            ['social_x', 'X (Twitter) link', 'url', ''],
            ['social_tiktok', 'TikTok link', 'url', ''],
        ]],
        'live' => ['Livestream & giving', [
            ['livestream_url', 'Livestream link ("Watch online" button)', 'url', 'The channel or live page on YouTube/Facebook.'],
            ['livestream_embed_url', 'Video to embed on the site (optional)', 'url', 'A specific YouTube/Facebook video link, or https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID'],
            ['livestream_is_live', 'We are live right now (shows a red "Live" badge)', 'checkbox', ''],
            ['giving_intro', 'Giving introduction', 'textarea', ''],
            ['giving_online_url', 'Online giving link', 'url', 'Your Paystack/Flutterwave/PayPal/other giving page. Leave blank if there is none.'],
            ['giving_online_label', 'Online giving button text', 'text', 'e.g. "Give with card".'],
            ['funding_total', 'Total funding requirement', 'textarea', 'One amount per line, e.g. NGN: ₦133,000,000'],
            ['funding_note', 'Note under the funding streams', 'text', 'e.g. Exchange rates are planning estimates.'],
            ['partnership_docs_url', 'Partnership documents link (PDF / Google Drive)', 'url', ''],
            ['giving_bank_details', 'Bank transfer details (simple text)', 'textarea', 'Optional. For neat separate cards per account, use Bank accounts in the menu instead. Double-check every digit.'],
        ]],
        'forms' => ['Forms & notifications', array_merge($forms, [
            ['volunteer_teams', 'Volunteer teams (one per line)', 'textarea', 'Shown as choices on the volunteer form. Leave blank to hide the question.'],
            ['registration_confirm_note', 'Extra note in the registration confirmation email', 'textarea', 'e.g. what to bring, arrival time.'],
        ], $notify)],
        'seo' => ['Search & sharing', [
            ['meta_description', 'Default search description', 'textarea', 'About 150 characters, used on pages without their own description.'],
            ['og_media_id', 'Default sharing image', 'image', '1200×630px image shown when the site is shared on WhatsApp, Facebook, etc.'],
            ['google_site_verification', 'Google Search Console verification code', 'text', 'Only the content="…" value.'],
            ['ga_measurement_id', 'Google Analytics ID', 'text', 'Looks like G-XXXXXXX.'],
            ['gtm_container_id', 'Google Tag Manager ID', 'text', 'Looks like GTM-XXXXXX.'],
            ['meta_pixel_id', 'Meta (Facebook) Pixel ID', 'text', 'Numbers only.'],
        ]],
    ];
}

function admin_settings(): void
{
    require_login('admin');
    $schema = settings_schema();
    $errors = [];
    if (is_post()) {
        admin_csrf();
        foreach ($schema as $group) {
            foreach ($group[1] as [$key, $label, $type]) {
                if (!array_key_exists($key, $_POST) && !in_array($type, ['checkbox', 'image'], true)) continue;
                $v = post($key);
                switch ($type) {
                    case 'checkbox': $v = isset($_POST[$key]) ? '1' : '0'; break;
                    case 'richtext': $v = clean_html((string)($_POST[$key] ?? '')); break;
                    case 'email': if ($v !== '' && !filter_var($v, FILTER_VALIDATE_EMAIL)) { $errors[$key] = 'Not a valid email address.'; continue 2; } break;
                    case 'url': if ($v !== '' && !valid_http_url($v)) { $errors[$key] = 'Use a full link starting with https://'; continue 2; } break;
                    case 'color': if (!preg_match('/^#[0-9a-f]{6}$/i', $v)) { $errors[$key] = 'Pick a colour.'; continue 2; } break;
                    case 'image':
                        $file = $_FILES[$key] ?? null;
                        if ($file && ($file['error'] ?? 4) !== UPLOAD_ERR_NO_FILE) {
                            $res = media_upload($file, $label, 'image');
                            if (isset($res['error'])) { $errors[$key] = $res['error']; continue 2; }
                            $v = (string)$res['id'];
                        } elseif (isset($_POST[$key . '_remove'])) {
                            $v = '';
                        } else {
                            continue 2;
                        }
                        break;
                    default:
                        if (str_starts_with($key, 'notify_') && $v !== '') {
                            $bad = array_filter(array_map('trim', explode(',', $v)), fn($a) => !filter_var($a, FILTER_VALIDATE_EMAIL));
                            if ($bad) { $errors[$key] = 'Check these addresses: ' . implode(', ', $bad); continue 2; }
                        }
                }
                setting_save($key, $v);
            }
        }
        settings_all(true);
        audit('update_settings', 'settings');
        if ($errors) {
            flash('err', 'Most settings were saved, but please fix the highlighted fields.');
        } else {
            flash('ok', 'Settings saved.');
            redirect('/admin/settings' . (post('_tab') ? '#' . preg_replace('/[^a-z]/', '', post('_tab')) : ''));
        }
    }
    admin_view('admin/settings', ['title' => 'Settings', 'schema' => $schema, 'errors' => $errors]);
}

/* ---------- schedule ---------- */

function admin_schedule(): void
{
    $events = all('SELECT id, name, is_current FROM events ORDER BY is_current DESC, starts_at DESC');
    $eventId = (int)(get('event') ?: ($events[0]['id'] ?? 0));
    $days = $eventId ? all('SELECT * FROM schedule_days WHERE event_id = ? ORDER BY sort_order, day_date, id', [$eventId]) : [];
    foreach ($days as &$d) {
        $d['sessions'] = all('SELECT s.*, sp.name AS speaker_name FROM schedule_sessions s LEFT JOIN speakers sp ON sp.id = s.speaker_id WHERE day_id = ? ORDER BY s.sort_order, s.starts_at, s.id', [$d['id']]);
    }
    admin_view('admin/schedule', ['title' => 'Schedule', 'events' => $events, 'eventId' => $eventId, 'days' => $days]);
}

function admin_testimony_status(int $id): void
{
    admin_csrf();
    $st = post('status');
    if (!in_array($st, ['approved', 'rejected', 'pending'], true)) not_found_admin();
    q('UPDATE testimonies SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?', [$st, current_user()['id'], $id]);
    audit('testimony_' . $st, 'testimonies', $id);
    flash('ok', 'Testimony ' . ($st === 'approved' ? 'approved and now visible on the website.' : ($st === 'rejected' ? 'rejected.' : 'moved back to pending.')));
    redirect('/admin/testimonies');
}

/* ---------- submissions ---------- */

function submissions_filters(): array
{
    $where = [];
    $params = [];
    $type = get('type');
    if ($type !== '' && isset(form_defs()[$type])) { $where[] = 'form_type = ?'; $params[] = $type; }
    $status = get('status');
    if ($status === '') { $where[] = "status <> 'spam'"; }
    elseif (in_array($status, ['new', 'in_progress', 'handled', 'spam'], true)) { $where[] = 'status = ?'; $params[] = $status; }
    if (get('email') === 'failed') { $where[] = "email_status = 'failed'"; }
    $qText = get('q');
    if ($qText !== '') {
        $where[] = '(reference LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ?)';
        array_push($params, "%$qText%", "%$qText%", "%$qText%", "%$qText%");
    }
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', get('from'))) { $where[] = 'created_at >= ?'; $params[] = get('from') . ' 00:00:00'; }
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', get('to'))) { $where[] = 'created_at <= ?'; $params[] = get('to') . ' 23:59:59'; }
    return [$where ? 'WHERE ' . implode(' AND ', $where) : '', $params];
}

function admin_submissions(): void
{
    [$w, $params] = submissions_filters();
    $page = max(1, (int)get('page', '1'));
    $per = 50;
    $total = (int)scalar("SELECT COUNT(*) FROM submissions $w", $params);
    $rows = all("SELECT id, form_type, reference, name, email, phone, status, email_status, created_at FROM submissions $w ORDER BY id DESC LIMIT $per OFFSET " . (($page - 1) * $per), $params);
    $typeCounts = array_column(all("SELECT form_type, SUM(status='new') AS n FROM submissions GROUP BY form_type"), 'n', 'form_type');
    admin_view('admin/submissions', ['title' => 'Submissions', 'rows' => $rows, 'total' => $total, 'page' => $page, 'per' => $per, 'typeCounts' => $typeCounts]);
}

function admin_submissions_export(): void
{
    [$w, $params] = submissions_filters();
    $rows = all("SELECT * FROM submissions $w ORDER BY id DESC", $params);
    $keys = [];
    foreach ($rows as $r) {
        foreach (array_keys(json_decode($r['data'], true) ?: []) as $k) $keys[$k] = true;
    }
    $keys = array_keys($keys);
    audit('export_submissions', 'submissions', null, (get('type') ?: 'all') . ' (' . count($rows) . ' rows)');
    $name = 'submissions-' . (get('type') ?: 'all') . '-' . date('Y-m-d') . '.csv';
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $name . '"');
    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF"); // BOM so Excel opens UTF-8 correctly
    fputcsv($out, array_merge(['Reference', 'Form', 'Received', 'Status', 'Email status'], array_map(fn($k) => ucwords(str_replace('_', ' ', $k)), $keys)));
    foreach ($rows as $r) {
        $data = json_decode($r['data'], true) ?: [];
        $line = [$r['reference'], $r['form_type'], $r['created_at'], $r['status'], $r['email_status']];
        foreach ($keys as $k) {
            $v = (string)($data[$k] ?? '');
            if ($v !== '' && in_array($v[0], ['=', '+', '-', '@'], true)) $v = "'" . $v; // stop spreadsheet formula injection
            $line[] = $v;
        }
        fputcsv($out, $line);
    }
    fclose($out);
    exit;
}

function admin_submission(int $id): void
{
    $s = one('SELECT * FROM submissions WHERE id = ?', [$id]);
    if (!$s) not_found_admin();
    if (is_post()) {
        admin_csrf();
        $act = post('action');
        if ($act === 'status' && in_array(post('status'), ['new', 'in_progress', 'handled', 'spam'], true)) {
            q('UPDATE submissions SET status = ? WHERE id = ?', [post('status'), $id]);
            audit('submission_status', 'submissions', $id, post('status'));
            flash('ok', 'Status updated.');
        } elseif ($act === 'note' && post('note') !== '') {
            q('INSERT INTO submission_notes (submission_id, user_id, note) VALUES (?,?,?)', [$id, current_user()['id'], mb_substr(post('note'), 0, 4000)]);
            flash('ok', 'Note added.');
        } elseif ($act === 'retry') {
            $sent = 0;
            foreach (all("SELECT id FROM email_outbox WHERE submission_id = ? AND status <> 'sent' AND to_email <> '(not set)'", [$id]) as $o) {
                $sent += mail_send_one((int)$o['id']) ? 1 : 0;
            }
            flash($sent ? 'ok' : 'err', $sent ? "$sent email(s) sent." : 'Emails could not be sent. See the error below.');
        } elseif ($act === 'checkin' && $s['form_type'] === 'registration') {
            q('UPDATE registrations SET checked_in_at = IF(checked_in_at IS NULL, NOW(), NULL) WHERE submission_id = ?', [$id]);
            audit('checkin_toggle', 'submissions', $id);
            flash('ok', 'Check-in updated.');
        } elseif ($act === 'delete' && is_admin()) {
            q('DELETE FROM email_outbox WHERE submission_id = ?', [$id]);
            q('DELETE FROM submissions WHERE id = ?', [$id]);
            audit('delete_submission', 'submissions', $id, $s['reference']);
            flash('ok', 'Submission deleted.');
            redirect('/admin/submissions?type=' . $s['form_type']);
        }
        redirect("/admin/submissions/$id");
    }
    if ($s['status'] === 'new') {
        // Opening a new item doesn't change its status automatically; staff choose.
    }
    admin_view('admin/submission', [
        'title' => 'Submission ' . $s['reference'],
        's' => $s,
        'data' => json_decode($s['data'], true) ?: [],
        'notes' => all('SELECT n.*, u.name AS user_name FROM submission_notes n LEFT JOIN users u ON u.id = n.user_id WHERE submission_id = ? ORDER BY n.id', [$id]),
        'emails' => all('SELECT * FROM email_outbox WHERE submission_id = ? ORDER BY id', [$id]),
        'reg' => one('SELECT * FROM registrations WHERE submission_id = ?', [$id]),
        'event' => $s['event_id'] ? one('SELECT name FROM events WHERE id = ?', [$s['event_id']]) : null,
    ]);
}

/* ---------- emails ---------- */

function admin_emails(): void
{
    if (is_post()) {
        admin_csrf();
        if (post('action') === 'retry_all') {
            $r = mail_process_queue(100);
            flash($r['failed'] ? 'err' : 'ok', "Sent {$r['sent']}, failed {$r['failed']}.");
        } elseif (post('action') === 'retry' && ctype_digit(post('id'))) {
            $ok = mail_send_one((int)post('id'));
            flash($ok ? 'ok' : 'err', $ok ? 'Email sent.' : 'Still failing. See the error column.');
        } elseif (post('action') === 'test') {
            require_login('admin');
            $to = post('to');
            if (filter_var($to, FILTER_VALIDATE_EMAIL)) {
                $id = mail_queue('test', $to, 'Test email from ' . setting('site_name', 'The Gathering'), mail_layout('Email is working', '<p>This is a test email from your website. If you are reading this, email sending is set up correctly.</p>'), 'This is a test email from your website. Email sending is working.');
                $ok = mail_send_one($id);
                flash($ok ? 'ok' : 'err', $ok ? "Test email sent to $to. Check the inbox (and spam folder)." : 'The test email failed: ' . scalar('SELECT last_error FROM email_outbox WHERE id = ?', [$id]));
            } else {
                flash('err', 'Enter a valid email address.');
            }
        }
        redirect('/admin/emails');
    }
    $status = get('status');
    $rows = in_array($status, ['queued', 'sent', 'failed'], true)
        ? all('SELECT id, submission_id, purpose, to_email, subject, status, attempts, last_error, created_at, sent_at FROM email_outbox WHERE status = ? ORDER BY id DESC LIMIT 300', [$status])
        : all('SELECT id, submission_id, purpose, to_email, subject, status, attempts, last_error, created_at, sent_at FROM email_outbox ORDER BY id DESC LIMIT 300');
    admin_view('admin/emails', ['title' => 'Email log', 'rows' => $rows]);
}

/* ---------- media library ---------- */

function admin_media(): void
{
    if (is_post()) {
        admin_csrf();
        $act = post('action');
        if ($act === 'upload') {
            $files = $_FILES['files'] ?? null;
            $ok = 0; $errs = [];
            if ($files && is_array($files['name'])) {
                foreach ($files['name'] as $i => $name) {
                    if ($files['error'][$i] === UPLOAD_ERR_NO_FILE) continue;
                    $res = media_upload(['name' => $name, 'type' => $files['type'][$i], 'tmp_name' => $files['tmp_name'][$i], 'error' => $files['error'][$i], 'size' => $files['size'][$i]], null, 'any');
                    isset($res['error']) ? $errs[] = "$name: {$res['error']}" : $ok++;
                }
            }
            audit('media_upload', 'media', null, "$ok files");
            if ($ok) flash('ok', "$ok file(s) uploaded.");
            if ($errs) flash('err', implode(' · ', $errs));
        } elseif ($act === 'alt' && ctype_digit(post('id'))) {
            q('UPDATE media SET alt = ? WHERE id = ?', [mb_substr(post('alt'), 0, 255) ?: null, (int)post('id')]);
            flash('ok', 'Description saved.');
        } elseif ($act === 'delete' && ctype_digit(post('id'))) {
            $mid = (int)post('id');
            if ($where = media_usage($mid)) {
                flash('err', 'This file is still used in: ' . implode(', ', $where) . '. Remove it there first.');
            } else {
                media_delete($mid);
                audit('media_delete', 'media', $mid);
                flash('ok', 'File deleted.');
            }
        }
        redirect('/admin/media' . (get('pick') ? '?pick=' . rawurlencode(get('pick')) : ''));
    }
    $kind = get('kind') === 'document' ? 'document' : (get('kind') === 'image' ? 'image' : '');
    $items = $kind ? all('SELECT * FROM media WHERE kind = ? ORDER BY id DESC LIMIT 300', [$kind]) : all('SELECT * FROM media ORDER BY id DESC LIMIT 300');
    admin_view('admin/media', ['title' => 'Media library', 'items' => $items, 'pick' => preg_replace('/[^a-z_]/', '', get('pick'))]);
}

function media_usage(int $id): array
{
    $where = [];
    $checks = [
        'Events' => "SELECT COUNT(*) FROM events WHERE ? IN (hero_media_id, flyer_media_id, programme_media_id)",
        'Pages' => 'SELECT COUNT(*) FROM pages WHERE hero_media_id = ?',
        'Speakers' => 'SELECT COUNT(*) FROM speakers WHERE photo_media_id = ?',
        'Gallery' => 'SELECT COUNT(*) FROM photos WHERE media_id = ?',
        'News' => 'SELECT COUNT(*) FROM posts WHERE cover_media_id = ?',
        'Media' => 'SELECT COUNT(*) FROM messages WHERE thumb_media_id = ?',
        'Settings' => "SELECT COUNT(*) FROM settings WHERE skey LIKE '%media_id' AND svalue = ?",
    ];
    foreach ($checks as $label => $sql) {
        if ((int)scalar($sql, [$label === 'Settings' ? (string)$id : $id])) $where[] = $label;
    }
    return $where;
}

/* ---------- users ---------- */

function admin_users(): void
{
    require_login('admin');
    admin_view('admin/users', ['title' => 'Staff accounts', 'users' => all('SELECT id, name, email, role, is_active, last_login_at FROM users ORDER BY name')]);
}

function admin_user_edit(?int $id): void
{
    $me = require_login('admin');
    $u = $id ? one('SELECT id, name, email, role, is_active FROM users WHERE id = ?', [$id]) : ['name' => '', 'email' => '', 'role' => 'editor', 'is_active' => 1];
    if (!$u) not_found_admin();
    $error = null;
    if (is_post()) {
        admin_csrf();
        if (post('action') === 'delete' && $id) {
            if ($id === (int)$me['id']) {
                flash('err', 'You cannot delete your own account.');
            } else {
                q('DELETE FROM users WHERE id = ?', [$id]);
                audit('delete_user', 'user', $id, $u['email']);
                flash('ok', 'Account deleted.');
                redirect('/admin/users');
            }
            redirect("/admin/users/$id");
        }
        $name = post('name');
        $email = mb_strtolower(post('email'));
        $role = post('role') === 'admin' ? 'admin' : 'editor';
        $active = isset($_POST['is_active']) ? 1 : 0;
        $pw = (string)($_POST['password'] ?? '');
        if ($id === (int)$me['id']) { $role = 'admin'; $active = 1; } // can't lock yourself out
        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $error = 'Please enter a name and a valid email address.';
        } elseif (one('SELECT id FROM users WHERE email = ? AND id <> ?', [$email, $id ?? 0])) {
            $error = 'Another account already uses that email address.';
        } elseif (!$id && $pw === '') {
            $error = 'Set a starting password for the new account.';
        } elseif ($pw !== '' && ($e = password_problem($pw))) {
            $error = $e;
        } else {
            if ($id) {
                q('UPDATE users SET name = ?, email = ?, role = ?, is_active = ? WHERE id = ?', [$name, $email, $role, $active, $id]);
                if ($pw !== '') q('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($pw, PASSWORD_DEFAULT), $id]);
                audit('update_user', 'user', $id, "$email ($role)");
            } else {
                q('INSERT INTO users (name, email, password_hash, role, is_active) VALUES (?,?,?,?,?)', [$name, $email, password_hash($pw, PASSWORD_DEFAULT), $role, $active]);
                $id = last_id();
                audit('create_user', 'user', $id, "$email ($role)");
            }
            flash('ok', 'Account saved. Share the password with them privately (not by email), and ask them to change it from "My account".');
            redirect('/admin/users');
        }
        $u = array_merge($u, ['name' => $name, 'email' => $email, 'role' => $role, 'is_active' => $active]);
    }
    admin_view('admin/user_edit', ['title' => $id ? 'Edit account' : 'Add staff account', 'u' => $u, 'id' => $id, 'error' => $error, 'isMe' => $id === (int)$me['id']]);
}

function admin_account(): void
{
    $me = current_user();
    $error = null;
    if (is_post()) {
        admin_csrf();
        $row = one('SELECT password_hash FROM users WHERE id = ?', [$me['id']]);
        $pw = (string)($_POST['password'] ?? '');
        if (!password_verify((string)($_POST['current'] ?? ''), $row['password_hash'])) {
            $error = 'Your current password is not correct.';
        } elseif ($pw !== (string)($_POST['password2'] ?? '')) {
            $error = 'The new passwords do not match.';
        } elseif ($e = password_problem($pw)) {
            $error = $e;
        } else {
            q('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($pw, PASSWORD_DEFAULT), $me['id']]);
            audit('change_password', 'user', $me['id']);
            flash('ok', 'Password changed.');
            redirect('/admin/account');
        }
    }
    admin_view('admin/account', ['title' => 'My account', 'error' => $error]);
}

function admin_audit(): void
{
    require_login('admin');
    admin_view('admin/audit', ['title' => 'Activity log', 'rows' => all('SELECT a.*, u.name AS user_name FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT 300')]);
}
