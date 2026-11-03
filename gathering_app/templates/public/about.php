<?php require __DIR__ . '/_header.php';
$heroTitle = $page['title']; $heroIntro = $page['intro']; $heroMedia = $page['hero_media_id'];
$heroCtas = feature('give') ? '<a class="btn btn--ember btn--lg" href="/give">Partner with us</a>' : '';
require __DIR__ . '/_page_hero.php';
$activities = blocks('activities'); $stats = blocks('stats'); $challenges = blocks('challenges'); $governance = blocks('governance'); $values = blocks('values'); ?>

<?php if ($values): ?>
<section class="values" aria-label="Our values"><div class="wrap values__grid">
  <?php foreach ($values as $v): ?><div class="value"><?= block_icon($v['icon'], 34) ?><div><h3><?= e($v['title']) ?></h3><p><?= e($v['body']) ?></p></div></div><?php endforeach ?>
</div></section>
<?php endif ?>

<section class="section"><div class="wrap wrap--narrow prose prose--lead"><?= clean_html((string)$page['body']) ?>
  <?php if ($governance): ?><ul class="ticks ticks--2" style="margin-top:28px;padding:0"><?php foreach ($governance as $g): ?><li><?= e($g['title']) ?></li><?php endforeach ?></ul><?php endif ?>
</div></section>

<?php if ($challenges || setting('why_body')): ?>
<section class="section section--tint"><div class="wrap split split--top">
  <div><h2 class="h-section"><?= e(setting('why_heading', 'Why The Gathering matters')) ?></h2><?php if (setting('why_body')): ?><div class="prose" style="margin-top:22px"><?= nl2p(setting('why_body')) ?></div><?php endif ?></div>
  <?php if ($challenges): ?><ul class="needs" style="margin:0"><?php foreach ($challenges as $c): ?><li><?= block_icon($c['icon'], 24) ?><span><?= e($c['title']) ?></span></li><?php endforeach ?></ul><?php endif ?>
</div></section>
<?php endif ?>

<?php if ($activities): ?>
<section class="section section--dark"><div class="wrap">
  <div class="sec-head"><div><h2 class="h-section">The Gathering in action</h2></div></div>
  <ol class="pillars__grid">
    <?php foreach ($activities as $i => $a): ?><li class="pillar reveal"><div class="pillar__top"><span class="pillar__icon"><?= block_icon($a['icon'], 28) ?></span><span class="pillar__num"><?= str_pad((string)($i + 1), 2, '0', STR_PAD_LEFT) ?></span></div><h3><?= e($a['title']) ?></h3><p><?= e($a['body']) ?></p></li><?php endforeach ?>
  </ol>
</div></section>
<?php endif ?>

<?php if ($stats): ?>
<section class="stats" aria-label="Our impact"><div class="wrap">
  <h2 class="stats__title">Our efforts are measured not just in numbers, but in transformed lives.</h2>
  <div class="stats__grid"><?php foreach ($stats as $s): ?><div class="stat reveal"><span class="stat__num"><?= e($s['title']) ?></span><span class="stat__label"><?= e($s['body']) ?></span></div><?php endforeach ?></div>
</div></section>
<?php endif ?>
<?php require __DIR__ . '/_footer.php'; ?>
