<?php require __DIR__ . '/_header.php'; $ev = $event;
$heroTitle = $page['title'] ?? 'Venue & travel'; $heroIntro = $page['intro'] ?? ''; $heroMedia = $page['hero_media_id'] ?? null;
require __DIR__ . '/_page_hero.php'; ?>
<?php if ($ev && ($ev['venue_name'] || $ev['map_query'])): ?>
<section class="section"><div class="wrap venue">
  <div>
    <h2 class="h-section"><?= e($ev['venue_name'] ?: 'Find us') ?></h2>
    <?php if ($ev['venue_address']): ?><p class="venue__addr"><?= icon('pin', 22) ?> <?= e($ev['venue_address']) ?></p><?php endif ?>
    <?php if ($ev['starts_at']): ?><p class="venue__addr"><?= icon('calendar', 22) ?> <?= e(fmt_date_range($ev['starts_at'], $ev['ends_at'])) ?></p><?php endif ?>
    <div class="btn-row">
      <?php if ($ev['map_query']): ?><a class="btn btn--primary" href="<?= e(map_link($ev['map_query'])) ?>" target="_blank" rel="noopener noreferrer">Open in Google Maps <?= icon('external', 16) ?></a><?php endif ?>
      <?php if (setting('contact_phone')): ?><a class="btn btn--outline" href="<?= e(tel_href(setting('contact_phone'))) ?>"><?= icon('phone', 18) ?> Call the helpline</a><?php endif ?>
    </div>
  </div>
  <?php if ($ev['map_query']): ?><div class="map"><iframe title="Map showing <?= e($ev['venue_name'] ?: 'the venue') ?>" src="<?= e(map_embed($ev['map_query'])) ?>" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div><?php endif ?>
</div></section>
<?php endif ?>
<?php require __DIR__ . '/_bus.php'; ?>
<?php if ($page && $page['body']): ?><section class="section"><div class="wrap wrap--narrow prose prose--lead"><?= clean_html($page['body']) ?></div></section><?php endif ?>
<?php require __DIR__ . '/_footer.php'; ?>
