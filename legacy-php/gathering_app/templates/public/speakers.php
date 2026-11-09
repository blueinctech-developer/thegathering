<?php require __DIR__ . '/_header.php';
$ev = current_event();
$heroTitle = 'Ministers & speakers'; $heroIntro = $ev ? 'Servants of God ministering under the theme ' . $ev['theme'] . ' at ' . $ev['name'] . '.' : '';
require __DIR__ . '/_page_hero.php'; ?>
<?php if ($ev && $ev['flyer_media_id']): ?>
<section class="section section--tight"><div class="wrap"><div class="lineup__flyer"><?= picture((int)$ev['flyer_media_id'], (string)(media_get((int)$ev['flyer_media_id'])['alt'] ?? ''), '(min-width: 1240px) 1140px, 100vw') ?></div></div></section>
<?php endif ?>
<section class="section<?= $ev && $ev['flyer_media_id'] ? ' section--tint' : '' ?>"><div class="wrap">
  <ul class="speaker-grid">
    <?php foreach ($speakers as $s): ?><li class="reveal"><?php require __DIR__ . '/_speaker_card.php'; ?></li><?php endforeach ?>
  </ul>
</div></section>
<?php require __DIR__ . '/_footer.php'; ?>
