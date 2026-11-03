<?php
$transparentHeader = true;
require __DIR__ . '/_header.php';
$ev = $event;
$site = setting('site_name', 'The Gathering');
$live = setting('livestream_url');
$isLive = setting('livestream_is_live') === '1' && valid_http_url($live);
$heroImg = ($ev['hero_media_id'] ?? null) ?: (setting('hero_media_id') ?: null);
$future = $ev && $ev['starts_at'] && strtotime($ev['starts_at']) > time();
$happening = $ev && $ev['starts_at'] && strtotime($ev['starts_at']) <= time() && (!$ev['ends_at'] || strtotime($ev['ends_at']) >= time());
$values = blocks('values');
$glance = blocks('highlights');
$stats = blocks('stats');
$pillars = blocks('pillars');
$challenges = blocks('challenges');
$infra = blocks('infrastructure');
$mission = array_values(array_filter(array_map('trim', preg_split('/\R/', setting('mission_lines')) ?: [])));
$photos = all('SELECT p.media_id, COALESCE(p.alt, m.alt) AS alt FROM photos p JOIN albums a ON a.id = p.album_id AND a.is_published = 1 JOIN media m ON m.id = p.media_id ORDER BY a.sort_order, p.sort_order, p.id LIMIT 10');
$allSpeakers = all('SELECT * FROM speakers WHERE is_published = 1 ORDER BY sort_order, name');
$embed = embed_url(setting('livestream_embed_url') ?: '') ?: ($messages ? embed_url($messages[0]['url']) : '');
?>
<section class="hero<?= $heroImg ? ' hero--image' : '' ?>">
  <?php if ($heroImg): ?><div class="hero__media"><?= picture((int)$heroImg, '', '100vw', 'hero__img', true) ?></div><?php endif ?>
  <div class="wrap hero__inner">
    <h1 class="hero__title"><?= e($ev ? ($ev['theme'] ?: $ev['name']) : $site) ?></h1>
    <?php if ($ev && $ev['theme_scripture']): ?><p class="hero__subtitle"><?= e($ev['theme_scripture']) ?></p><?php endif ?>
    <?php if (setting('hero_summary')): ?><p class="hero__summary"><?= e(setting('hero_summary')) ?></p><?php endif ?>
    <?php if ($ev): ?>
      <ul class="hero__facts">
        <li><?= icon('calendar', 18) ?> <?= e($ev['name']) ?><?= $ev['starts_at'] ? ' · ' . e(fmt_date_range($ev['starts_at'], $ev['ends_at'])) : '' ?></li>
      </ul>
    <?php endif ?>
    <div class="hero__ctas">
      <?php if ($regState === 'open' && feature('register')): ?><a class="btn btn--ember btn--lg" href="/register">Register now <?= icon('arrow', 18) ?></a><?php endif ?>
      <?php if ($isLive): ?><a class="btn btn--ghost btn--lg" href="<?= e($live) ?>" target="_blank" rel="noopener noreferrer"><span class="live-dot" aria-hidden="true"></span> Watch live</a>
      <?php elseif (feature('give')): ?><a class="btn btn--ghost btn--lg" href="/give">Partner with us</a><?php endif ?>
    </div>
  </div>
  <?php if ($future): $diff = max(0, strtotime($ev['starts_at']) - time()); ?>
  <div class="hero__count">
    <div class="wrap hero__count-inner">
      <p class="hero__count-label">Countdown to <strong><?= e($ev['name']) ?></strong></p>
      <div class="countdown" data-countdown="<?= e((new DateTime($ev['starts_at']))->format(DATE_ATOM)) ?>" role="timer" aria-live="off">
        <div><span data-d><?= (int)floor($diff / 86400) ?></span><small>Days</small></div>
        <div><span data-h><?= str_pad((string)floor(($diff % 86400) / 3600), 2, '0', STR_PAD_LEFT) ?></span><small>Hours</small></div>
        <div><span data-m><?= str_pad((string)floor(($diff % 3600) / 60), 2, '0', STR_PAD_LEFT) ?></span><small>Minutes</small></div>
        <div><span data-s><?= str_pad((string)($diff % 60), 2, '0', STR_PAD_LEFT) ?></span><small>Seconds</small></div>
      </div>
    </div>
  </div>
  <?php elseif ($happening): ?>
  <div class="hero__count"><div class="wrap hero__count-inner"><p class="hero__count-label"><span class="live-dot" aria-hidden="true"></span><strong><?= e($ev['name']) ?> is happening now</strong></p></div></div>
  <?php endif ?>
</section>

<?php if ($values): ?>
<section class="values" aria-label="Our values">
  <div class="wrap values__grid">
    <?php foreach ($values as $v): ?><div class="value"><?= block_icon($v['icon'], 34) ?><div><h3><?= e($v['title']) ?></h3><p><?= e($v['body']) ?></p></div></div><?php endforeach ?>
  </div>
</section>
<?php endif ?>

