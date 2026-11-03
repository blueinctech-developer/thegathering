<?php require __DIR__ . '/_header.php';
$heroTitle = 'News & announcements'; $heroEyebrow = setting('site_name', 'The Gathering');
require __DIR__ . '/_page_hero.php'; ?>
<section class="section section--tight"><div class="wrap">
  <ul class="post-grid"><?php foreach ($posts as $post): ?><li class="reveal"><?php require __DIR__ . '/_post_card.php'; ?></li><?php endforeach ?></ul>
</div></section>
<?php require __DIR__ . '/_footer.php'; ?>
