<a class="post-card" href="/news/<?= e($post['slug']) ?>">
  <?php if ($post['cover_media_id']): ?><span class="post-card__img"><?= picture((int)$post['cover_media_id'], '', '(min-width: 900px) 33vw, 100vw') ?></span><?php endif ?>
  <span class="post-card__body">
    <time class="post-card__date" datetime="<?= e(fmt_date($post['published_at'], 'Y-m-d')) ?>"><?= e(fmt_date($post['published_at'])) ?></time>
    <span class="post-card__title"><?= e($post['title']) ?></span>
    <span class="post-card__excerpt"><?= e($post['excerpt'] ?: excerpt((string)$post['body'], 140)) ?></span>
  </span>
</a>
