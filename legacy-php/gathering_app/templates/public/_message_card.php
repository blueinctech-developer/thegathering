<?php $thumb = $msg['thumb_media_id'] ? media_url((int)$msg['thumb_media_id'], 960) : youtube_thumb($msg['url']); ?>
<a class="media-card" href="<?= e($msg['url']) ?>" target="_blank" rel="noopener noreferrer">
  <span class="media-card__thumb">
    <?php if ($thumb): ?><img src="<?= e($thumb) ?>" alt="" loading="lazy" width="480" height="270"><?php endif ?>
    <span class="media-card__play"><?= icon($msg['kind'] === 'audio' ? 'play' : 'play', 22) ?></span>
  </span>
  <span class="media-card__body">
    <span class="media-card__title"><?= e($msg['title']) ?></span>
    <span class="media-card__meta"><?= e(trim($msg['speaker_name'] . ($msg['speaker_name'] && $msg['recorded_on'] ? ' · ' : '') . fmt_date($msg['recorded_on']))) ?></span>
  </span>
  <span class="sr-only">(opens <?= $msg['kind'] === 'audio' ? 'audio' : 'video' ?> in a new tab)</span>
</a>
