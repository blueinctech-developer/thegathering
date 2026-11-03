<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= e($title) ?> · <?= e(setting('site_name', 'The Gathering')) ?></title>
<link rel="stylesheet" href="<?= asset('assets/css/admin.css') ?>">
<script src="<?= asset('assets/js/admin.js') ?>" defer></script>
</head>
<body class="auth">
<main class="auth__card">
  <?php if ($mode === 'login'): ?>
    <h1>Sign in</h1>
    <?php if (!empty($notice)): ?><div class="alert alert--ok" role="status"><?= e($notice) ?></div><?php endif ?>
    <?php if (!empty($error)): ?><div class="alert alert--bad" role="alert"><?= e($error) ?></div><?php endif ?>
    <form method="post" class="stack">
      <?= csrf_field() ?>
      <div class="field"><label for="email">Email</label><input id="email" type="email" name="email" value="<?= e($email ?? '') ?>" autocomplete="username" required autofocus></div>
      <div class="field"><label for="password">Password</label><input id="password" type="password" name="password" autocomplete="current-password" required></div>
      <button class="btn btn--primary btn--block" type="submit">Sign in</button>
    </form>
    <p class="auth__alt"><a href="/admin/forgot">Forgot your password?</a></p>
  <?php elseif ($mode === 'forgot'): ?>
    <h1>Reset your password</h1>
    <?php if ($sent): ?>
      <div class="alert alert--ok" role="status">If that email belongs to a staff account, a reset link is on its way. It works for one hour. Check your spam folder too.</div>
    <?php else: ?>
      <p class="muted">Enter your staff email address and we'll send you a link to choose a new password.</p>
      <form method="post" class="stack"><?= csrf_field() ?>
        <div class="field"><label for="email">Email</label><input id="email" type="email" name="email" autocomplete="username" required autofocus></div>
        <button class="btn btn--primary btn--block" type="submit">Send reset link</button>
      </form>
    <?php endif ?>
    <p class="auth__alt"><a href="/admin/login">Back to sign in</a></p>
  <?php elseif ($mode === 'reset'): ?>
    <h1>Choose a new password</h1>
    <?php if ($error): ?><div class="alert alert--bad" role="alert"><?= e($error) ?></div><?php endif ?>
    <form method="post" class="stack"><?= csrf_field() ?><input type="hidden" name="token" value="<?= e($token) ?>">
      <div class="field"><label for="pw">New password</label><input id="pw" type="password" name="password" autocomplete="new-password" minlength="10" required><p class="help">At least 10 characters, with letters and numbers.</p></div>
      <div class="field"><label for="pw2">Repeat new password</label><input id="pw2" type="password" name="password2" autocomplete="new-password" required></div>
      <button class="btn btn--primary btn--block" type="submit">Save password</button>
    </form>
  <?php elseif ($mode === 'reset_invalid'): ?>
    <h1>This link has expired</h1>
    <p>Password reset links work once, for one hour. <a href="/admin/forgot">Request a new link</a>.</p>
  <?php elseif ($mode === 'setup'): ?>
    <h1>Create the first administrator</h1>
    <p class="muted">This page works only once, while there are no staff accounts.</p>
    <?php if ($error): ?><div class="alert alert--bad" role="alert"><?= e($error) ?></div><?php endif ?>
    <form method="post" class="stack"><?= csrf_field() ?>
      <div class="field"><label for="st">Setup code</label><input id="st" type="password" name="setup_token" required><p class="help">The "setup_token" value from config.php.</p></div>
      <div class="field"><label for="name">Your name</label><input id="name" name="name" value="<?= e(post('name')) ?>" autocomplete="name" required></div>
      <div class="field"><label for="email">Your email</label><input id="email" type="email" name="email" value="<?= e(post('email')) ?>" autocomplete="username" required></div>
      <div class="field"><label for="pw">Password</label><input id="pw" type="password" name="password" autocomplete="new-password" minlength="10" required><p class="help">At least 10 characters, with letters and numbers.</p></div>
      <div class="field"><label for="pw2">Repeat password</label><input id="pw2" type="password" name="password2" autocomplete="new-password" required></div>
      <button class="btn btn--primary btn--block" type="submit">Create account</button>
    </form>
  <?php else: ?>
    <h1>Not set up yet</h1>
    <p>No staff accounts exist yet. Go to <a href="/admin/setup">first-time setup</a>.</p>
  <?php endif ?>
</main>
</body>
</html>
