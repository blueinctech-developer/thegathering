<div class="page-head">
  <div><h1>Email log</h1><p class="muted">Every email the website has tried to send. Failed emails are retried automatically by the scheduled task, or you can retry them here.</p></div>
  <form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="retry_all"><button class="btn btn--primary">Retry all unsent</button></form>
</div>
<nav class="chips" aria-label="Status">
  <?php foreach (['' => 'All', 'failed' => 'Failed', 'queued' => 'Waiting', 'sent' => 'Sent'] as $k => $l): ?><a href="/admin/emails<?= $k ? '?status=' . $k : '' ?>"<?= get('status') === $k ? ' aria-current="page"' : '' ?>><?= $l ?></a><?php endforeach ?>
</nav>
<section class="panel panel--flush">
  <?php if ($rows): ?>
  <div class="table-wrap"><table class="table"><thead><tr><th>When</th><th>Type</th><th>To</th><th>Subject</th><th>Status</th><th>Detail</th><th></th></tr></thead><tbody>
  <?php foreach ($rows as $m): ?>
    <tr><td><?= e(fmt_date($m['created_at'], 'j M, g:i A')) ?></td><td><?= e($m['purpose']) ?></td><td><?= e($m['to_email']) ?></td>
    <td><?= $m['submission_id'] ? '<a href="/admin/submissions/' . (int)$m['submission_id'] . '">' . e($m['subject']) . '</a>' : e($m['subject']) ?></td>
    <td><span class="pill pill--<?= $m['status'] === 'sent' ? 'ok' : ($m['status'] === 'failed' ? 'bad' : '') ?>"><?= e($m['status']) ?></span></td>
    <td class="t-wrap"><?= $m['status'] === 'sent' ? 'Sent ' . e(fmt_date($m['sent_at'], 'j M, g:i A')) : e(($m['last_error'] ?? '') . ($m['attempts'] ? " ({$m['attempts']} attempts)" : '')) ?></td>
    <td><?php if ($m['status'] !== 'sent' && $m['to_email'] !== '(not set)'): ?><form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="retry"><input type="hidden" name="id" value="<?= (int)$m['id'] ?>"><button class="btn btn--ghost btn--sm">Retry</button></form><?php endif ?></td></tr>
  <?php endforeach ?>
  </tbody></table></div>
  <?php else: ?><div class="empty"><p>No emails yet.</p></div><?php endif ?>
</section>
