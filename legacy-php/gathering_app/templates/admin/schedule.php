<div class="page-head">
  <div><h1>Schedule</h1><p class="muted">Days and sessions for each event. The current event's schedule is shown on the website.</p></div>
  <?php if ($eventId): ?><a class="btn btn--primary" href="/admin/days/new?event_id=<?= (int)$eventId ?>">+ Add day</a><?php endif ?>
</div>
<?php if (!$events): ?>
  <div class="panel empty"><p>Create an event first.</p><a class="btn btn--primary btn--sm" href="/admin/events/new">Create event</a></div>
<?php else: ?>
  <?php if (count($events) > 1): ?>
    <form class="filters" method="get"><label for="ev">Event</label><select id="ev" name="event" onchange="this.form.submit()">
      <?php foreach ($events as $ev): ?><option value="<?= (int)$ev['id'] ?>"<?= (int)$ev['id'] === $eventId ? ' selected' : '' ?>><?= e($ev['name']) ?><?= $ev['is_current'] ? ' (current)' : '' ?></option><?php endforeach ?>
    </select><noscript><button class="btn btn--sm">Show</button></noscript></form>
  <?php endif ?>
  <?php if (!$days): ?><div class="panel empty"><p>No days yet. Add the first day, then add sessions to it.</p></div><?php endif ?>
  <?php foreach ($days as $d): ?>
    <section class="panel">
      <div class="panel__head">
        <h2><?= e($d['label']) ?><?php if ($d['day_date']): ?> <small class="muted"><?= e(fmt_date($d['day_date'], 'l j F Y')) ?></small><?php endif ?></h2>
        <div class="actions"><a class="btn btn--ghost btn--sm" href="/admin/days/<?= (int)$d['id'] ?>">Edit day</a> <a class="btn btn--primary btn--sm" href="/admin/sessions/new?day_id=<?= (int)$d['id'] ?>">+ Add session</a></div>
      </div>
      <?php if ($d['sessions']): ?>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Time</th><th>Session</th><th>Speaker</th><th>Location</th><th></th></tr></thead>
          <tbody><?php foreach ($d['sessions'] as $s): ?>
            <tr><td><?= e($s['starts_at'] ? fmt_date($s['starts_at'], 'g:i A') : '-') ?><?= $s['ends_at'] ? ' – ' . e(fmt_date($s['ends_at'], 'g:i A')) : '' ?></td>
            <td><a class="row-link" href="/admin/sessions/<?= (int)$s['id'] ?>"><?= e($s['title']) ?></a></td><td><?= e($s['speaker_name'] ?: '-') ?></td><td><?= e($s['location'] ?: '-') ?></td>
            <td class="t-right"><a class="btn btn--ghost btn--sm" href="/admin/sessions/<?= (int)$s['id'] ?>">Edit</a></td></tr>
          <?php endforeach ?></tbody>
        </table></div>
      <?php else: ?><p class="muted">No sessions yet.</p><?php endif ?>
    </section>
  <?php endforeach ?>
<?php endif ?>
