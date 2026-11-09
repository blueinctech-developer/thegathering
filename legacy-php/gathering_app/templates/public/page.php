<?php require __DIR__ . '/_header.php';
$heroTitle = $page['title']; $heroIntro = $page['intro']; $heroMedia = $page['hero_media_id']; $heroEyebrow = '';
require __DIR__ . '/_page_hero.php'; ?>
<div class="section section--tight"><div class="wrap wrap--narrow prose"><?= clean_html((string)$page['body']) ?></div></div>
<?php require __DIR__ . '/_footer.php'; ?>
