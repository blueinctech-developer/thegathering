<?php require __DIR__ . '/_header.php';
$heroTitle = $page['title']; $heroIntro = $page['intro']; $heroMedia = $page['hero_media_id'];
$heroCtas = feature('give') ? '<a class="btn btn--ember btn--lg" href="/give">Partner with us</a>' : '';
require __DIR__ . '/_page_hero.php';
$programmes = blocks('programmes'); $medical = blocks('medical_services'); $infra = blocks('infrastructure'); $goals = blocks('goals'); $vision = blocks('land_vision');
$photo = fallback_photo('/outreach/medical'); ?>

<?php if ($programmes): ?>
<section class="section"><div class="wrap">
  <div class="sec-head"><div><h2 class="h-section">Strategic aid programmes</h2><p class="lead">Direct action where it matters most. Every programme is vetted for maximum ground-level impact.</p></div></div>
  <div class="programmes">
    <?php foreach ($programmes as $pg): ?><article class="programme reveal"><span class="pillar__icon"><?= block_icon($pg['icon'], 28) ?></span><h3><?= e($pg['title']) ?></h3><?= nl2p((string)$pg['body']) ?></article><?php endforeach ?>
  </div>
</div></section>
<?php endif ?>

<?php if ($medical): ?>
<section class="section section--tint"><div class="wrap split">
  <?php if ($photo): ?><div class="split__photo reveal"><?= picture($photo, '', '(min-width: 960px) 45vw, 100vw') ?></div><?php endif ?>
  <div>
    <h2 class="h-section">Medical outreach: serving the community</h2>
    <p class="lead">Free health screening, consultation and basic medication for up to 5,000 people, supported by volunteer medical professionals and partners committed to improving access to healthcare.</p>
    <ul class="ticks ticks--2"><?php foreach ($medical as $m): ?><li><?= e($m['title']) ?></li><?php endforeach ?></ul>
  </div>
</div></section>
<?php endif ?>

<?php if ($infra || $vision): ?>
<section class="section section--dark" id="land"><div class="wrap">
  <div class="sec-head">
    <div><h2 class="h-section">The Gathering Land<?= setting('land_figure') ? ' · ' . e(setting('land_figure')) : '' ?></h2><?php if (setting('land_body')): ?><p class="lead"><?= e(setting('land_body')) ?></p><?php endif ?></div>
    <?php if (feature('give')): ?><a class="btn btn--ember" href="/give">Sponsor the land</a><?php endif ?>
  </div>
  <?php if ($vision): ?><h3 class="h-small" style="color:#fff">Vision for the land</h3><ul class="ticks ticks--2" style="margin-bottom:56px"><?php foreach ($vision as $v): ?><li><?= e($v['title']) ?></li><?php endforeach ?></ul><?php endif ?>
  <?php if ($infra): ?><h3 class="h-small" style="color:#fff">Infrastructure plans</h3>
    <ul class="infra"><?php foreach ($infra as $b): ?><li class="infra__item reveal"><span class="pillar__icon"><?= block_icon($b['icon'], 26) ?></span><h3><?= e($b['title']) ?></h3><p><?= e($b['body']) ?></p></li><?php endforeach ?></ul><?php endif ?>
</div></section>
<?php endif ?>

<?php if ($goals): ?>
<section class="section"><div class="wrap">
  <div class="sec-head"><div><h2 class="h-section">Our impact goals for <?= e(current_event() && current_event()['starts_at'] ? fmt_date(current_event()['starts_at'], 'Y') : date('Y')) ?></h2><p class="lead">Through prayer, compassion, and practical support, we are working toward these goals.</p></div></div>
  <div class="goals">
    <?php foreach ($goals as $g): ?><div class="goal reveal"><span class="pillar__icon"><?= block_icon($g['icon'], 26) ?></span><h3><?= e($g['title']) ?></h3><ul><?php foreach (array_filter(array_map('trim', preg_split('/\R/', (string)$g['body']) ?: [])) as $line): ?><li><?= e($line) ?></li><?php endforeach ?></ul></div><?php endforeach ?>
  </div>
</div></section>
<?php endif ?>
<?php require __DIR__ . '/_footer.php'; ?>
