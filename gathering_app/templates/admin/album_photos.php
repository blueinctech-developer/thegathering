<section class="panel" id="photos">
  <div class="panel__head"><h2>Photos (<?= count($photos) ?>)</h2></div>
  <form method="post" action="/admin/albums/<?= (int)$albumId ?>/upload" enctype="multipart/form-data" class="uploader">
    <?= csrf_field() ?>
    <label for="photos-input" class="uploader__drop" data-drop>
      <strong>Choose photos to upload</strong>
      <span>or drag them here. JPG, PNG or WebP, up to 15 MB each. You can select many at once.</span>
      <input id="photos-input" type="file" name="photos[]" accept="image/jpeg,image/png,image/webp" multiple>
    </label>
    <button class="btn btn--primary" type="submit">Upload</button>
  </form>
  <?php if ($photos): ?>
  <form method="post" action="/admin/albums/<?= (int)$albumId ?>/photos">
    <?= csrf_field() ?>
    <ul class="photo-admin">
      <?php foreach ($photos as $ph): ?>
        <li>
          <img src="/<?= e(preg_replace('/\.(jpg|png)$/', $ph['variants'] ? '-' . explode(',', $ph['variants'])[0] . '.$1' : '.$1', $ph['path'])) ?>" alt="">
          <label>Caption<input type="text" name="photo[<?= (int)$ph['id'] ?>][caption]" value="<?= e($ph['caption']) ?>"></label>
          <label>Description (alt text)<input type="text" name="photo[<?= (int)$ph['id'] ?>][alt]" value="<?= e($ph['alt']) ?>" placeholder="What is in the photo?"></label>
          <div class="photo-admin__row">
            <label class="photo-admin__order">Order<input type="number" name="photo[<?= (int)$ph['id'] ?>][sort_order]" value="<?= (int)$ph['sort_order'] ?>"></label>
            <label class="check-inline check-inline--bad"><input type="checkbox" name="photo[<?= (int)$ph['id'] ?>][delete]" value="1"> Delete</label>
          </div>
        </li>
      <?php endforeach ?>
    </ul>
    <div class="form-actions"><button class="btn btn--primary" type="submit">Save photo details</button></div>
  </form>
  <?php else: ?><p class="muted">No photos yet.</p><?php endif ?>
</section>
