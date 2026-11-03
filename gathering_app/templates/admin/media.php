<div class="page-head">
  <div><h1>Media library</h1><p class="muted">All uploaded images and documents. <?= $pick ? '<strong>Choose a file to use it.</strong>' : '' ?></p></div>
</div>
<section class="panel">
  <form method="post" enctype="multipart/form-data" class="uploader"><?= csrf_field() ?><input type="hidden" name="action" value="upload">
    <label for="lib-files" class="uploader__drop" data-drop><strong>Upload images or PDFs</strong><span>JPG, PNG, WebP (15 MB) or PDF (25 MB). Several at once is fine.</span>
      <input id="lib-files" type="file" name="files[]" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" multiple></label>
    <button class="btn btn--primary" type="submit">Upload</button>
  </form>
</section>
<nav class="chips" aria-label="File type">
  <?php foreach (['' => 'All', 'image' => 'Images', 'document' => 'Documents'] as $k => $l): ?><a href="/admin/media?<?= e(http_build_query(array_filter(['kind' => $k, 'pick' => $pick]))) ?>"<?= get('kind') === $k ? ' aria-current="page"' : '' ?>><?= $l ?></a><?php endforeach ?>
</nav>
<?php if (!$items): ?><div class="panel empty"><p>No files yet.</p></div><?php endif ?>
<ul class="library">
  <?php foreach ($items as $m): ?>
    <li class="library__item">
      <?php if ($m['kind'] === 'image'): ?><img src="<?= e(media_url($m, 480)) ?>" alt="" loading="lazy"><?php else: ?><a class="library__doc" href="<?= e(media_url($m)) ?>" target="_blank">PDF</a><?php endif ?>
      <div class="library__meta">
        <strong title="<?= e($m['original_name']) ?>"><?= e($m['original_name'] ?: basename($m['path'])) ?></strong>
        <small>#<?= (int)$m['id'] ?> · <?= $m['width'] ? (int)$m['width'] . '×' . (int)$m['height'] . ' · ' : '' ?><?= e(number_format($m['bytes'] / 1024)) ?> KB</small>
        <?php if ($pick): ?><button type="button" class="btn btn--primary btn--sm" data-pick="<?= e($pick) ?>" data-id="<?= (int)$m['id'] ?>">Use this</button><?php endif ?>
        <?php if ($m['kind'] === 'image'): ?>
          <form method="post" class="library__alt"><?= csrf_field() ?><input type="hidden" name="action" value="alt"><input type="hidden" name="id" value="<?= (int)$m['id'] ?>">
            <input type="text" name="alt" value="<?= e($m['alt']) ?>" placeholder="Describe this image" aria-label="Image description"><button class="btn btn--ghost btn--sm">Save</button></form>
        <?php endif ?>
        <div class="library__links"><input type="text" readonly value="<?= e(media_url($m, null, true)) ?>" aria-label="File link" onclick="this.select()">
        <form method="post" data-confirm="Delete this file permanently?"><?= csrf_field() ?><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= (int)$m['id'] ?>"><button class="btn btn--link btn--danger-text btn--sm">Delete</button></form></div>
      </div>
    </li>
  <?php endforeach ?>
</ul>
