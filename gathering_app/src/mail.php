<?php
declare(strict_types=1);

require_once APP_DIR . '/vendor/phpmailer/Exception.php';
require_once APP_DIR . '/vendor/phpmailer/PHPMailer.php';
require_once APP_DIR . '/vendor/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;

/** Add an email to the outbox. Nothing is lost if sending later fails. */
function mail_queue(string $purpose, string $to, string $subject, string $html, string $text, ?int $submissionId = null, ?string $replyTo = null): int
{
    q('INSERT INTO email_outbox (submission_id, purpose, to_email, reply_to, subject, body_html, body_text) VALUES (?,?,?,?,?,?,?)',
        [$submissionId, $purpose, $to, $replyTo, $subject, $html, $text]);
    return last_id();
}

/** Try to send one queued email. Returns true on success. Logs every attempt. */
function mail_send_one(int $id): bool
{
    $m = one('SELECT * FROM email_outbox WHERE id = ?', [$id]);
    if (!$m || $m['status'] === 'sent') {
        return (bool)$m;
    }
    $error = null;
    try {
        $transport = config('mail.transport', 'smtp');
        if ($transport === 'file') {
            $dir = APP_DIR . '/storage/mail';
            @mkdir($dir, 0755, true);
            $eml = "To: {$m['to_email']}\nSubject: {$m['subject']}\nReply-To: {$m['reply_to']}\n\n{$m['body_text']}\n\n----- HTML -----\n{$m['body_html']}";
            if (file_put_contents("$dir/" . date('Ymd-His') . "-{$m['id']}.eml", $eml) === false) {
                throw new RuntimeException('Could not write mail file');
            }
        } else {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = (string)config('mail.host');
            $mail->Port = (int)config('mail.port', 465);
            $enc = (string)config('mail.encryption', 'ssl');
            if ($enc === 'ssl') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            } elseif ($enc === 'tls') {
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            } else {
                $mail->SMTPSecure = '';
                $mail->SMTPAutoTLS = false;
            }
            $user = (string)config('mail.username', '');
            $mail->SMTPAuth = $user !== '';
            $mail->Username = $user;
            $mail->Password = (string)config('mail.password', '');
            $mail->Timeout = 15;
            $mail->CharSet = 'UTF-8';
            $mail->setFrom((string)config('mail.from_email'), (string)config('mail.from_name', setting('site_name', 'The Gathering')));
            $mail->addAddress($m['to_email']);
            if ($m['reply_to'] && filter_var($m['reply_to'], FILTER_VALIDATE_EMAIL)) {
                $mail->addReplyTo($m['reply_to']);
            }
            $mail->Subject = $m['subject'];
            $mail->isHTML(true);
            $mail->Body = $m['body_html'];
            $mail->AltBody = $m['body_text'];
            $mail->send();
        }
    } catch (Throwable $ex) {
        $error = mb_substr(preg_replace('/\s+/', ' ', $ex->getMessage()) ?? 'error', 0, 480);
    }

    if ($error === null) {
        q("UPDATE email_outbox SET status='sent', attempts=attempts+1, last_attempt_at=NOW(), sent_at=NOW(), last_error=NULL WHERE id=?", [$id]);
        app_log('mail', "sent #$id ({$m['purpose']})");
    } else {
        q("UPDATE email_outbox SET status='failed', attempts=attempts+1, last_attempt_at=NOW(), last_error=? WHERE id=?", [$error, $id]);
        app_log('mail', "FAILED #$id ({$m['purpose']}): $error");
    }
    if ($m['submission_id']) {
        submission_refresh_email_status((int)$m['submission_id']);
    }
    return $error === null;
}

function submission_refresh_email_status(int $submissionId): void
{
    $rows = all('SELECT status FROM email_outbox WHERE submission_id = ?', [$submissionId]);
    if (!$rows) {
        $status = 'none';
    } else {
        $st = array_column($rows, 'status');
        $status = in_array('failed', $st, true) ? 'failed' : (in_array('queued', $st, true) ? 'pending' : 'sent');
    }
    q('UPDATE submissions SET email_status = ? WHERE id = ?', [$status, $submissionId]);
}

/** Retry queued/failed emails (cron). Gives up after 6 attempts. */
function mail_process_queue(int $limit = 25): array
{
    $ids = array_column(all("SELECT id FROM email_outbox WHERE status IN ('queued','failed') AND attempts < 6
        AND (last_attempt_at IS NULL OR last_attempt_at < (NOW() - INTERVAL (attempts * 5) MINUTE))
        ORDER BY id LIMIT " . (int)$limit), 'id');
    $ok = 0;
    $fail = 0;
    foreach ($ids as $id) {
        mail_send_one((int)$id) ? $ok++ : $fail++;
    }
    return ['sent' => $ok, 'failed' => $fail];
}

/** Wrap content in the branded email layout. */
function mail_layout(string $heading, string $bodyHtml): string
{
    return render('email/layout', ['heading' => $heading, 'body' => $bodyHtml]);
}

/** Turn a list of label => value pairs into an email-friendly table + text block. */
function mail_fields(array $fields): array
{
    $html = '<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0">';
    $text = '';
    foreach ($fields as $label => $value) {
        if ($value === '' || $value === null) {
            continue;
        }
        $html .= '<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid #eee;color:#6b7280;font-size:13px;vertical-align:top;width:38%">' . e($label) . '</td>'
            . '<td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#111827">' . nl2br(e((string)$value)) . '</td></tr>';
        $text .= "$label: $value\n";
    }
    $html .= '</table>';
    return [$html, $text];
}
