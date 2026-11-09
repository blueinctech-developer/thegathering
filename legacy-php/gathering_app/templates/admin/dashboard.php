<?php $state = registration_state($event); $missing = array_filter($checklist, fn($c) => !$c[1]); ?>
<div class="grid grid--cards">
  <section class="panel panel--hero">
        <?php if ($event): ?>
      <h2><?= e($event['name']) ?></h2>
      <p class="muted"><?= e($event['starts_at'] ? fmt_date_range($event['starts_at'], $event['ends_at']) : 'Date not set') ?><?= $event['venue_name'] ? ' · ' . e($event['venue_name']) : '' ?></p>
      <div class="stat-row">
        <div class="stat"><span><?= $regCount ?></span><small>people registered<?= $regRows !== $regCount ? " ($regRows sign-ups)" : '' ?></small></div>
        <?php if ($event['capacity']): ?><div class="stat"><span><?= max(0, (int)$event['capacity'] - $regCount) ?></span><small>places left of <?= (int)$event['capacity'] ?></small></div><?php endif ?>
        <div class="stat"><span class="pill pill--<?= $state === 'open' ? 'ok' : ($state === 'full' ? 'warn' : '') ?>"><?= e(ucfirst($state)) ?></span><small>registration</small></div>
      </div>
      <p class="actions"><a class="btn btn--primary btn--sm" href="/admin/events/<?= (int)$event['id'] ?>">Edit event</a> <a class="btn btn--ghost btn--sm" href="/admin/submissions?type=registration">View registrations</a></p>
    <?php else: ?>
      <h2>No current event</h2>
      <p>Create the next Gathering to switch on the countdown, registration and schedule.</p>
      <p><a class="btn btn--primary btn--sm" href="/admin/events/new">Create event</a></p>
    <?php endif ?>
  </section>

  <section class="panel">
    <h2>Needs attention</h2>
    <ul class="todo">
      <?php $any = false; foreach (form_defs() as $k => $f): $n = (int)($counts[$k]['new_count'] ?? 0); if (!$n) continue; $any = true; ?>
        <li><a href="/admin/submissions?type=<?= e($k) ?>&status=new"><strong><?= $n ?></strong> new <?= e(mb_strtolower($f['label'])) ?> submission<?= $n === 1 ? '' : 's' ?></a></li>
      <?php endforeach ?>
      <?php if ($pendingTestimonies): $any = true; ?><li><a href="/admin/testimonies?status=pending"><strong><?= $pendingTestimonies ?></strong> testimon<?= $pendingTestimonies === 1 ? 'y' : 'ies' ?> waiting for review</a></li><?php endif ?>
      <?php if ($failedEmails): $any = true; ?><li class="todo--bad"><a href="/admin/emails?status=failed"><strong><?= $failedEmails ?></strong> email<?= $failedEmails === 1 ? '' : 's' ?> failed to send</a></li><?php endif ?>
      <?php if (!$any): ?><li class="muted">Nothing waiting. All caught up.</li><?php endif ?>
    </ul>
  </section>
</div>

<?php if ($missing && is_admin()): ?>
<section class="panel">
  <h2>Finish setting up the website</h2>
  <ul class="checklist">
    <?php foreach ($checklist as [$label, $done, $href]): ?>
      <li class="<?= $done ? 'is-done' : '' ?>"><span aria-hidden="true"><?= $done ? '✓' : '○' ?></span> <?php if ($done): ?><?= e($label) ?> <span class="sr-only">(done)</span><?php else: ?><a href="<?= e($href) ?>"><?= e($label) ?></a><?php endif ?></li>
    <?php endforeach ?>
  </ul>
</section>
<?php endif ?>

<section class="panel">
  <div class="panel__head"><h2>Latest submissions</h2><a href="/admin/submissions">See all</a></div>
  <?php if ($recent): ?>
  <div class="table-wrap"><table class="table">
    <thead><tr><th>Reference</th><th>Form</th><th>Name</th><th>Status</th><th>Email</th><th>Received</th></tr></thead>
    <tbody>
    <?php foreach ($recent as $r): ?>
      <tr><td><a href="/admin/submissions/<?= (int)$r['id'] ?>"><?= e($r['reference']) ?></a></td><td><?= e(form_defs()[$r['form_type']]['label'] ?? $r['form_type']) ?></td><td><?= e($r['name'] ?: '-') ?></td>
      <td><span class="pill pill--<?= $r['status'] === 'new' ? 'warn' : ($r['status'] === 'handled' ? 'ok' : '') ?>"><?= e(str_replace('_', ' ', $r['status'])) ?></span></td>
      <td><span class="pill pill--<?= $r['email_status'] === 'sent' ? 'ok' : ($r['email_status'] === 'failed' ? 'bad' : '') ?>"><?= e($r['email_status']) ?></span></td>
      <td><?= e(fmt_date($r['created_at'], 'j M, g:i A')) ?></td></tr>
    <?php endforeach ?>
    </tbody>
  </table></div>
  <?php else: ?><p class="muted">No submissions yet.</p><?php endif ?>
</section>
