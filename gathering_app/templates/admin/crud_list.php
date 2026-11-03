<?php $key = $d['key']; $newQs = http_build_query(array_filter(array_intersect_key($_GET, $d['filter'] ?? []), 'is_string')); $newUrl = "/admin/$key/new" . ($newQs ? "?$newQs" : ''); ?>
<div class="page-head">
  <div><h1><?= e($d['title']) ?></h1><?php if (!empty($d['help'])): ?><p class="muted"><?= e($d['help']) ?></p><?php endif ?></div>
  <a class="btn btn--primary" href="<?= e($newUrl) ?>">+ Add <?= e($d['singular']) ?></a>
</div>
<?php if (!empty($d['search']) || !empty($d['filter'])): ?>
<form class="filters" method="get">
  <?php if (!empty($d['search'])): ?><input type="search" name="q" value="<?= e(get('q')) ?>" placeholder="Search…" aria-label="Search"><?php endif ?>
  <?php foreach ($d['filter'] ?? [] as $col => $opts): ?>
    <select name="<?= e($col) ?>" aria-label="Filter by <?= e($col) ?>"><option value="">All</option><?php foreach ($opts as $k => $l): ?><option value="<?= e($k) ?>"<?= get($col) === $k ? ' selected' : '' ?>><?= e($l) ?></option><?php endforeach ?></select>
  <?php endforeach ?>
  <button class="btn btn--ghost btn--sm" type="submit">Filter</button>
</form>
<?php endif ?>
<section class="panel panel--flush">
<?php if (!$rows): ?>
  <div class="empty"><p>Nothing here yet.</p><a class="btn btn--primary btn--sm" href="<?= e($newUrl) ?>">Add the first <?= e($d['singular']) ?></a></div>
<?php else: ?>
  <div class="table-wrap"><table class="table">
    <thead><tr>
      <?php foreach ($d['list'] as $col => $label): ?><th><?= e($label) ?></th><?php endforeach ?>
      <th class="t-right"><span class="sr-only">Actions</span></th>
    </tr></thead>
    <tbody>
    <?php foreach ($rows as $i => $row): $first = true; ?>
      <tr>
        <?php foreach ($d['list'] as $col => $label): ?>
          <td><?php if ($first && !str_ends_with($col, '_media_id')): $first = false; ?><a class="row-link" href="/admin/<?= e($key) ?>/<?= (int)$row['id'] ?>"><?= crud_cell($col, $row[$col] ?? null, $row) ?></a><?php else: ?><?= crud_cell($col, $row[$col] ?? null, $row) ?><?php endif ?></td>
        <?php endforeach ?>
        <td class="t-right t-actions">
          <?php if ($key === 'testimonies' && $row['status'] === 'pending'): ?>
            <form method="post" action="/admin/testimonies/<?= (int)$row['id'] ?>/status"><?= csrf_field() ?><input type="hidden" name="status" value="approved"><button class="btn btn--sm btn--ok">Approve</button></form>
            <form method="post" action="/admin/testimonies/<?= (int)$row['id'] ?>/status"><?= csrf_field() ?><input type="hidden" name="status" value="rejected"><button class="btn btn--sm btn--ghost">Reject</button></form>
          <?php endif ?>
          <?php if (!empty($d['sortable'])): ?>
            <form method="post" action="/admin/<?= e($key) ?>/<?= (int)$row['id'] ?>/up"><?= csrf_field() ?><button class="icon-btn" title="Move up" aria-label="Move up"<?= $i === 0 ? ' disabled' : '' ?>>↑</button></form>
            <form method="post" action="/admin/<?= e($key) ?>/<?= (int)$row['id'] ?>/down"><?= csrf_field() ?><button class="icon-btn" title="Move down" aria-label="Move down"<?= $i === count($rows) - 1 ? ' disabled' : '' ?>>↓</button></form>
          <?php endif ?>
          <a class="btn btn--sm btn--ghost" href="/admin/<?= e($key) ?>/<?= (int)$row['id'] ?>">Edit</a>
        </td>
      </tr>
    <?php endforeach ?>
    </tbody>
  </table></div>
<?php endif ?>
</section>
