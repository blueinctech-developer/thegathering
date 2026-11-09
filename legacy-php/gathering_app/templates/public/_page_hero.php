<?php
/* expects $heroTitle, optional $heroIntro, $heroMedia, $heroCtas (html). Every page header gets a photo. */
$heroPhoto = !empty($heroMedia) ? (int)$heroMedia : fallback_photo(request_path());
?>
<header class="page-hero<?= $heroPhoto ? ' page-hero--image' : '' ?>">
  <?php if ($heroPhoto): ?><div class="page-hero__media"><?= picture($heroPhoto, '', '100vw', '', true) ?></div><?php endif ?>
  <div class="wrap page-hero__inner">
    <h1 class="page-hero__title"><?= e($heroTitle) ?></h1>
    <?php if (!empty($heroIntro)): ?><p class="page-hero__intro"><?= e($heroIntro) ?></p><?php endif ?>
    <?php if (!empty($heroCtas)): ?><div class="btn-row"><?= $heroCtas ?></div><?php endif ?>
  </div>
</header>
