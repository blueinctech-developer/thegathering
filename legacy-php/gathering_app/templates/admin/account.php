<?php $me = current_user(); ?>
<div class="page-head"><div><h1>My account</h1><p class="muted"><?= e($me['name']) ?> · <?= e($me['email']) ?> · <?= $me['role'] === 'admin' ? 'Administrator' : 'Editor' ?></p></div></div>
<?php if ($error): ?><div class="alert alert--bad" role="alert"><?= e($error) ?></div><?php endif ?>
<form method="post" class="panel panel--narrow"><?= csrf_field() ?>
  <h2>Change password</h2>
  <div class="stack">
    <div class="field"><label for="c">Current password</label><input id="c" type="password" name="current" autocomplete="current-password" required></div>
    <div class="field"><label for="p1">New password</label><input id="p1" type="password" name="password" autocomplete="new-password" minlength="10" required><p class="help">At least 10 characters, with letters and numbers.</p></div>
    <div class="field"><label for="p2">Repeat new password</label><input id="p2" type="password" name="password2" autocomplete="new-password" required></div>
  </div>
  <div class="form-actions"><button class="btn btn--primary">Change password</button></div>
</form>
