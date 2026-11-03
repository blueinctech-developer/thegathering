<?php
declare(strict_types=1);

/**
 * Form definitions. Each form can be switched on/off in Admin > Settings > Forms.
 * Field lists are a sensible default and should be matched to the old site's forms
 * once those are confirmed (see docs/FORMS_INVENTORY.md).
 */
function form_defs(): array
{
    $teams = array_values(array_filter(array_map('trim', preg_split('/\R/', setting('volunteer_teams')) ?: [])));
    return [
        'registration' => [
            'label' => 'Registration', 'path' => '/register', 'prefix' => 'REG',
            'fields' => [
                ['full_name', 'Full name', 'text', true, 120, 'name'],
                ['email', 'Email address', 'email', true, 190, 'email'],
                ['phone', 'Phone / WhatsApp number', 'tel', true, 30, 'tel'],
                ['city', 'City / town', 'text', false, 120, 'address-level2'],
                ['church', 'Church or ministry', 'text', false, 160, 'organization'],
                ['attendees', 'Number of people (including you)', 'number', true, 2, 'off', ['min' => 1, 'max' => 10]],
                ['notes', 'Anything we should know? (optional)', 'textarea', false, 1000, 'off'],
                ['consent', 'I agree that my details can be used to manage my registration, as described in the privacy policy.', 'consent', true, 1, 'off'],
            ],
        ],
        'contact' => [
            'label' => 'Contact', 'path' => '/contact', 'prefix' => 'MSG',
            'fields' => [
                ['first_name', 'First name', 'text', true, 80, 'given-name'],
                ['last_name', 'Last name', 'text', true, 80, 'family-name'],
                ['email', 'Email address', 'email', true, 190, 'email'],
                ['subject', 'Subject', 'text', true, 160, 'off'],
                ['message', 'Your message', 'textarea', true, 4000, 'off'],
            ],
        ],
        'prayer' => [
            'label' => 'Prayer request', 'path' => '/prayer', 'prefix' => 'PRY',
            'fields' => [
                ['name', 'Your name', 'text', true, 120, 'name'],
                ['email', 'Email address', 'email', true, 190, 'email'],
                ['phone', 'Phone (optional)', 'tel', false, 30, 'tel'],
                ['request', 'Your prayer request', 'textarea', true, 4000, 'off'],
                ['contact_ok', 'You may contact me about this request.', 'checkbox', false, 1, 'off'],
            ],
        ],
        'testimony' => [
            'label' => 'Testimony', 'path' => '/testimonies', 'prefix' => 'TST',
            'fields' => [
                ['name', 'Your name', 'text', true, 120, 'name'],
                ['location', 'City / country (optional)', 'text', false, 120, 'address-level2'],
                ['email', 'Email address', 'email', true, 190, 'email'],
                ['testimony', 'Your testimony', 'textarea', true, 5000, 'off'],
                ['publish_ok', 'I give permission for my testimony (name and city only) to be shared on this website after review.', 'consent', true, 1, 'off'],
            ],
        ],
        'volunteer' => [
            'label' => 'Volunteer', 'path' => '/volunteer', 'prefix' => 'VOL',
            'fields' => array_values(array_filter([
                ['name', 'Full name', 'text', true, 120, 'name'],
                ['email', 'Email address', 'email', true, 190, 'email'],
                ['phone', 'Phone / WhatsApp number', 'tel', true, 30, 'tel'],
                $teams ? ['team', 'Which team would you like to serve on?', 'select', true, 120, 'off', ['options' => $teams]] : null,
                ['experience', 'Relevant experience (optional)', 'textarea', false, 2000, 'off'],
                ['consent', 'I agree that my details can be used to organise volunteers, as described in the privacy policy.', 'consent', true, 1, 'off'],
            ])),
        ],
        'partnership' => [
            'label' => 'Partnership enquiry', 'path' => '/give', 'prefix' => 'PTR',
            'fields' => [
                ['name', 'Full name', 'text', true, 120, 'name'],
                ['organisation', 'Church / organisation (optional)', 'text', false, 160, 'organization'],
                ['email', 'Email address', 'email', true, 190, 'email'],
                ['phone', 'Phone (optional)', 'tel', false, 30, 'tel'],
                ['country', 'Country', 'text', true, 80, 'country-name'],
                ['interest', 'Partnership interest', 'select', true, 80, 'off', ['options' => ['Prayer Partner', 'Support Partner', 'Covenant Partner', 'Territory Builder', 'Corporate / Ministry Sponsor', 'Sponsor a funding stream', 'Something else']]],
                ['message', 'Message', 'textarea', true, 3000, 'off'],
            ],
        ],
        'newsletter' => [
            'label' => 'Newsletter', 'path' => '/', 'prefix' => 'NWS',
            'fields' => [
                ['name', 'First name', 'text', false, 80, 'given-name'],
                ['email', 'Email address', 'email', true, 190, 'email'],
            ],
        ],
    ];
}

