<?php
$key = $d['key'];
$back = $d['back'] ?? "/admin/$key";
$publicUrl = ($id && isset($d['public_url'])) ? $d['public_url'](one("SELECT * FROM `{$d['table']}` WHERE id = ?", [$id]) ?? $row) : null;
$canDelete = $id && !(isset($d['no_delete_if']) && $d['no_delete_if']($row));
?>
<div class="page-head">
  <div>
    <p class="crumbs"><a href="<?= e($back) ?>">← <?= e($d['title']) ?></a></p>
    <h1><?= e($title) ?></h1>
  </div>
  <?php if ($publicUrl): ?><a class="btn btn--ghost" href="<?= e($publicUrl) ?>" target="_blank" rel="noopener">View on website ↗</a><?php endif ?>
</div>
<?php if (!empty($errors['_form'])): ?><div class="alert alert--bad" role="alert"><?= e($errors['_form']) ?></div><?php elseif ($errors): ?><div class="alert alert--bad" role="alert">Please fix the highlighted fields.</div><?php endif ?>
<form method="post" enctype="multipart/form-data" class="panel edit-form" data-unsaved>
  <?= csrf_field() ?>
  <div class="form-grid">
    <?php foreach ($d['fields'] as $f): ?><?= crud_input($f, $row, $errors) ?><?php endforeach ?>
  </div>
  <div class="form-actions">
    <button class="btn btn--primary" type="submit">Save</button>
    <button class="btn btn--ghost" type="submit" name="_after" value="list">Save and go back</button>
    <a class="btn btn--link" href="<?= e($back) ?>">Cancel</a>
  </div>
</form>
<?php if (!empty($d['after_form'])): ?><?= ($d['after_form'])($id) ?><?php endif ?>
<?php if ($canDelete): ?>
  <form method="post" action="/admin/<?= e($key) ?>/<?= (int)$id ?>/delete" class="danger-zone" data-confirm="Delete this <?= e($d['singular']) ?>? This cannot be undone.">
    <?= csrf_field() ?><button class="btn btn--danger btn--sm" type="submit">Delete <?= e($d['singular']) ?></button>
  </form>
<?php endif ?>
