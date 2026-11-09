<?php
try { db(); $dbOk = true; } catch (Throwable) { $dbOk = false; }
if (!$dbOk) { echo '<!doctype html><title>Page not found</title><h1>Page not found</h1><p><a href="/">Go to the homepage</a></p>'; return; }
require __DIR__ . '/_header.php'; ?>
<section class="section notfound"><div class="wrap wrap--narrow">
  <p class="notfound__code" aria-hidden="true">404</p>
  <h1 class="h-display">We couldn't find that page.</h1>
  <p class="lead">The link may be old or the page may have moved. These might help:</p>
  <div class="btn-row">
    <a class="btn btn--primary" href="/">Go to the homepage</a>
    <?php if (feature('register') && registration_state(current_event()) === 'open'): ?><a class="btn btn--accent" href="/register">Register</a><?php endif ?>
    <?php if (form_enabled('contact')): ?><a class="btn btn--outline" href="/contact">Contact us</a><?php endif ?>
  </div>
</div></section>
<?php require __DIR__ . '/_footer.php'; ?>
