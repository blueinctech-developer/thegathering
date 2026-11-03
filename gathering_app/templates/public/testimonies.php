<?php require __DIR__ . '/_header.php';
$heroTitle = 'Testimonies'; $heroEyebrow = 'What God has done';
require __DIR__ . '/_page_hero.php'; ?>
<?php if ($items): ?>
<section class="section section--tight"><div class="wrap"><div class="quote-grid">
  <?php foreach ($items as $t): ?><figure class="quote reveal"><blockquote><?= nl2p($t['body']) ?></blockquote><figcaption><?= e($t['name']) ?><?php if ($t['location']): ?><span><?= e($t['location']) ?></span><?php endif ?></figcaption></figure><?php endforeach ?>
</div></div></section>
<?php endif ?>
<?php if (form_enabled('testimony')): ?>
<section class="section section--tint"><div class="wrap wrap--mid">
  <h2 class="h-section">Share your testimony</h2>
  <p class="muted">Our team reviews every testimony before it appears on the website. Only your name and city are shown.</p>
  <div class="card"><?= form_render('testimony', ['submit' => 'Send testimony', 'success' => 'Thank you for sharing. Our team will review your testimony before it is published.']) ?></div>
</div></section>
<?php endif ?>
<?php require __DIR__ . '/_footer.php'; ?>
