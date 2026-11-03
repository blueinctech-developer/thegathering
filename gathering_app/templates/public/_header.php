<?php
/** @var array $meta */
$m = meta_defaults($meta ?? []);
$site = setting('site_name', 'The Gathering');
$logo = setting('logo_media_id') ? media_get((int)setting('logo_media_id')) : null;
$fav = setting('favicon_media_id') ? media_url((int)setting('favicon_media_id'), 480) : '';
$ev = current_event();
$regOpen = feature('register') && registration_state($ev) === 'open';
$current = request_path();
$heroHeader = !empty($transparentHeader);
$primary = preg_match('/^#[0-9a-f]{6}$/i', setting('brand_primary')) ? setting('brand_primary') : '#0b0b0c';
$accent = preg_match('/^#[0-9a-f]{6}$/i', setting('brand_accent')) ? setting('brand_accent') : '#ffcc00';
$gtm = preg_match('/^GTM-[A-Z0-9]+$/', setting('gtm_container_id')) ? setting('gtm_container_id') : '';
$ga = preg_match('/^G-[A-Z0-9]+$/', setting('ga_measurement_id')) ? setting('ga_measurement_id') : '';
$pixel = ctype_digit(setting('meta_pixel_id')) ? setting('meta_pixel_id') : '';
$track = is_production();
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title><?= e($m['full_title']) ?></title>
<?php if ($m['description']): ?><meta name="description" content="<?= e($m['description']) ?>"><?php endif ?>
<link rel="canonical" href="<?= e($m['canonical']) ?>">
<?php if ($m['noindex']): ?><meta name="robots" content="noindex, nofollow"><?php endif ?>
<meta property="og:site_name" content="<?= e($site) ?>">
<meta property="og:type" content="<?= e($m['type']) ?>">
<meta property="og:title" content="<?= e($m['full_title']) ?>">
<?php if ($m['description']): ?><meta property="og:description" content="<?= e($m['description']) ?>"><?php endif ?>
<meta property="og:url" content="<?= e($m['canonical']) ?>">
<?php if ($m['image']): ?><meta property="og:image" content="<?= e($m['image']) ?>"><meta name="twitter:image" content="<?= e($m['image']) ?>"><?php endif ?>
<meta name="twitter:card" content="<?= $m['image'] ? 'summary_large_image' : 'summary' ?>">
<meta name="twitter:title" content="<?= e($m['full_title']) ?>">
<?php if ($m['description']): ?><meta name="twitter:description" content="<?= e($m['description']) ?>"><?php endif ?>
<?php if (setting('google_site_verification')): ?><meta name="google-site-verification" content="<?= e(setting('google_site_verification')) ?>"><?php endif ?>
<meta name="theme-color" content="<?= e($primary) ?>">
<?php if ($fav): ?><link rel="icon" href="<?= e($fav) ?>"><link rel="apple-touch-icon" href="<?= e($fav) ?>"><?php endif ?>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap">
<link rel="stylesheet" href="<?= asset('assets/css/site.css') ?>">
<style>:root{--ink:<?= e($primary) ?>;--ember:<?= e($accent) ?>}</style>
<?php foreach ($m['jsonld'] as $ld): ?>
<script type="application/ld+json"><?= json_encode($ld, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) ?></script>
<?php endforeach ?>
<?php if ($track && $gtm): ?><script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','<?= $gtm ?>');</script><?php endif ?>
<?php if ($track && $ga): ?><script async src="https://www.googletagmanager.com/gtag/js?id=<?= $ga ?>"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','<?= $ga ?>');</script><?php endif ?>
<?php if ($track && $pixel): ?><script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','<?= $pixel ?>');fbq('track','PageView');</script><?php endif ?>
<script src="<?= asset('assets/js/site.js') ?>" defer></script>
</head>
<body class="<?= $heroHeader ? 'has-hero' : '' ?>">
<?php if ($track && $gtm): ?><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=<?= $gtm ?>" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript><?php endif ?>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header<?= $heroHeader ? ' site-header--over' : '' ?>" data-header>
  <div class="wrap site-header__inner">
    <a class="brand" href="/" aria-label="<?= e($site) ?>, home">
      <?php if ($logo): ?>
        <img class="brand__logo" src="<?= e(media_url($logo, 480)) ?>" alt="<?= e($site) ?>" width="<?= (int)$logo['width'] ?>" height="<?= (int)$logo['height'] ?>">
      <?php else: ?>
        <span class="brand__word"><?= e($site) ?></span>
      <?php endif ?>
    </a>
    <nav class="nav" id="site-nav" aria-label="Main">
      <ul class="nav__list">
        <?php foreach (main_menu() as [$href, $label]): ?>
          <li><a href="<?= e($href) ?>"<?= ($current === $href || str_starts_with($current, $href . '/')) ? ' aria-current="page"' : '' ?>><?= e($label) ?></a></li>
        <?php endforeach ?>
      </ul>
      <?php if (feature('give')): ?><div class="nav__mobile-ctas"><a class="btn btn--ember btn--lg" href="/give">Give</a></div><?php endif ?>
    </nav>
    <div class="site-header__actions">
      <?php if (feature('give')): ?><a class="btn btn--ember btn--sm site-header__give" href="/give"<?= $current === '/give' ? ' aria-current="page"' : '' ?>>Give</a><?php endif ?>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" data-menu-btn>
        <span class="sr-only">Menu</span><span class="menu-btn__bars" aria-hidden="true"></span>
      </button>
    </div>
  </div>
</header>
<main id="main" tabindex="-1">
