<div class="page-head"><div><h1>Settings</h1><p class="muted">Site-wide details. Changes appear on the website as soon as you save.</p></div></div>
<form method="post" enctype="multipart/form-data" class="settings" data-unsaved>
  <?= csrf_field() ?>
  <input type="hidden" name="_tab" value="" data-tab-input>
  <div class="settings__tabs" role="tablist" aria-label="Settings sections">
    <?php $i = 0; foreach ($schema as $id => [$label]): ?>
      <a href="#<?= e($id) ?>" role="tab" data-tab="<?= e($id) ?>"<?= $i++ === 0 ? ' aria-selected="true"' : '' ?>><?= e($label) ?></a>
    <?php endforeach ?>
  </div>
  <?php foreach ($schema as $id => [$label, $fields]): ?>
    <section class="panel settings__panel" id="<?= e($id) ?>" data-panel="<?= e($id) ?>">
      <h2><?= e($label) ?></h2>
      <?php if ($id === 'forms'): ?><p class="help">Only turn on forms the ministry has agreed to use. A form that is off has no page and no menu link.</p><?php endif ?>
      <div class="form-grid">
      <?php foreach ($fields as [$key, $flabel, $type, $help]):
        $v = settings_all()[$key] ?? '';
        if (isset($_POST[$key])) $v = (string)$_POST[$key];
        $err = $errors[$key] ?? null;
        $fid = 's-' . $key;
        $wide = in_array($type, ['textarea', 'richtext', 'image', 'checkbox'], true) ? ' field--wide' : '';
        $helpHtml = $help ? '<p class="help">' . e($help) . '</p>' : '';
        $errHtml = $err ? '<p class="field-error">' . e($err) . '</p>' : ''; ?>
        <?php if ($type === 'checkbox'): ?>
          <div class="field field--check field--wide"><label><input type="checkbox" name="<?= e($key) ?>" value="1"<?= $v === '1' ? ' checked' : '' ?>> <?= e($flabel) ?></label><?= $helpHtml ?></div>
        <?php elseif ($type === 'image'): $m = $v ? media_get((int)$v) : null; ?>
          <div class="field<?= $wide ?><?= $err ? ' has-error' : '' ?>"><label for="<?= $fid ?>"><?= e($flabel) ?></label>
            <div class="upload"><?php if ($m): ?><img class="upload__preview upload__preview--contain" src="<?= e(media_url($m, 480)) ?>" alt=""><?php endif ?>
            <div class="upload__controls"><input type="file" id="<?= $fid ?>" name="<?= e($key) ?>" accept="image/png,image/jpeg,image/webp"><?= $helpHtml ?>
            <?php if ($m): ?><label class="check-inline"><input type="checkbox" name="<?= e($key) ?>_remove" value="1"> Remove</label><?php endif ?></div></div><?= $errHtml ?></div>
        <?php elseif ($type === 'richtext'): ?>
          <div class="field field--wide"><label for="<?= $fid ?>"><?= e($flabel) ?></label>
            <div class="rte" data-rte><div class="rte__bar" role="toolbar" aria-label="Formatting"><button type="button" data-cmd="bold"><b>B</b></button><button type="button" data-cmd="italic"><i>I</i></button><button type="button" data-cmd="insertUnorderedList">• List</button><button type="button" data-cmd="link">Link</button><button type="button" data-cmd="unlink">Unlink</button><button type="button" data-cmd="removeFormat">Clear</button></div>
            <div class="rte__area" contenteditable="true"><?= clean_html($v) ?></div><textarea id="<?= $fid ?>" name="<?= e($key) ?>" class="rte__src" hidden><?= e(clean_html($v)) ?></textarea></div><?= $helpHtml ?></div>
        <?php elseif ($type === 'textarea'): ?>
          <div class="field field--wide<?= $err ? ' has-error' : '' ?>"><label for="<?= $fid ?>"><?= e($flabel) ?></label><textarea id="<?= $fid ?>" name="<?= e($key) ?>" rows="4"><?= e($v) ?></textarea><?= $helpHtml . $errHtml ?></div>
        <?php elseif ($type === 'color'): ?>
          <div class="field<?= $err ? ' has-error' : '' ?>"><label for="<?= $fid ?>"><?= e($flabel) ?></label><div class="color-input"><input type="color" id="<?= $fid ?>" name="<?= e($key) ?>" value="<?= e($v ?: '#000000') ?>"><code><?= e($v) ?></code></div><?= $helpHtml . $errHtml ?></div>
        <?php else: ?>
          <div class="field<?= $err ? ' has-error' : '' ?>"><label for="<?= $fid ?>"><?= e($flabel) ?></label><input type="<?= $type === 'url' ? 'url' : ($type === 'email' ? 'email' : 'text') ?>" id="<?= $fid ?>" name="<?= e($key) ?>" value="<?= e($v) ?>"><?= $helpHtml . $errHtml ?></div>
        <?php endif ?>
      <?php endforeach ?>
      </div>
    </section>
  <?php endforeach ?>
  <div class="form-actions form-actions--sticky"><button class="btn btn--primary" type="submit">Save settings</button></div>
</form>
<section class="panel">
  <h2>Test email sending</h2>
  <p class="muted">Sends a test message using the email settings in config.php.</p>
  <form method="post" action="/admin/emails" class="inline-form"><?= csrf_field() ?><input type="hidden" name="action" value="test">
    <input type="email" name="to" required placeholder="you@example.org" aria-label="Send test email to"><button class="btn btn--ghost" type="submit">Send test email</button></form>
</section>
