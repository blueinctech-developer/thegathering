<?php require __DIR__ . '/_header.php';
$heroTitle = $album['title']; $heroEyebrow = $album['year'] ? 'Gallery · ' . $album['year'] : 'Gallery'; $heroIntro = $album['description'];
require __DIR__ . '/_page_hero.php'; ?>
<section class="section section--tight"><div class="wrap">
  <ul class="photo-grid" data-lightbox>
    <?php foreach ($photos as $i => $ph): $alt = $ph['photo_alt'] ?: ($ph['caption'] ?: $album['title'] . ', photo ' . ($i + 1)); ?>
      <li><a href="<?= e(media_url($ph, 1600)) ?>" data-caption="<?= e($ph['caption'] ?? '') ?>" aria-label="View larger: <?= e($alt) ?>"><?= picture($ph, $alt, '(min-width: 900px) 25vw, 50vw') ?></a></li>
    <?php endforeach ?>
  </ul>
  <p><a class="link-arrow link-arrow--back" href="/gallery"><?= icon('arrow', 18) ?> All albums</a></p>
</div></section>
<?php require __DIR__ . '/_footer.php'; ?>
