<?php require __DIR__ . '/_header.php'; $ev = $event;
$heroTitle = 'Register'; $heroIntro = 'Secure your place at ' . $ev['name'] . '. Registration is free and takes less than a minute.';
require __DIR__ . '/_page_hero.php';
$successOpts = ['success_title' => "You're registered!", 'success' => 'Your place at ' . $ev['name'] . ' is confirmed.']; ?>
<section class="form-band">
  <div class="wrap form-band__grid">
    <aside class="form-band__aside">
      <h2 class="h-display"><?= e($ev['name']) ?></h2>
      <?php if ($ev['theme']): ?><p class="register__theme"><?= e($ev['theme']) ?><?= $ev['theme_scripture'] ? '; ' . e($ev['theme_scripture']) : '' ?></p><?php endif ?>
      <ul class="facts">
        <?php if ($ev['starts_at']): ?><li><?= icon('calendar') ?><span><?= e(fmt_date_range($ev['starts_at'], $ev['ends_at'])) ?><?php if (fmt_date($ev['starts_at'], 'H:i') !== '00:00'): ?><small>Starts <?= e(fmt_date($ev['starts_at'], 'g:i A')) ?></small><?php endif ?></span></li><?php endif ?>
        <?php if ($ev['venue_name']): ?><li><?= icon('pin') ?><span><?= e($ev['venue_name']) ?><?php if ($ev['venue_address']): ?><small><?= e($ev['venue_address']) ?></small><?php endif ?></span></li><?php endif ?>
        <?php if (blocks('bus_stops')): ?><li><?= icon('arrow') ?><span>Free buses to and fro<small><?= e(setting('bus_time')) ?> from <?= count(blocks('bus_stops')) ?> pick-up points. <a href="/venue#bus" style="color:var(--ember)">See locations</a></small></span></li><?php endif ?>
      </ul>
      <ul class="assure">
        <li><?= icon('mail') ?> A confirmation email with your reference number</li>
        <li><?= icon('heart') ?> Free to attend; no payment details needed</li>
        <?php if (setting('contact_phone')): ?><li><?= icon('phone') ?> <span>Questions? Call <a href="<?= e(tel_href(setting('contact_phone'))) ?>" style="color:#fff"><?= e(setting('contact_phone')) ?></a></span></li><?php endif ?>
      </ul>
    </aside>
    <div class="form-card">
      <?php $st = $GLOBALS['__form_state']['registration'] ??= (flash('form_registration') ?? []);
      if ($state === 'open' || !empty($st['success'])): ?>
        <?php if (empty($st['success'])): ?>
          <h2 class="form-card__title">Your details</h2>
          <p class="form-card__sub">Fields marked <span class="req">*</span> are required.</p>
        <?php endif ?>
        <?= form_render('registration', ['submit' => 'Complete registration'] + $successOpts) ?>
      <?php else: ?>
        <h2 class="form-card__title"><?= $state === 'full' ? 'Registration is full' : 'Registration is closed' ?></h2>
        <p class="form-card__sub"><?= $state === 'full' ? 'Thank you for your interest. All places have been taken.' : 'Registration is not open at the moment. Please check back soon.' ?></p>
        <?php if (form_enabled('contact')): ?><a class="btn btn--primary" href="/contact">Contact us</a><?php endif ?>
      <?php endif ?>
    </div>
  </div>
</section>
<?php if ($ev['flyer_media_id']): ?>
<section class="section section--tight"><div class="wrap wrap--mid"><div class="lineup__flyer"><?= picture((int)$ev['flyer_media_id'], (string)(media_get((int)$ev['flyer_media_id'])['alt'] ?? $ev['name']), '(min-width: 1000px) 960px, 100vw') ?></div></div></section>
<?php endif ?>
<?php require __DIR__ . '/_footer.php'; ?>