function form_enabled(string $type): bool
{
    return isset(form_defs()[$type]) && setting("form_{$type}_enabled") === '1';
}

function form_field(array $f): array
{
    return [
        'name' => $f[0], 'label' => $f[1], 'type' => $f[2], 'required' => $f[3],
        'max' => $f[4], 'autocomplete' => $f[5] ?? 'off', 'opts' => $f[6] ?? [],
    ];
}

function form_time_token(): string
{
    $t = (string)time();
    return $t . '.' . hash_hmac('sha256', $t, (string)config('app_key'));
}

function form_time_ok(string $token): bool
{
    [$t, $sig] = array_pad(explode('.', $token, 2), 2, '');
    if (!ctype_digit($t) || !hash_equals(hash_hmac('sha256', $t, (string)config('app_key')), $sig)) {
        return false;
    }
    $age = time() - (int)$t;
    return $age >= 3 && $age <= 86400;
}

function normalise_phone(string $p): string
{
    $p = trim($p);
    $plus = str_starts_with($p, '+') ? '+' : '';
    return $plus . preg_replace('/\D/', '', $p);
}

function make_reference(string $prefix): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    do {
        $code = '';
        for ($i = 0; $i < 6; $i++) {
            $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
        }
        $ref = $prefix . '-' . date('y') . '-' . $code;
    } while (one('SELECT id FROM submissions WHERE reference = ?', [$ref]));
    return $ref;
}

/** Validate posted values against the definition. Returns [clean values, errors]. */
function form_validate(array $def): array
{
    $values = [];
    $errors = [];
    foreach ($def['fields'] as $raw) {
        $f = form_field($raw);
        $n = $f['name'];
        if (in_array($f['type'], ['checkbox', 'consent'], true)) {
            $v = isset($_POST[$n]) && $_POST[$n] === '1' ? '1' : '';
            if ($f['required'] && $v !== '1') {
                $errors[$n] = 'Please tick this box to continue.';
            }
            $values[$n] = $v;
            continue;
        }
        $v = post($n);
        $v = str_replace("\0", '', $v);
        if ($f['type'] !== 'textarea') {
            $v = preg_replace('/\s+/', ' ', $v) ?? '';
        }
        $values[$n] = $v;
        if ($v === '') {
            if ($f['required']) {
                $errors[$n] = 'This field is required.';
            }
            continue;
        }
        if (mb_strlen($v) > $f['max'] && $f['type'] !== 'number') {
            $errors[$n] = "Please keep this under {$f['max']} characters.";
            continue;
        }
        switch ($f['type']) {
            case 'email':
                if (!filter_var($v, FILTER_VALIDATE_EMAIL)) {
                    $errors[$n] = 'Please enter a valid email address, like name@example.com.';
                }
                $values[$n] = mb_strtolower($v);
                break;
            case 'tel':
                $digits = preg_replace('/\D/', '', $v);
                if (strlen($digits) < 7 || strlen($digits) > 15) {
                    $errors[$n] = 'Please enter a valid phone number, including the country code if outside the country.';
                }
                break;
            case 'number':
                $min = $f['opts']['min'] ?? 0;
                $max = $f['opts']['max'] ?? 9999;
                if (!ctype_digit($v) || (int)$v < $min || (int)$v > $max) {
                    $errors[$n] = "Please enter a number from $min to $max.";
                }
                break;
            case 'select':
                if (!in_array($v, $f['opts']['options'] ?? [], true)) {
                    $errors[$n] = 'Please choose one of the options.';
                }
                break;
        }
    }
    return [$values, $errors];
}

