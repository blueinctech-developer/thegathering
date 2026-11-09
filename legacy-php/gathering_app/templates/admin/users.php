<div class="page-head">
  <div><h1>Staff accounts</h1><p class="muted"><strong>Administrators</strong> can do everything, including settings and accounts. <strong>Editors</strong> can manage content and submissions.</p></div>
  <a class="btn btn--primary" href="/admin/users/new">+ Add account</a>
</div>
<section class="panel panel--flush"><div class="table-wrap"><table class="table">
  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last sign-in</th><th></th></tr></thead>
  <tbody><?php foreach ($users as $u): ?>
    <tr><td><a class="row-link" href="/admin/users/<?= (int)$u['id'] ?>"><?= e($u['name']) ?></a></td><td><?= e($u['email']) ?></td>
    <td><?= $u['role'] === 'admin' ? 'Administrator' : 'Editor' ?></td>
    <td><span class="pill pill--<?= $u['is_active'] ? 'ok' : '' ?>"><?= $u['is_active'] ? 'Active' : 'Disabled' ?></span></td>
    <td><?= e($u['last_login_at'] ? fmt_date($u['last_login_at'], 'j M Y, g:i A') : 'Never') ?></td>
    <td class="t-right"><a class="btn btn--ghost btn--sm" href="/admin/users/<?= (int)$u['id'] ?>">Edit</a></td></tr>
  <?php endforeach ?></tbody>
</table></div></section>
