<?php require __DIR__ . '/_header.php';
$heroTitle = $page['title'] ?? 'Give & partner'; $heroIntro = ($page['intro'] ?? '') ?: setting('giving_intro'); $heroMedia = $page['hero_media_id'] ?? null;
$heroCtas = form_enabled('partnership') ? '<a class="btn btn--ember btn--lg" href="#partner">Become a partner</a>' : '';
require __DIR__ . '/_page_hero.php';
$online = setting('giving_online_url'); $bank = setting('giving_bank_details'); $accounts = blocks('bank_accounts');
$tiers = blocks('partner_tiers'); $streams = blocks('funding_streams'); $total = label_lines(setting('funding_total')); ?>

<?php if ($tiers): ?>
<section class="section">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="h-section">Ways to partner</h2><p class="lead">The Gathering continues to grow in impact and reach. The scale of this work now requires committed partners who share the vision.</p></div></div>
    <div class="tiers">
      <?php foreach ($tiers as $t): ?><div class="tier reveal"><span class="pillar__icon"><?= block_icon($t['icon'], 28) ?></span><h3><?= e($t['title']) ?></h3><p><?= e($t['body']) ?></p></div><?php endforeach ?>
    </div>
  </div>
</section>
<?php endif ?>

<?php if ($streams): ?>
<section class="section section--dark">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="h-section">Strategic partnership streams</h2><p class="lead">Each stream represents a key area of impact for <?= e(current_event()['name'] ?? 'The Gathering') ?>.</p></div></div>
    <ol class="streams">
      <?php foreach ($streams as $s): ?>
        <li class="stream reveal"><span class="stream__num"></span><h3><?= e($s['title']) ?></h3>
          <dl><?php foreach (label_lines($s['body']) as [$k, $v]): ?><div><dt><?= e($k) ?></dt><dd><?= e($v) ?></dd></div><?php endforeach ?></dl></li>
      <?php endforeach ?>
    </ol>
    <?php if ($total): ?>
      <div class="total reveal"><h3>Total funding requirement</h3>
        <dl><?php foreach ($total as [$k, $v]): ?><div><dt><?= e($k) ?></dt><dd><?= e($v) ?></dd></div><?php endforeach ?></dl></div>
    <?php endif ?>
    <div class="docs-cta">
      <?php if (setting('funding_note')): ?><p><?= e(setting('funding_note')) ?></p><?php endif ?>
    </div>
  </div>
</section>
<?php endif ?>

<?php if (valid_http_url($online) || $bank !== '' || $accounts): ?>
<section class="section section--tint">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="h-section">Give now</h2></div></div>
    <div class="give-grid">
      <?php if (valid_http_url($online)): ?>
        <div class="card give-card"><span class="pillar__icon"><?= block_icon('heart', 28) ?></span><h3 class="h-small">Give online</h3><p>Give securely through our online giving page.</p>
          <a class="btn btn--ember btn--lg" href="<?= e($online) ?>" target="_blank" rel="noopener noreferrer"><?= e(setting('giving_online_label', 'Give online')) ?> <?= icon('external', 16) ?></a></div>
      <?php endif ?>
      <?php foreach ($accounts as $acc): $lines = array_values(array_filter(array_map('trim', preg_split('/\R/', (string)$acc['body']) ?: []))); ?>
        <div class="card give-card"><h3 class="h-small"><?= e($acc['title']) ?></h3>
          <dl class="bank-lines"><?php foreach (label_lines($acc['body']) as [$k, $v]): ?><div><?php if ($v !== ''): ?><dt><?= e($k) ?></dt><dd><?= e($v) ?></dd><?php else: ?><dd><?= e($k) ?></dd><?php endif ?></div><?php endforeach ?></dl>
          <button type="button" class="btn btn--outline btn--sm" data-copy="<?= e($acc['title'] . "\n" . implode("\n", $lines)) ?>">Copy details</button></div>
      <?php endforeach ?>
      <?php if ($bank !== ''): ?>
        <div class="card give-card"><h3 class="h-small">Bank transfer</h3><div class="bank-details"><?= nl2br(e($bank)) ?></div>
          <button type="button" class="btn btn--outline btn--sm" data-copy="<?= e($bank) ?>">Copy details</button></div>
      <?php endif ?>
    </div>
  </div>
</section>
<?php endif ?>

<?php if ($page && $page['body']): ?><section class="section"><div class="wrap wrap--narrow prose prose--lead"><?= clean_html($page['body']) ?></div></section><?php endif ?>

<?php if (form_enabled('partnership')): ?>
<section class="form-band" id="partner">
  <div class="wrap form-band__grid">
    <aside class="form-band__aside">
      <h2 class="h-section">Partnership enquiry</h2>
      <p class="lead">Tell us a little about how you would like to partner, and our team will contact you personally.</p>
      <ul class="assure">
        <li><?= icon('heart') ?> All giving is stewarded with integrity and accountability</li>
        <li><?= icon('mail') ?> Partners receive updates and impact reports after the event</li>
        <li><?= icon('external') ?> No bank or payment details are requested on this form</li>
      </ul>
      <?php if (setting('contact_email')): ?><p class="lead" style="margin-top:28px">For all giving enquiries: <a href="mailto:<?= e(setting('contact_email')) ?>" style="color:var(--ember)"><?= e(setting('contact_email')) ?></a></p><?php endif ?>
    </aside>
    <div class="form-card">
      <h2 class="form-card__title">Become a partner</h2>
      <p class="form-card__sub">Fields marked <span class="req">*</span> are required.</p>
      <?= form_render('partnership', ['submit' => 'Submit enquiry', 'success' => 'Thank you for your interest in partnering with us. Our team will be in touch.']) ?>
    </div>
  </div>
</section>
<?php endif ?>
<?php require __DIR__ . '/_footer.php'; ?>
