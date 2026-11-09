<?php require __DIR__ . '/_header.php';
$heroTitle = 'Programme'; $heroEyebrow = $event['name']; $heroIntro = $event['starts_at'] ? fmt_date_range($event['starts_at'], $event['ends_at']) . ($event['venue_name'] ? ' · ' . $event['venue_name'] : '') : '';
require __DIR__ . '/_page_hero.php'; ?>
<section class="section"><div class="wrap wrap--mid">
  <?php if ($event['programme_media_id'] && ($doc = media_get((int)$event['programme_media_id']))): ?>
    <p><a class="btn btn--outline" href="<?= e(media_url($doc)) ?>" download><?= icon('download', 18) ?> Download the programme (PDF)</a></p>
  <?php endif ?>
  <?php if (setting('programme_note')): ?><p class="lead" style="margin-bottom:32px"><?= e(setting('programme_note')) ?></p><?php endif ?>
  <div class="tabs" data-tabs>
    <div class="tabs__list" role="tablist" aria-label="Programme days">
      <?php foreach ($days as $i => $d): ?>
        <button type="button" role="tab" id="tab-<?= (int)$d['id'] ?>" aria-controls="panel-<?= (int)$d['id'] ?>" aria-selected="<?= $i === 0 ? 'true' : 'false' ?>" tabindex="<?= $i === 0 ? '0' : '-1' ?>">
          <span><?= e($d['label']) ?></span><?php if ($d['day_date']): ?><small><?= e(fmt_date($d['day_date'], 'D j M')) ?></small><?php endif ?>
        </button>
      <?php endforeach ?>
    </div>
    <?php foreach ($days as $i => $d): ?>
      <div class="tabs__panel" role="tabpanel" id="panel-<?= (int)$d['id'] ?>" aria-labelledby="tab-<?= (int)$d['id'] ?>"<?= $i === 0 ? '' : ' hidden' ?>>
        <h2 class="sr-only"><?= e($d['label']) ?></h2>
        <?php if (!$d['sessions']): ?><p class="muted">Sessions for this day will be announced soon.</p><?php endif ?>
        <ol class="timeline">
          <?php foreach ($d['sessions'] as $x): ?>
            <li class="timeline__item">
              <div class="timeline__time"><?php if ($x['starts_at']): ?><?= e(fmt_date($x['starts_at'], 'g:i A')) ?><?php if ($x['ends_at']): ?><small>to <?= e(fmt_date($x['ends_at'], 'g:i A')) ?></small><?php endif ?><?php endif ?></div>
              <div class="timeline__body">
                <h3><?= e($x['title']) ?></h3>
                <?php if ($x['speaker_name']): ?><p class="timeline__speaker"><a href="/speakers/<?= e($x['speaker_slug']) ?>"><?= e($x['speaker_name']) ?></a></p><?php endif ?>
                <?php if ($x['description']): ?><p><?= e($x['description']) ?></p><?php endif ?>
                <?php if ($x['location']): ?><p class="muted"><?= icon('pin', 14) ?> <?= e($x['location']) ?></p><?php endif ?>
              </div>
            </li>
          <?php endforeach ?>
        </ol>
      </div>
    <?php endforeach ?>
  </div>
</div></section>
<?php require __DIR__ . '/_footer.php'; ?>
