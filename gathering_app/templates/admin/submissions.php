<?php
$defs = form_defs();
$type = get('type');
$qs = $_GET; unset($qs['page']);
$exportQs = http_build_query($qs);
$pages = (int)ceil($total / $per);
?>
<div class="page-head">
  <div><h1>Submissions</h1><p class="muted">Everything sent through the website's forms. Prayer requests and personal details are confidential. Do not share them outside the team.</p></div>
  <a class="btn btn--ghost" href="/admin/submissions/export?<?= e($exportQs) ?>">Export to Excel (CSV)</a>
</div>
<nav class="chips" aria-label="Form type">
  <a href="/admin/submissions"<?= $type === '' ? ' aria-current="page"' : '' ?>>All</a>
  <?php foreach ($defs as $k => $f): ?>
    <a href="/admin/submissions?type=<?= e($k) ?>"<?= $type === $k ? ' aria-current="page"' : '' ?>><?= e($f['label']) ?><?php if (!empty($typeCounts[$k])): ?> <span class="badge"><?= (int)$typeCounts[$k] ?></span><?php endif ?></a>
  <?php endforeach ?>
</nav>
<form class="filters" method="get">
  <?php if ($type): ?><input type="hidden" name="type" value="<?= e($type) ?>"><?php endif ?>
  <input type="search" name="q" value="<?= e(get('q')) ?>" placeholder="Name, email, phone or reference" aria-label="Search">
  <select name="status" aria-label="Status">
    <option value="">All (not spam)</option>
    <?php foreach (['new' => 'New', 'in_progress' => 'In progress', 'handled' => 'Handled', 'spam' => 'Spam'] as $k => $l): ?><option value="<?= $k ?>"<?= get('status') === $k ? ' selected' : '' ?>><?= $l ?></option><?php endforeach ?>
  </select>
  <label class="check-inline"><input type="checkbox" name="email" value="failed"<?= get('email') === 'failed' ? ' checked' : '' ?>> Email failed</label>
  <label>From <input type="date" name="from" value="<?= e(get('from')) ?>"></label>
  <label>To <input type="date" name="to" value="<?= e(get('to')) ?>"></label>
  <button class="btn btn--ghost btn--sm" type="submit">Filter</button>
</form>
<section class="panel panel--flush">
  <p class="table-count"><?= $total ?> result<?= $total === 1 ? '' : 's' ?></p>
  <?php if ($rows): ?>
  <div class="table-wrap"><table class="table">
    <thead><tr><th>Reference</th><th>Form</th><th>Name</th><th>Email / phone</th><th>Status</th><th>Emails</th><th>Received</th></tr></thead>
    <tbody>
    <?php foreach ($rows as $r): ?>
      <tr class="<?= $r['status'] === 'new' ? 'is-new' : '' ?>">
        <td><a class="row-link" href="/admin/submissions/<?= (int)$r['id'] ?>"><?= e($r['reference']) ?></a></td>
        <td><?= e($defs[$r['form_type']]['label'] ?? $r['form_type']) ?></td>
        <td><?= e($r['name'] ?: '-') ?></td>
        <td><?= e($r['email'] ?: '') ?><?= $r['phone'] ? '<br><small>' . e($r['phone']) . '</small>' : '' ?></td>
        <td><span class="pill pill--<?= $r['status'] === 'new' ? 'warn' : ($r['status'] === 'handled' ? 'ok' : ($r['status'] === 'spam' ? 'bad' : '')) ?>"><?= e(str_replace('_', ' ', $r['status'])) ?></span></td>
        <td><span class="pill pill--<?= $r['email_status'] === 'sent' ? 'ok' : ($r['email_status'] === 'failed' ? 'bad' : '') ?>"><?= e($r['email_status']) ?></span></td>
        <td><?= e(fmt_date($r['created_at'], 'j M Y, g:i A')) ?></td>
      </tr>
    <?php endforeach ?>
    </tbody>
  </table></div>
  <?php if ($pages > 1): ?>
    <nav class="pager" aria-label="Pages">
      <?php for ($i = 1; $i <= $pages; $i++): $qs['page'] = $i; ?><a href="?<?= e(http_build_query($qs)) ?>"<?= $i === $page ? ' aria-current="page"' : '' ?>><?= $i ?></a><?php endfor ?>
    </nav>
  <?php endif ?>
  <?php else: ?><div class="empty"><p>No submissions match.</p></div><?php endif ?>
</section>
