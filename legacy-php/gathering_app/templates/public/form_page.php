<?php require __DIR__ . '/_header.php';
$heroTitle = $heading; $heroIntro = ($page['intro'] ?? '') ?: $intro; $heroMedia = $page['hero_media_id'] ?? null;
require __DIR__ . '/_page_hero.php'; ?>
<?php if ($page && $page['body']): ?><section class="section section--tight"><div class="wrap wrap--narrow prose prose--lead"><?= clean_html($page['body']) ?></div></section><?php endif ?>
<?php if (form_enabled($type)): ?>
<section class="form-band">
  <div class="wrap form-band__grid">
    <aside class="form-band__aside">
      <h2 class="h-section"><?= e($eyebrow ?? $heading) ?></h2>
      <?php if ($intro): ?><p class="lead"><?= e($intro) ?></p><?php endif ?>
      <ul class="assure">
        <li><?= icon('mail') ?> You will receive a confirmation email with a reference number</li>
        <li><?= icon('heart') ?> Your details are kept private and seen only by our team</li>
      </ul>
    </aside>
    <div class="form-card">
      <h2 class="form-card__title"><?= e($heading) ?></h2>
      <p class="form-card__sub">Fields marked <span class="req">*</span> are required.</p>
      <?= form_render($type, ['submit' => $submit, 'success' => $success]) ?>
    </div>
  </div>
</section>
<?php endif ?>
<?php require __DIR__ . '/_footer.php'; ?>
