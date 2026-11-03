<?php
$site = setting('site_name', 'The Gathering');
$brand = preg_match('/^#[0-9a-f]{6}$/i', setting('brand_primary')) ? setting('brand_primary') : '#0b0b0c';
$accent = preg_match('/^#[0-9a-f]{6}$/i', setting('brand_accent')) ? setting('brand_accent') : '#ffcc00';
$logo = setting('logo_light_media_id') ?: setting('logo_media_id');
?><!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title><?= e($heading) ?></title></head>
<body style="margin:0;padding:0;background:#f4f1ea;font-family:Helvetica,Arial,sans-serif;color:#111827">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea;padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden">
    <tr><td style="background:<?= e($brand) ?>;padding:24px 28px;border-bottom:4px solid <?= e($accent) ?>">
      <?php if ($logo): ?><img src="<?= e(media_url((int)$logo, 480, true)) ?>" alt="<?= e($site) ?>" height="44" style="display:block;height:44px;width:auto;border:0"><?php else: ?><span style="color:#ffffff;font-size:20px;font-weight:bold"><?= e($site) ?></span><?php endif ?>
    </td></tr>
    <tr><td style="padding:28px">
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#111827"><?= e($heading) ?></h1>
      <div style="font-size:15px;line-height:1.6;color:#374151"><?= $body ?></div>
    </td></tr>
    <tr><td style="padding:18px 28px;background:#faf8f3;font-size:12px;color:#6b7280;line-height:1.5">
      <?= e($site) ?><?php if (setting('contact_email')): ?> · <a href="mailto:<?= e(setting('contact_email')) ?>" style="color:#6b7280"><?= e(setting('contact_email')) ?></a><?php endif ?><?php if (setting('contact_phone')): ?> · <?= e(setting('contact_phone')) ?><?php endif ?><br>
      <a href="<?= e(base_url()) ?>" style="color:#6b7280"><?= e(preg_replace('~^https?://~', '', base_url())) ?></a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>
