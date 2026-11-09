<?php
$site = setting('site_name', 'The Gathering');
$socials = social_links();
$ev = current_event();
$regOpen = feature('register') && registration_state($ev) === 'open';
$logo = setting('logo_media_id') ? media_get((int)setting('logo_media_id')) : null;
$parentLogo = setting('parent_logo_media_id') ? media_get((int)setting('parent_logo_media_id')) : null;
?>
</main>
<?php if (form_enabled('newsletter') || valid_http_url(setting('whatsapp_community_url'))): ?>
<section class="signup" aria-labelledby="signup-h">
  <div class="wrap signup__inner">
    <div>
      <h2 id="signup-h" class="signup__title">Hear first about The Gathering.</h2>
    </div>
    <div class="signup__actions">
      <?php if (form_enabled('newsletter')): ?>
        <?= form_render('newsletter', ['submit' => 'Subscribe', 'success_title' => 'You are subscribed', 'success' => 'Thank you for joining our mailing list.']) ?>
      <?php endif ?>
      <?php if (valid_http_url(setting('whatsapp_community_url'))): ?>
        <a class="btn btn--whatsapp" href="<?= e(setting('whatsapp_community_url')) ?>" target="_blank" rel="noopener noreferrer"><?= icon('whatsapp') ?> Join our WhatsApp community</a>
      <?php endif ?>
    </div>
  </div>
</section>
<?php endif ?>
<footer class="site-footer">
  <?php if ($ev && request_path() !== '/register'): ?>
  <div class="wrap footer-cta">
    <p class="footer-cta__line">We would love to see you at <span><?= e($ev['name']) ?></span>.</p>
    <div class="btn-row">
      <?php if ($regOpen): ?><a class="btn btn--ember btn--lg" href="/register">Register now <?= icon('arrow', 18) ?></a><?php endif ?>
      <?php if (feature('give')): ?><a class="btn btn--ghost btn--lg" href="/give">Partner with us</a><?php endif ?>
    </div>
  </div>
  <?php endif ?>
  <div class="wrap site-footer__grid">
    <div class="site-footer__brand">
      <?php if ($logo): ?><img class="site-footer__logo" src="<?= e(media_url($logo, 480)) ?>" alt="<?= e($site) ?>" width="<?= (int)$logo['width'] ?>" height="<?= (int)$logo['height'] ?>" loading="lazy"><?php else: ?><p class="site-footer__name"><?= e($site) ?></p><?php endif ?>
      <?php if (setting('footer_text')): ?><p class="site-footer__text"><?= nl2br(e(setting('footer_text'))) ?></p><?php endif ?>
      <?php if ($socials): ?>
        <ul class="socials" aria-label="Social media">
          <?php foreach ($socials as $s): ?>
            <li><a href="<?= e($s['url']) ?>" target="_blank" rel="noopener noreferrer" aria-label="<?= e($site . ' on ' . $s['label']) ?>"><?= icon($s['icon'], 18) ?></a></li>
          <?php endforeach ?>
        </ul>
      <?php endif ?>
    </div>
    <?php $links = array_merge(nav_items(), more_items()); if ($links): ?>
    <nav aria-label="Footer">
      <p class="site-footer__h">Explore</p>
      <ul class="site-footer__links">
        <?php if ($regOpen): ?><li><a href="/register">Register</a></li><?php endif ?>
        <?php foreach ($links as [$href, $label]): ?><li><a href="<?= e($href) ?>"><?= e($label) ?></a></li><?php endforeach ?>
        <?php if (feature('give')): ?><li><a href="/give">Give</a></li><?php endif ?>
      </ul>
    </nav>
    <?php endif ?>
    <?php if (setting('contact_email') || setting('contact_phone') || setting('whatsapp_number') || setting('postal_address')): ?>
    <div>
      <p class="site-footer__h">Contact</p>
      <ul class="site-footer__contact">
        <?php if (setting('contact_email')): ?><li><a href="mailto:<?= e(setting('contact_email')) ?>"><?= icon('mail', 16) ?> <?= e(setting('contact_email')) ?></a></li><?php endif ?>
        <?php if (setting('contact_phone')): ?><li><a href="<?= e(tel_href(setting('contact_phone'))) ?>"><?= icon('phone', 16) ?> <?= e(setting('contact_phone')) ?></a></li><?php endif ?>
        <?php if (setting('whatsapp_number')): ?><li><a href="<?= e(wa_href(setting('whatsapp_number'))) ?>" target="_blank" rel="noopener noreferrer"><?= icon('whatsapp', 16) ?> WhatsApp us</a></li><?php endif ?>
        <?php if (setting('postal_address')): ?><li class="site-footer__addr"><?= icon('pin', 16) ?> <span><?= nl2br(e(setting('postal_address'))) ?></span></li><?php endif ?>
      </ul>
    </div>
    <?php endif ?>
  </div>
  <?php if ($parentLogo || setting('org_legal')): ?>
  <div class="wrap site-footer__org">
    <?php if ($parentLogo): ?><img src="<?= e(media_url($parentLogo, 480)) ?>" alt="<?= e(setting('parent_org_name', 'Parent ministry')) ?>" width="<?= (int)$parentLogo['width'] ?>" height="<?= (int)$parentLogo['height'] ?>" loading="lazy"><?php endif ?>
    <?php if (setting('org_legal')): ?><p><?= nl2br(e(setting('org_legal'))) ?></p><?php endif ?>
  </div>
  <?php endif ?>
  <div class="wrap site-footer__base">
    <p>&copy; <?= date('Y') ?> <?= e($site) ?>. All rights reserved.</p>
    <?php if (page_published('privacy')): ?><p><a href="/privacy">Privacy policy</a></p><?php endif ?>
  </div>
</footer>
<?php if ($regOpen && request_path() !== '/register'): ?>
<div class="mobile-cta" data-mobile-cta>
  <a class="btn btn--ember btn--block" href="/register">Register for <?= e($ev['name']) ?> <?= icon('arrow', 18) ?></a>
</div>
<?php endif ?>
</body>
</html>
