<div class="page-head"><div><h1>Activity log</h1><p class="muted">The last 300 important actions in the admin.</p></div></div>
<section class="panel panel--flush"><div class="table-wrap"><table class="table">
  <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Item</th><th>Detail</th></tr></thead>
  <tbody><?php foreach ($rows as $r): ?>
    <tr><td><?= e(fmt_date($r['created_at'], 'j M Y, g:i A')) ?></td><td><?= e($r['user_name'] ?? '-') ?></td><td><?= e(str_replace('_', ' ', $r['action'])) ?></td>
    <td><?= e(trim(($r['entity'] ?? '') . ' ' . ($r['entity_id'] ? '#' . $r['entity_id'] : ''))) ?></td><td><?= e($r['details'] ?? '') ?></td></tr>
  <?php endforeach ?></tbody>
</table></div></section>
