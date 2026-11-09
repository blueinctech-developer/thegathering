<?php require __DIR__ . '/_header.php';
$heroTitle = 'Watch & listen'; $heroEyebrow = setting('site_name', 'The Gathering');
require __DIR__ . '/_page_hero.php';
$live = setting('livestream_url'); $embed = embed_url(setting('livestream_embed_url') ?: $live); $isLive = setting('livestream_is_live') === '1'; ?>
<section class="section section--tight"><div class="wrap">
  <?php if ($embed || valid_http_url($live)): ?>
    <div class="live-block">
      <div class="live-block__head">
        <h2 class="h-section"><?php if ($isLive): ?><span class="live-dot" aria-hidden="true"></span> Live now<?php else: ?>Livestream<?php endif ?></h2>
        <?php if (valid_http_url($live)): ?><a class="btn btn--primary" href="<?= e($live) ?>" target="_blank" rel="noopener noreferrer"><?= icon('play', 18) ?> Watch on <?= str_contains($live, 'facebook') ? 'Facebook' : (str_contains($live, 'youtu') ? 'YouTube' : 'our channel') ?></a><?php endif ?>
      </div>
      <?php if ($embed): ?><div class="video"><iframe src="<?= e($embed) ?>" title="Livestream" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><?php endif ?>
    </div>
  <?php endif ?>
  <?php if ($messages): ?>
    <h2 class="h-section">Messages</h2>
    <ul class="media-grid media-grid--light"><?php foreach ($messages as $msg): ?><li class="reveal"><?php require __DIR__ . '/_message_card.php'; ?></li><?php endforeach ?></ul>
  <?php endif ?>
</div></section>
<?php require __DIR__ . '/_footer.php'; ?>
