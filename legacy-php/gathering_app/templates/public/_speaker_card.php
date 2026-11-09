<?php
$hasProfile = $s['photo_media_id'] || trim(strip_tags((string)$s['bio'])) !== '';
$tag = $hasProfile ? 'a' : 'div';
$role = trim($s['role_title'] . ($s['role_title'] && $s['ministry'] ? ' · ' : '') . $s['ministry']);
?>
<<?= $tag ?> class="speaker-card<?= $s['photo_media_id'] ? '' : ' speaker-card--text' ?>"<?= $hasProfile ? ' href="/speakers/' . e($s['slug']) . '"' : '' ?>>
  <?php if ($s['photo_media_id']): ?>
    <span class="speaker-card__photo"><?= picture((int)$s['photo_media_id'], $s['name'] . ($role ? ', ' . $role : ''), '(min-width: 1000px) 280px, 50vw') ?></span>
  <?php endif ?>
  <span class="speaker-card__name"><?= e($s['name']) ?></span>
  <?php if ($role): ?><span class="speaker-card__role"><?= e($role) ?></span><?php endif ?>
</<?= $tag ?>>
