<?php
$me = current_user();
$p = request_path();
$newCount = (int)scalar("SELECT COUNT(*) FROM submissions WHERE status = 'new'");
$pendingT = (int)scalar("SELECT COUNT(*) FROM testimonies WHERE status = 'pending'");
$failed = (int)scalar("SELECT COUNT(*) FROM email_outbox WHERE status = 'failed'");
$nav = [
    'Overview' => [['/admin', 'Dashboard', 0], ['/admin/submissions', 'Submissions', $newCount]],
    'Event' => [['/admin/events', 'Events', 0], ['/admin/speakers', 'Speakers', 0], ['/admin/schedule', 'Schedule', 0]],
    'Content' => [['/admin/pages', 'Pages', 0], ['/admin/blocks', 'Content blocks', 0],['/admin/albums', 'Gallery', 0], ['/admin/messages', 'Media & sermons', 0], ['/admin/posts', 'News', 0],
        ['/admin/testimonies', 'Testimonies', $pendingT], ['/admin/faqs', 'FAQs', 0], ['/admin/media', 'Media library', 0]],
    'Giving' => [['/admin/blocks?grp=bank_accounts', 'Bank accounts', 0]],
];
if (is_admin()) {
    $nav['Administration'] = [['/admin/settings', 'Settings', 0], ['/admin/users', 'Staff accounts', 0], ['/admin/emails', 'Email log', $failed], ['/admin/redirects', 'Redirects', 0], ['/admin/audit', 'Activity log', 0]];
}
$ok = flash('ok');
$err = flash('err');
?><!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= e($title ?? 'Admin') ?> · <?= e(setting('site_name', 'The Gathering')) ?> admin</title>
<link rel="stylesheet" href="<?= asset('assets/css/admin.css') ?>">
<script src="<?= asset('assets/js/admin.js') ?>" defer></script>
</head>
<body class="admin">
<a class="skip" href="#main">Skip to content</a>
<aside class="side" id="side">
  <div class="side__brand"><a href="/admin"><?= e(setting('site_name', 'The Gathering')) ?></a><span>Admin</span></div>
  <nav aria-label="Admin">
    <?php foreach ($nav as $group => $links): ?>
      <p class="side__group"><?= e($group) ?></p>
      <ul>
        <?php foreach ($links as [$href, $label, $badge]):
          $active = $href === '/admin' ? $p === '/admin' : ($p === $href || str_starts_with($p, $href . '/')); ?>
          <li><a href="<?= e($href) ?>"<?= $active ? ' aria-current="page"' : '' ?>><?= e($label) ?><?php if ($badge): ?><span class="badge<?= $label === 'Email log' ? ' badge--bad' : '' ?>"><?= (int)$badge ?></span><?php endif ?></a></li>
        <?php endforeach ?>
      </ul>
    <?php endforeach ?>
  </nav>
  <div class="side__foot">
    <a href="/" target="_blank" rel="noopener">View website ↗</a>
  </div>
</aside>
<div class="main-col">
  <header class="topbar">
    <button class="topbar__menu" type="button" aria-controls="side" aria-expanded="false" data-side-toggle>☰ <span class="sr-only">Menu</span></button>
    <p class="topbar__title"><?= e($title ?? '') ?></p>
    <div class="topbar__user">
      <a href="/admin/account"><?= e($me['name']) ?> <small><?= $me['role'] === 'admin' ? 'Administrator' : 'Editor' ?></small></a>
      <form method="post" action="/admin/logout"><?= csrf_field() ?><button type="submit" class="btn btn--ghost btn--sm">Sign out</button></form>
    </div>
  </header>
  <main id="main" class="content" tabindex="-1">
    <?php if ($ok): ?><div class="alert alert--ok" role="status"><?= e($ok) ?></div><?php endif ?>
    <?php if ($err): ?><div class="alert alert--bad" role="alert"><?= e($err) ?></div><?php endif ?>
    <?= $content ?>
  </main>
</div>
</body>
</html>
