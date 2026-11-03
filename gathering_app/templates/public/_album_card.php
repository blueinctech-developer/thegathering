<a class="album-card" href="/gallery/<?= e($a['slug']) ?>">
  <span class="album-card__img"><?= picture((int)$a['cover_media_id'], '', '(min-width: 900px) 33vw, 100vw') ?></span>
  <span class="album-card__body">
    <span class="album-card__title"><?= e($a['title']) ?></span>
    <span class="album-card__meta"><?= $a['year'] ? e($a['year']) . ' · ' : '' ?><?= (int)$a['photo_count'] ?> photo<?= (int)$a['photo_count'] === 1 ? '' : 's' ?></span>
  </span>
</a>
