<?php require __DIR__ . '/_header.php';
$heroTitle = 'Gallery'; $heroEyebrow = 'Moments from past gatherings';
require __DIR__ . '/_page_hero.php';
$byYear = []; foreach ($albums as $a) { $byYear[$a['year'] ?: 'Albums'][] = $a; } ?>
<section class="section section--tight"><div class="wrap">
  <?php foreach ($byYear as $year => $list): ?>
    <h2 class="h-section gallery-year"><?= e((string)$year) ?></h2>
    <ul class="album-grid"><?php foreach ($list as $a): ?><li class="reveal"><?php require __DIR__ . '/_album_card.php'; ?></li><?php endforeach ?></ul>
  <?php endforeach ?>
</div></section>
<?php require __DIR__ . '/_footer.php'; ?>
