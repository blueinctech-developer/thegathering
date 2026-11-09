<?php $def = form_defs()[$s['form_type']] ?? null;
$labels = [];
foreach ($def['fields'] ?? [] as $f) { $labels[$f[0]] = $f[2] === 'consent' ? 'Consent given' : $f[1]; } ?>
<div class="page-head">
  <div>
    <p class="crumbs"><a href="/admin/submissions?type=<?= e($s['form_type']) ?>">← <?= e($def['label'] ?? 'Submissions') ?></a></p>
    <h1><?= e($s['reference']) ?></h1>
    <p class="muted">Received <?= e(fmt_date($s['created_at'], 'l j F Y, g:i A')) ?><?= $event ? ' · ' . e($event['name']) : '' ?></p>
  </div>
  <?php if ($s['email']): ?><a class="btn btn--ghost" href="mailto:<?= e($s['email']) ?>?subject=<?= rawurlencode('Re: ' . ($def['label'] ?? '') . ' ' . $s['reference']) ?>">Reply by email</a><?php endif ?>
</div>
<div class="grid grid--detail">
  <section class="panel">
    <h2>Details</h2>
    <dl class="dl">
      <?php foreach ($data as $k => $v): if ($v === '' || $v === null) continue; ?>
        <dt><?= e($labels[$k] ?? ucwords(str_replace('_', ' ', $k))) ?></dt>
        <dd><?php if ($k === 'email'): ?><a href="mailto:<?= e($v) ?>"><?= e($v) ?></a><?php elseif ($k === 'phone'): ?><a href="<?= e(tel_href((string)$v)) ?>"><?= e($v) ?></a> · <a href="<?= e(wa_href((string)$v)) ?>" target="_blank" rel="noopener noreferrer">WhatsApp</a><?php elseif (in_array($k, ['consent', 'publish_ok', 'contact_ok'], true)): ?><?= $v === '1' ? 'Yes' : 'No' ?><?php else: ?><?= nl2br(e((string)$v)) ?><?php endif ?></dd>
      <?php endforeach ?>
    </dl>
    <?php if ($reg): ?>
      <form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="action" value="checkin">
        <p><?= $reg['checked_in_at'] ? '✓ Checked in at ' . e(fmt_date($reg['checked_in_at'], 'j M, g:i A')) : 'Not checked in yet.' ?></p>
        <button class="btn btn--sm <?= $reg['checked_in_at'] ? 'btn--ghost' : 'btn--ok' ?>"><?= $reg['checked_in_at'] ? 'Undo check-in' : 'Mark as checked in' ?></button></form>
    <?php endif ?>
    <?php if ($s['form_type'] === 'testimony'): ?><p><a href="/admin/testimonies">Review this testimony for publishing →</a></p><?php endif ?>
  </section>
  <div class="stack">
    <section class="panel">
      <h2>Status</h2>
      <form method="post" class="inline-form"><?= csrf_field() ?><input type="hidden" name="action" value="status">
        <select name="status" aria-label="Status"><?php foreach (['new' => 'New', 'in_progress' => 'In progress', 'handled' => 'Handled', 'spam' => 'Spam'] as $k => $l): ?><option value="<?= $k ?>"<?= $s['status'] === $k ? ' selected' : '' ?>><?= $l ?></option><?php endforeach ?></select>
        <button class="btn btn--primary btn--sm">Update</button></form>
    </section>
    <section class="panel">
      <h2>Team notes</h2>
      <?php foreach ($notes as $n): ?><div class="note"><p><?= nl2br(e($n['note'])) ?></p><small><?= e($n['user_name'] ?? 'Unknown') ?> · <?= e(fmt_date($n['created_at'], 'j M, g:i A')) ?></small></div><?php endforeach ?>
      <form method="post" class="stack"><?= csrf_field() ?><input type="hidden" name="action" value="note">
        <label class="sr-only" for="note">Add a note</label><textarea id="note" name="note" rows="3" placeholder="Add a private note for the team…" required></textarea>
        <button class="btn btn--ghost btn--sm">Add note</button></form>
    </section>
  </div>
</div>
<section class="panel">
  <div class="panel__head"><h2>Emails</h2>
    <?php if (array_filter($emails, fn($m) => $m['status'] !== 'sent' && $m['to_email'] !== '(not set)')): ?>
      <form method="post"><?= csrf_field() ?><input type="hidden" name="action" value="retry"><button class="btn btn--sm btn--primary">Retry unsent emails</button></form>
    <?php endif ?></div>
  <?php if ($emails): ?>
  <div class="table-wrap"><table class="table"><thead><tr><th>Type</th><th>To</th><th>Status</th><th>Attempts</th><th>Detail</th></tr></thead><tbody>
    <?php foreach ($emails as $m): ?>
      <tr><td><?= e($m['purpose'] === 'notify' ? 'Team notification' : ($m['purpose'] === 'confirm' ? 'Confirmation to sender' : $m['purpose'])) ?></td><td><?= e($m['to_email']) ?></td>
      <td><span class="pill pill--<?= $m['status'] === 'sent' ? 'ok' : ($m['status'] === 'failed' ? 'bad' : '') ?>"><?= e($m['status']) ?></span></td><td><?= (int)$m['attempts'] ?></td>
      <td><?= $m['status'] === 'sent' ? 'Sent ' . e(fmt_date($m['sent_at'], 'j M, g:i A')) : e($m['last_error'] ?? 'Waiting') ?></td></tr>
    <?php endforeach ?>
  </tbody></table></div>
  <?php else: ?><p class="muted">No emails for this submission<?= $s['status'] === 'spam' ? ' (marked as spam on arrival)' : '' ?>.</p><?php endif ?>
</section>
<?php if (is_admin()): ?>
  <form method="post" class="danger-zone" data-confirm="Permanently delete this submission? This cannot be undone."><?= csrf_field() ?><input type="hidden" name="action" value="delete"><button class="btn btn--danger btn--sm">Delete submission</button></form>
<?php endif ?>
