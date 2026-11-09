<?php require __DIR__ . '/_header.php'; ?>
<article>
  <header class="page-hero"><div class="wrap wrap--narrow page-hero__inner">
    <h1 class="page-hero__title"><?= e($post['title']) ?></h1>
    <p class="post-date"><time datetime="<?= e(fmt_date($post['published_at'], 'Y-m-d')) ?>"><?= e(fmt_date($post['published_at'], 'j F Y')) ?></time></p>
    <?php if ($post['excerpt']): ?><p class="page-hero__intro"><?= e($post['excerpt']) ?></p><?php endif ?>
  </div></header>
  <?php if ($post['cover_media_id']): ?><div class="wrap wrap--mid post-cover"><?= picture((int)$post['cover_media_id'], $post['title'], '(min-width: 1000px) 960px, 100vw', '', true) ?></div><?php endif ?>
  <div class="section section--tight"><div class="wrap wrap--narrow prose"><?= clean_html((string)$post['body']) ?>
    <p><a class="link-arrow link-arrow--back" href="/news"><?= icon('arrow', 18) ?> All news</a></p></div></div>
</article>
<?php require __DIR__ . '/_footer.php'; ?>
