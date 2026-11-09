<?php
/**
 * Retry queued / failed emails. Run every 10 minutes from hPanel > Advanced > Cron Jobs:
 *   /usr/bin/php /home/USERNAME/domains/thegatheringcof.org/gathering_app/bin/send-mail.php
 */
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require dirname(__DIR__) . '/bootstrap.php';
$r = mail_process_queue(50);
echo date('c') . " sent={$r['sent']} failed={$r['failed']}\n";