<?php if (setting('welcome_heading') || setting('welcome_body')): ?>
<section class="section">
  <div class="wrap">
    <div class="intro__grid">
      <div>
        <?php if (setting('welcome_heading')): ?><h2 class="h-display reveal"><?= e(setting('welcome_heading')) ?></h2><?php endif ?>
        <div class="prose prose--lead reveal" style="margin-top:26px"><?= clean_html(setting('welcome_body')) ?></div>
        <?php if (feature('about')): ?><p class="reveal" style="margin-top:30px"><a class="link-arrow" href="/about">Read our story <?= icon('arrow', 18) ?></a></p><?php endif ?>
      </div>
      <?php if ($photos): ?><div class="intro__photo reveal"><?= picture((int)$photos[0]['media_id'], (string)$photos[0]['alt'], '(min-width: 960px) 40vw, 100vw') ?></div><?php endif ?>
    </div>
    <?php if ($glance): ?>
      <ul class="glance">
        <?php foreach ($glance as $g): ?><li class="reveal"><span class="icon-chip"><?= block_icon($g['icon'], 28) ?></span><div><h3><?= e($g['title']) ?></h3><p><?= e($g['body']) ?></p></div></li><?php endforeach ?>
      </ul>
    <?php endif ?>
  </div>
</section>
<?php endif ?>

<?php if ($stats): ?>
<section class="stats" aria-label="Our impact">
  <div class="wrap">
    <h2 class="stats__title">Our efforts are measured not just in numbers, but in transformed lives.</h2>
    <div class="stats__grid"><?php foreach ($stats as $s): ?><div class="stat reveal"><span class="stat__num"><?= e($s['title']) ?></span><span class="stat__label"><?= e($s['body']) ?></span></div><?php endforeach ?></div>
  </div>
</section>
<?php endif ?>

<?php if ($allSpeakers): ?>
<section class="section">
  <div class="wrap">
    <div class="sec-head">
      <div><h2 class="h-section">Ministers &amp; speakers</h2><p class="lead">Servants of God ministering under the theme <?= e($ev['theme'] ?? '') ?> at <?= e($ev['name'] ?? $site) ?>.</p></div>
    </div>
    <div class="lineup">
      <?php if (!empty($ev['flyer_media_id'])): ?><div class="lineup__flyer reveal"><?= picture((int)$ev['flyer_media_id'], (string)(media_get((int)$ev['flyer_media_id'])['alt'] ?? ''), '(min-width: 1000px) 55vw, 100vw') ?></div><?php endif ?>
      <ul class="names reveal">
        <?php foreach ($allSpeakers as $s): ?><li><strong><?= e($s['name']) ?></strong><?php if ($s['role_title']): ?><span><?= e($s['role_title']) ?></span><?php endif ?></li><?php endforeach ?>
      </ul>
    </div>
  </div>
</section>
<?php endif ?>

<?php if ($pillars): ?>
<section class="section section--dark">
  <div class="wrap">
    <div class="sec-head">
      <div><h2 class="h-section">How The Gathering creates impact</h2><p class="lead">Prayer and compassion together, creating spiritual and community transformation through outreach, service, and ministry.</p></div>
    </div>
    <ol class="pillars__grid">
      <?php foreach ($pillars as $i => $p): ?>
        <li class="pillar reveal">
          <div class="pillar__top"><span class="pillar__icon"><?= block_icon($p['icon'], 28) ?></span><span class="pillar__num"><?= str_pad((string)($i + 1), 2, '0', STR_PAD_LEFT) ?></span></div>
          <h3><?= e($p['title']) ?></h3>
          <p><?= e($p['body']) ?></p>
        </li>
      <?php endforeach ?>
    </ol>
  </div>
</section>
<?php endif ?>

<?php if ($mission): ?>
<section class="mission" aria-label="What we believe">
  <div class="wrap">
    <?php foreach ($mission as $line): ?><p class="mission__line reveal"><span><?= e($line) ?></span></p><?php endforeach ?>
  </div>
</section>
<?php endif ?>

<?php require __DIR__ . '/_bus.php'; ?>

<?php if (setting('why_heading') || $challenges): ?>
<section class="section">
  <div class="wrap split">
    <?php if (isset($photos[2])): ?><div class="split__photo reveal"><?= picture((int)$photos[2]['media_id'], (string)$photos[2]['alt'], '(min-width: 960px) 45vw, 100vw') ?></div><?php endif ?>
    <div>
      <h2 class="h-section reveal"><?= e(setting('why_heading', 'Why The Gathering matters')) ?></h2>
      <?php if ($challenges): ?><ul class="needs reveal"><?php foreach ($challenges as $c): ?><li><?= block_icon($c['icon'], 24) ?><span><?= e($c['title']) ?></span></li><?php endforeach ?></ul><?php endif ?>
      <?php if (setting('why_body')): ?><div class="prose reveal"><?= nl2p(setting('why_body')) ?></div><?php endif ?>
    </div>
  </div>
</section>
<?php endif ?>

