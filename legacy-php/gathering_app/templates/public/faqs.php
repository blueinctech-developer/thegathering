<?php require __DIR__ . '/_header.php';
$heroTitle = 'Frequently asked questions'; $heroEyebrow = 'Help';
require __DIR__ . '/_page_hero.php'; ?>
<section class="section section--tight"><div class="wrap wrap--narrow">
  <div class="faq">
    <?php foreach ($faqs as $f): ?>
      <details class="faq__item"><summary><?= e($f['question']) ?></summary><div class="prose"><?= nl2p($f['answer']) ?></div></details>
    <?php endforeach ?>
  </div>
  <?php if (form_enabled('contact')): ?><p class="faq__more">Still have a question? <a href="/contact">Contact us</a>.</p><?php endif ?>
</div></section>
<?php require __DIR__ . '/_footer.php'; ?>
