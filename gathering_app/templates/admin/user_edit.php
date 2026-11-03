<div class="page-head"><div><p class="crumbs"><a href="/admin/users">← Staff accounts</a></p><h1><?= e($title) ?></h1></div></div>
<?php if ($error): ?><div class="alert alert--bad" role="alert"><?= e($error) ?></div><?php endif ?>
<form method="post" class="panel" autocomplete="off"><?= csrf_field() ?>
  <div class="form-grid">
    <div class="field"><label for="n">Name <span class="req">*</span></label><input id="n" name="name" value="<?= e($u['name']) ?>" required></div>
    <div class="field"><label for="em">Email <span class="req">*</span></label><input id="em" type="email" name="email" value="<?= e($u['email']) ?>" required></div>
    <div class="field"><label for="r">Role</label><select id="r" name="role"<?= $isMe ? ' disabled' : '' ?>><option value="editor"<?= $u['role'] === 'editor' ? ' selected' : '' ?>>Editor</option><option value="admin"<?= $u['role'] === 'admin' ? ' selected' : '' ?>>Administrator</option></select><?php if ($isMe): ?><p class="help">You cannot change your own role.</p><?php endif ?></div>
    <div class="field"><label for="pw"><?= $id ? 'New password (leave blank to keep)' : 'Starting password *' ?></label><input id="pw" type="password" name="password" autocomplete="new-password" minlength="10"><p class="help">At least 10 characters, letters and numbers.</p></div>
    <div class="field field--check field--wide"><label><input type="checkbox" name="is_active" value="1"<?= $u['is_active'] ? ' checked' : '' ?><?= $isMe ? ' disabled' : '' ?>> Account is active (can sign in)</label></div>
  </div>
  <div class="form-actions"><button class="btn btn--primary">Save account</button><a class="btn btn--link" href="/admin/users">Cancel</a></div>
</form>
<?php if ($id && !$isMe): ?>
  <form method="post" class="danger-zone" data-confirm="Delete this staff account?"><?= csrf_field() ?><input type="hidden" name="action" value="delete"><button class="btn btn--danger btn--sm">Delete account</button></form>
<?php endif ?>