<?php if ($embed): ?>
<?php $ytId = preg_match('~youtube-nocookie\.com/embed/([A-Za-z0-9_-]{11})~', $embed, $ym) ? $ym[1] : ''; $vTitle = $messages[0]['title'] ?? $site . ' video'; ?>
<section class="section watch-band">
  <div class="wrap watch">
    <div>
      <h2 class="h-section">Watch <?= e($ev['theme'] ?? 'The Gathering') ?></h2>
      <p class="lead">A glimpse of what God is doing through The Gathering: worship, outreach, and transformation.</p>
    </div>
    <?php if ($ytId): ?>
    <div class="video reveal">
      <a class="video__facade" href="https://www.youtube.com/watch?v=<?= e($ytId) ?>" target="_blank" rel="noopener noreferrer" data-video-embed="<?= e($embed) ?>?autoplay=1" data-video-title="<?= e($vTitle) ?>">
        <img src="https://i.ytimg.com/vi/<?= e($ytId) ?>/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">
        <span class="video__play" aria-hidden="true"><?= icon('play', 28) ?></span>
        <span class="sr-only">Play video: <?= e($vTitle) ?></span>
      </a>
    </div>
    <?php else: ?>
    <div class="video reveal"><iframe src="<?= e($embed) ?>" title="<?= e($vTitle) ?>" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
    <?php endif ?>
  </div>
</section>
<?php endif ?>

<?php if (setting('land_heading')): ?>
<section class="land">
  <?php if (isset($photos[3])): ?><div class="land__bg"><?= picture((int)$photos[3]['media_id'], '', '100vw') ?></div><?php endif ?>
  <div class="wrap land__grid">
    <div>
      <h2 class="h-section reveal"><?= e(setting('land_heading')) ?></h2>
      <?php if (setting('land_body')): ?><div class="prose reveal"><?= nl2p(setting('land_body')) ?></div><?php endif ?>
      <div class="btn-row reveal">
        <?php if (feature('give')): ?><a class="btn btn--ember btn--lg" href="/give">Sponsor the land</a><?php endif ?>
        <?php if (page_published('outreach')): ?><a class="btn btn--ghost btn--lg" href="/outreach#land">See the plans</a><?php endif ?>
      </div>
    </div>
    <div class="land__panel reveal">
      <?php if (setting('land_figure')): ?><p class="land__figure"><?= e(setting('land_figure')) ?></p><p class="land__figure-label"><?= e(setting('land_figure_label')) ?></p><?php endif ?>
      <?php if ($infra): ?><ul class="land__list"><?php foreach ($infra as $b): ?><li><?= block_icon($b['icon'], 22) ?> <?= e($b['title']) ?></li><?php endforeach ?></ul><?php endif ?>
    </div>
  </div>
</section>
<?php endif ?>

<?php if (count($photos) >= 9): ?>
<section class="section">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="h-section">The Gathering in pictures</h2></div></div>
    <div class="mosaic">
      <?php foreach (array_slice($photos, 4, 5) as $i => $ph): ?><div class="mosaic__item mosaic__item--<?= $i + 1 ?> reveal"><?= picture((int)$ph['media_id'], (string)$ph['alt'], $i === 0 ? '(min-width: 900px) 50vw, 100vw' : '(min-width: 900px) 25vw, 50vw') ?></div><?php endforeach ?>
    </div>
  </div>
</section>
<?php endif ?>

<?php if ($testimonies): ?>
<section class="section section--tint">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="h-section">What God has done</h2></div><a class="link-arrow" href="/testimonies">Read more <?= icon('arrow', 18) ?></a></div>
    <div class="quote-grid"><?php foreach ($testimonies as $t): ?><figure class="quote reveal"><blockquote><?= nl2p(excerpt($t['body'], 320)) ?></blockquote><figcaption><?= e($t['name']) ?><?php if ($t['location']): ?><span><?= e($t['location']) ?></span><?php endif ?></figcaption></figure><?php endforeach ?></div>
  </div>
</section>
<?php endif ?>

<?php if ($posts): ?>
<section class="section">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="h-section">Announcements</h2></div><a class="link-arrow" href="/news">All news <?= icon('arrow', 18) ?></a></div>
    <ul class="post-grid"><?php foreach ($posts as $post): ?><li class="reveal"><?php require __DIR__ . '/_post_card.php'; ?></li><?php endforeach ?></ul>
  </div>
</section>
<?php endif ?>

<?php if (setting('partner_heading')): ?>
<section class="partner">
  <div class="wrap partner__inner">
    <div>
      <h2 class="h-display reveal"><?= e(setting('partner_heading')) ?></h2>
      <?php if (setting('partner_body')): ?><p class="partner__body reveal"><?= e(setting('partner_body')) ?></p><?php endif ?>
    </div>
    <div class="btn-row reveal">
      <?php if (feature('give')): ?><a class="btn btn--ember btn--lg" href="/give">Become a partner <?= icon('arrow', 18) ?></a><?php endif ?>
      <?php if (form_enabled('contact')): ?><a class="btn btn--ghost btn--lg" href="/contact">Contact us</a><?php endif ?>
    </div>
  </div>
</section>
<?php endif ?>
<?php require __DIR__ . '/_footer.php'; ?>