/**
 * Handle a POSTed form. Always ends with a redirect (POST → redirect → GET).
 */
function form_handle(string $type): never
{
    $defs = form_defs();
    if (!isset($defs[$type]) || !form_enabled($type)) {
        not_found();
    }
    $def = $defs[$type];
    $back = post('_back');
    if (!preg_match('~^/[a-z0-9/_-]*$~i', $back)) {
        $back = $def['path'];
    }
    $anchor = '#form-' . $type;

    if (!csrf_valid()) {
        flash("form_$type", ['errors' => ['_form' => 'Your session expired. Please submit the form again.'], 'old' => $_POST]);
        redirect($back . $anchor);
    }

    // Spam traps: honeypot field and minimum fill time. Bots get a normal-looking response.
    $isSpam = post('website') !== '' || !form_time_ok(post('_ts'));

    if (!rate_limit("form:$type:" . ip_hash(), 6, 600)) {
        flash("form_$type", ['errors' => ['_form' => 'You have sent several submissions in a short time. Please wait a few minutes and try again.'], 'old' => $_POST]);
        redirect($back . $anchor);
    }

    [$values, $errors] = form_validate($def);

    $event = null;
    if ($type === 'registration') {
        $event = current_event();
        $state = registration_state($event);
        if ($state !== 'open') {
            $errors['_form'] = $state === 'full' ? 'Registration is full.' : 'Registration is not open at the moment.';
        }
    }

    if ($errors) {
        unset($_POST['_csrf']);
        flash("form_$type", ['errors' => $errors, 'old' => $values]);
        redirect($back . $anchor);
    }

    $email = $values['email'] ?? null;
    $phone = isset($values['phone']) && $values['phone'] !== '' ? $values['phone'] : null;
    $name = $values['full_name'] ?? $values['name'] ?? (isset($values['first_name']) ? trim($values['first_name'] . ' ' . ($values['last_name'] ?? '')) : null);

    if ($type === 'registration' && !$isSpam) {
        $dup = one('SELECT s.reference FROM registrations r JOIN submissions s ON s.id = r.submission_id
            WHERE r.event_id = ? AND (r.email_norm = ? OR r.phone_norm = ?)', [$event['id'], $email, normalise_phone((string)$phone)]);
        if ($dup) {
            flash("form_$type", ['errors' => ['_form' => 'You are already registered for this event with that email address or phone number. Check your inbox for your confirmation email, or contact us if you need help.'], 'old' => $values]);
            redirect($back . $anchor);
        }
    }

    $ref = make_reference($def['prefix']);
    $pdo = db();
    try {
        $pdo->beginTransaction();
        q('INSERT INTO submissions (form_type, reference, event_id, name, email, phone, data, status, email_status, ip_hash, user_agent) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [
            $type, $ref, $event['id'] ?? null, $name, $email, $phone,
            json_encode($values, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            $isSpam ? 'spam' : 'new', $isSpam ? 'none' : 'pending', ip_hash(), mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
        ]);
        $sid = last_id();
        if ($type === 'registration' && !$isSpam) {
            q('INSERT INTO registrations (submission_id, event_id, email_norm, phone_norm, attendees) VALUES (?,?,?,?,?)',
                [$sid, $event['id'], $email, normalise_phone((string)$phone), (int)($values['attendees'] ?? 1)]);
        }
        if ($type === 'testimony' && !$isSpam) {
            q('INSERT INTO testimonies (submission_id, name, location, body) VALUES (?,?,?,?)',
                [$sid, $values['name'], $values['location'] ?: null, $values['testimony']]);
        }
        $outbox = $isSpam ? [] : form_queue_emails($type, $def, $values, $ref, $sid, $event);
        $pdo->commit();
    } catch (PDOException $ex) {
        $pdo->rollBack();
        if ((int)($ex->errorInfo[1] ?? 0) === 1062 && $type === 'registration') {
            flash("form_$type", ['errors' => ['_form' => 'You are already registered for this event with that email address or phone number.'], 'old' => $values]);
            redirect($back . $anchor);
        }
        app_log('form', "save failed for $type: " . $ex->getMessage());
        flash("form_$type", ['errors' => ['_form' => 'Sorry, something went wrong and your submission was not saved. Please try again in a moment.'], 'old' => $values]);
        redirect($back . $anchor);
    }

    // The submission is safely saved. Now try the emails; failures stay queued for the cron retry.
    foreach ($outbox as $oid) {
        mail_send_one($oid);
    }
    if ($outbox === [] && !$isSpam) {
        submission_refresh_email_status($sid);
    }

    flash("form_$type", ['success' => true, 'reference' => $ref, 'email' => $email]);
    redirect($back . $anchor);
}

/** Queue the staff notification and the submitter's confirmation. Returns outbox ids. */
function form_queue_emails(string $type, array $def, array $values, string $ref, int $sid, ?array $event): array
{
    $site = setting('site_name', 'The Gathering');
    $labels = [];
    foreach ($def['fields'] as $raw) {
        $f = form_field($raw);
        $v = $values[$f['name']] ?? '';
        if (in_array($f['type'], ['checkbox', 'consent'], true)) {
            $v = $v === '1' ? 'Yes' : 'No';
            $label = $f['type'] === 'consent' ? 'Consent given' : $f['label'];
        } else {
            $label = $f['label'];
        }
        $labels[$label] = $v;
    }
    $ids = [];

    // Staff notification
    $to = setting("notify_$type", setting('notify_default', setting('contact_email')));
    $recipients = array_filter(array_map('trim', explode(',', $to)), fn($a) => filter_var($a, FILTER_VALIDATE_EMAIL));
    [$tableHtml, $tableText] = mail_fields(['Reference' => $ref] + ($event ? ['Event' => $event['name']] : []) + $labels);
    $adminLink = url('/admin/submissions/' . $sid);
    $html = mail_layout("New {$def['label']} submission", '<p>A new <strong>' . e(mb_strtolower($def['label'])) . '</strong> submission was received on the website.</p>' . $tableHtml
        . '<p><a href="' . e($adminLink) . '">Open it in the admin dashboard</a></p>');
    $text = "New {$def['label']} submission\n\n$tableText\nAdmin: $adminLink";
    $subject = "[$site] New {$def['label']}: " . ($values['full_name'] ?? $values['name'] ?? (isset($values['first_name']) ? trim($values['first_name'] . ' ' . $values['last_name']) : null) ?? $values['email'] ?? $ref);
    if ($recipients) {
        foreach ($recipients as $r) {
            $ids[] = mail_queue('notify', $r, $subject, $html, $text, $sid, $values['email'] ?? null);
        }
    } else {
        // No inbox configured: record a failed email so staff see the problem on the dashboard.
        $oid = mail_queue('notify', '(not set)', $subject, $html, $text, $sid, $values['email'] ?? null);
        q("UPDATE email_outbox SET status='failed', last_error='No notification email address set in Admin > Settings', attempts=6 WHERE id=?", [$oid]);
    }

    // Confirmation to the person
    if (!empty($values['email'])) {
        $first = trim(explode(' ', (string)($values['full_name'] ?? $values['name'] ?? $values['first_name'] ?? ''))[0] ?? '');
        $hello = $first !== '' ? 'Hello ' . e($first) . ',' : 'Hello,';
        if ($type === 'registration' && $event) {
            $details = ['Reference' => $ref, 'Event' => $event['name']];
            if ($event['theme']) $details['Theme'] = $event['theme'];
            if ($event['starts_at']) $details['Date'] = fmt_date_range($event['starts_at'], $event['ends_at']);
            if ($event['venue_name']) $details['Venue'] = trim($event['venue_name'] . ($event['venue_address'] ? ', ' . $event['venue_address'] : ''));
            $details['People registered'] = $values['attendees'] ?? '1';
            [$dHtml, $dText] = mail_fields($details);
            $note = setting('registration_confirm_note');
            $body = "<p>$hello</p><p>Thank you for registering for <strong>" . e($event['name']) . '</strong>. Your place is confirmed. Please keep this email and your reference number.</p>'
                . $dHtml . ($note ? nl2p($note) : '')
                . ($event['map_query'] ? '<p><a href="' . e('https://www.google.com/maps/search/?api=1&query=' . rawurlencode($event['map_query'])) . '">Get directions to the venue</a></p>' : '');
            $subj = "Your registration for {$event['name']} ($ref)";
            $txt = strip_tags(str_replace('<br />', '', $hello)) . "\n\nThank you for registering for {$event['name']}. Your place is confirmed.\n\n$dText\n" . ($note ? "\n$note\n" : '');
            $heading = "You're registered";
        } else {
            $msg = match ($type) {
                'prayer' => 'We have received your prayer request. Our prayer team will be standing with you in prayer.',
                'testimony' => 'Thank you for sharing your testimony. Our team will review it before anything is published.',
                'volunteer' => 'Thank you for offering to serve. Our team will be in touch with the next steps.',
                'newsletter' => 'You are now on our mailing list. We will keep you updated about The Gathering.',
                default => 'Thank you for getting in touch. We have received your message and will reply as soon as we can.',
            };
            $body = "<p>$hello</p><p>" . e($msg) . '</p><p style="color:#6b7280;font-size:13px">Your reference: <strong>' . e($ref) . '</strong></p>';
            $subj = "We received your " . mb_strtolower($def['label']) . " ($site)";
            $txt = "$msg\n\nYour reference: $ref";
            $heading = 'Thank you';
        }
        $replyTo = setting('contact_email') ?: null;
        $ids[] = mail_queue('confirm', $values['email'], $subj, mail_layout($heading, $body), $txt, $sid, $replyTo);
    }
    return $ids;
}

/** Render a form's fields with labels, errors and kept values. */
function form_render(string $type, array $opts = []): string
{
    $defs = form_defs();
    if (!isset($defs[$type])) {
        return '';
    }
    $def = $defs[$type];
    $state = $GLOBALS['__form_state'][$type] ??= (flash("form_$type") ?? []);
    $errors = $state['errors'] ?? [];
    $old = $state['old'] ?? [];
    $submit = $opts['submit'] ?? 'Send';
    $back = $opts['back'] ?? request_path();
    $id = 'form-' . $type;

    if (!empty($state['success'])) {
        $msg = $opts['success'] ?? 'Thank you. We have received your submission.';
        return '<div class="form-success" id="' . $id . '" role="status" tabindex="-1"><svg aria-hidden="true" viewBox="0 0 24 24" width="40" height="40"><circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            . '<h3>' . e($opts['success_title'] ?? 'Received, thank you!') . '</h3><p>' . e($msg) . '</p>'
            . '<p class="form-ref">Your reference: <strong>' . e($state['reference']) . '</strong></p>'
            . (!empty($state['email']) ? '<p class="muted">A confirmation email is on its way to ' . e($state['email']) . '. If it does not arrive in a few minutes, check your spam folder.</p>' : '')
            . '</div>';
    }

    $h = '<form class="form" id="' . $id . '" method="post" action="/forms/' . e($type) . '" novalidate>';
    $h .= csrf_field() . '<input type="hidden" name="_ts" value="' . e(form_time_token()) . '"><input type="hidden" name="_back" value="' . e($back) . '">';
    $h .= '<div class="hp" aria-hidden="true"><label>Leave this empty<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>';
    if (!empty($errors['_form'])) {
        $h .= '<div class="form-alert" role="alert">' . e($errors['_form']) . '</div>';
    } elseif ($errors) {
        $h .= '<div class="form-alert" role="alert">Please check the highlighted fields below.</div>';
    }
    $h .= '<div class="form-grid">';
    foreach ($def['fields'] as $raw) {
        $f = form_field($raw);
        $n = $f['name'];
        $fid = "$type-$n";
        $err = $errors[$n] ?? null;
        $val = (string)($old[$n] ?? '');
        $req = $f['required'] ? ' required aria-required="true"' : '';
        $desc = $err ? ' aria-invalid="true" aria-describedby="' . $fid . '-err"' : '';
        $errHtml = $err ? '<p class="field-error" id="' . $fid . '-err">' . e($err) . '</p>' : '';
        $wide = in_array($f['type'], ['textarea', 'consent', 'checkbox'], true) || $type === 'newsletter' ? ' field--wide' : '';
        if ($type === 'newsletter') $wide = '';
        $star = $f['required'] ? ' <span class="req" aria-hidden="true">*</span>' : '';

        if (in_array($f['type'], ['checkbox', 'consent'], true)) {
            $label = e($f['label']);
            if ($f['type'] === 'consent' && page_published('privacy')) {
                $label = str_replace('privacy policy', '<a href="/privacy" target="_blank">privacy policy</a>', $label);
            }
            $h .= '<div class="field field--check' . $wide . ($err ? ' has-error' : '') . '"><label for="' . $fid . '"><input type="checkbox" id="' . $fid . '" name="' . $n . '" value="1"' . ($val === '1' ? ' checked' : '') . $req . $desc . '><span>' . $label . $star . '</span></label>' . $errHtml . '</div>';
            continue;
        }
        $h .= '<div class="field' . $wide . ($err ? ' has-error' : '') . '"><label for="' . $fid . '">' . e($f['label']) . $star . '</label>';
        if ($f['type'] === 'textarea') {
            $h .= '<textarea id="' . $fid . '" name="' . $n . '" rows="5" maxlength="' . $f['max'] . '"' . $req . $desc . '>' . e($val) . '</textarea>';
        } elseif ($f['type'] === 'select') {
            $h .= '<select id="' . $fid . '" name="' . $n . '"' . $req . $desc . '><option value="">Choose…</option>';
            foreach ($f['opts']['options'] ?? [] as $o) {
                $h .= '<option' . ($o === $val ? ' selected' : '') . '>' . e($o) . '</option>';
            }
            $h .= '</select>';
        } else {
            $t = $f['type'];
            $extra = $t === 'number' ? ' inputmode="numeric" min="' . ($f['opts']['min'] ?? 0) . '" max="' . ($f['opts']['max'] ?? 99) . '"' : ' maxlength="' . $f['max'] . '"';
            if ($t === 'number' && $val === '') $val = '1';
            $h .= '<input type="' . $t . '" id="' . $fid . '" name="' . $n . '" value="' . e($val) . '" autocomplete="' . e($f['autocomplete']) . '"' . $extra . $req . $desc . '>';
        }
        $h .= $errHtml . '</div>';
    }
    $h .= '</div><button type="submit" class="btn btn--primary btn--lg">' . e($submit) . '</button>';
    $h .= '</form>';
    return $h;
}
