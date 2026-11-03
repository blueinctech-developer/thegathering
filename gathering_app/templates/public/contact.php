<?php require __DIR__ . '/_header.php';
$heroTitle = 'Contact us'; $heroIntro = setting('contact_intro');
require __DIR__ . '/_page_hero.php'; ?>
<section class="form-band">
  <div class="wrap form-band__grid">
    <aside class="form-band__aside">
      <h2 class="h-section">We'd love to hear from you</h2>
      <p class="lead">Reach out for partnerships, enquiries, prayer, or to learn more about <?= e(current_event()['name'] ?? setting('site_name', 'The Gathering')) ?>.</p>
      <div class="contact-lines">
        <?php if (setting('contact_phone')): ?><a class="contact-line" href="<?= e(tel_href(setting('contact_phone'))) ?>"><?= icon('phone') ?><span><small>Event &amp; transport helpline</small><?= e(setting('contact_phone')) ?></span></a><?php endif ?>
        <?php if (setting('whatsapp_number')): ?><a class="contact-line" href="<?= e(wa_href(setting('whatsapp_number'))) ?>" target="_blank" rel="noopener noreferrer"><?= icon('whatsapp') ?><span><small>WhatsApp</small>Chat with us</span></a><?php endif ?>
        <?php if (setting('contact_email')): ?><a class="contact-line" href="mailto:<?= e(setting('contact_email')) ?>"><?= icon('mail') ?><span><small>Email</small><?= e(setting('contact_email')) ?></span></a><?php endif ?>
        <?php if (setting('social_youtube')): ?><a class="contact-line" href="<?= e(setting('social_youtube')) ?>" target="_blank" rel="noopener noreferrer"><?= icon('youtube') ?><span><small>YouTube</small><?= e('@' . ltrim((string)parse_url(setting('social_youtube'), PHP_URL_PATH), '/@')) ?></span></a><?php endif ?>
        <?php if (valid_http_url(setting('parent_org_url'))): ?><a class="contact-line" href="<?= e(setting('parent_org_url')) ?>" target="_blank" rel="noopener noreferrer"><?= icon('external') ?><span><small>Website</small><?= e(preg_replace('~^https?://~', '', rtrim(setting('parent_org_url'), '/'))) ?></span></a><?php endif ?>
        <?php if (setting('postal_address')): ?><div class="contact-line"><?= icon('pin') ?><span><small>Address</small><?= nl2br(e(setting('postal_address'))) ?></span></div><?php endif ?>
      </div>
    </aside>
    <div class="form-card">
      <h2 class="form-card__title">Send a message</h2>
      <p class="form-card__sub">Fill out the form and a member of our ministry team will reach out to you within 24 hours. Fields marked <span class="req">*</span> are required.</p>
      <?= form_render('contact', ['submit' => 'Send message', 'success' => 'Thank you for getting in touch. We will reply as soon as we can.']) ?>
    </div>
  </div>
</section>
<?php require __DIR__ . '/_footer.php'; ?>
