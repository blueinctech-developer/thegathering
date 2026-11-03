<?php require __DIR__ . '/_header.php'; ?>
<article class="section speaker-profile">
  <div class="wrap speaker-profile__grid">
    <div class="speaker-profile__photo">
      <?php if ($s['photo_media_id']): ?><?= picture((int)$s['photo_media_id'], $s['name'], '(min-width: 900px) 420px, 100vw', '', true) ?><?php endif ?>
    </div>
    <div>
      <h1 class="h-display"><?= e($s['name']) ?></h1>
      <?php if ($s['role_title'] || $s['ministry']): ?><p class="speaker-profile__role"><?= e(trim($s['role_title'] . ($s['role_title'] && $s['ministry'] ? ' · ' : '') . $s['ministry'])) ?></p><?php endif ?>
      <?php if ($s['bio']): ?><div class="prose"><?= clean_html($s['bio']) ?></div><?php endif ?>
      <?php if ($sessions): ?>
        <h2 class="h-small">Ministering at</h2>
        <ul class="session-list">
          <?php foreach ($sessions as $x): ?>
            <li><strong><?= e($x['title']) ?></strong><span><?= e($x['day_label']) ?><?= $x['starts_at'] ? ' · ' . e(fmt_date($x['starts_at'], 'g:i A')) : '' ?></span></li>
          <?php endforeach ?>
        </ul>
      <?php endif ?>
      <p><a class="link-arrow link-arrow--back" href="/speakers"><?= icon('arrow', 18) ?> All speakers</a></p>
    </div>
  </div>
</article>
<?php require __DIR__ . '/_footer.php'; ?>
