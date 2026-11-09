<?php
$stops = blocks('bus_stops');
if (!$stops || !setting('bus_heading')) return;
$busFlyer = setting('bus_media_id') ? (int)setting('bus_media_id') : null;
?>
<section class="section section--dark" id="bus" aria-labelledby="bus-h">
  <div class="wrap bus">
    <?php if ($busFlyer): ?><div class="bus__flyer reveal"><?= picture($busFlyer, 'Join the bus flyer with pick-up locations and times', '(min-width: 1000px) 40vw, 100vw') ?></div><?php endif ?>
    <div>
      <h2 class="h-section" id="bus-h"><?= e(setting('bus_heading')) ?></h2>
      <?php if (setting('bus_body')): ?><p class="lead"><?= e(setting('bus_body')) ?></p><?php endif ?>
      <div class="bus__facts">
        <?php if (setting('bus_fee')): ?><div class="bus__fact"><small>Bus fee</small><strong><?= e(setting('bus_fee')) ?></strong></div><?php endif ?>
        <?php if (setting('bus_time')): ?><div class="bus__fact"><small>Departure</small><strong><?= e(setting('bus_time')) ?></strong></div><?php endif ?>
        <?php if (setting('contact_phone')): ?><div class="bus__fact"><small>Helpline</small><strong><a href="<?= e(tel_href(setting('contact_phone'))) ?>"><?= e(setting('contact_phone')) ?></a></strong></div><?php endif ?>
      </div>
      <ol class="stops" aria-label="Pick-up locations">
        <?php foreach ($stops as $s): ?><li><span><strong><?= e($s['title']) ?></strong><?php if ($s['body']): ?><span><?= e($s['body']) ?></span><?php endif ?></span></li><?php endforeach ?>
      </ol>
      <?php if (setting('bus_dropoff')): ?><p class="bus__drop"><?= icon('pin', 20) ?><span><strong>Drop-off:</strong> <?= e(setting('bus_dropoff')) ?></span></p><?php endif ?>
    </div>
  </div>
</section>
