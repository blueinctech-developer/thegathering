<?php
declare(strict_types=1);

function system_page_meta(?array $page, string $fallbackTitle, string $fallbackDesc = ''): array
{
    return [
        'title' => $page['meta_title'] ?? null ?: ($page['title'] ?? $fallbackTitle),
        'description' => $page['meta_description'] ?? null ?: ($page && ($page['intro'] || $page['body']) ? excerpt((string)($page['intro'] ?: $page['body'])) : $fallbackDesc),
        'image' => !empty($page['hero_media_id']) ? media_url((int)$page['hero_media_id'], 1600, true) : '',
    ];
}

function page_home(array $p): void
{
    $ev = current_event();
    $jsonld = [organization_jsonld()];
    if ($e = event_jsonld($ev)) $jsonld[] = $e;
    $img = $ev && ($ev['flyer_media_id'] || $ev['hero_media_id']) ? media_url((int)($ev['flyer_media_id'] ?: $ev['hero_media_id']), 1600, true) : '';
    view('public/home', [
        'event' => $ev,
        'regState' => registration_state($ev),
        'speakers' => all('SELECT * FROM speakers WHERE is_published = 1 ORDER BY is_featured DESC, sort_order, name LIMIT 8'),
        'days' => $ev ? schedule_for_event((int)$ev['id']) : [],
        'messages' => all('SELECT * FROM messages WHERE is_published = 1 ORDER BY recorded_on DESC, id DESC LIMIT 3'),
        'albums' => all('SELECT a.*, (SELECT media_id FROM photos WHERE album_id = a.id ORDER BY sort_order, id LIMIT 1) AS cover_media_id,
            (SELECT COUNT(*) FROM photos WHERE album_id = a.id) AS photo_count FROM albums a WHERE a.is_published = 1
            HAVING photo_count > 0 ORDER BY a.year DESC, a.sort_order LIMIT 3'),
        'testimonies' => all("SELECT * FROM testimonies WHERE status = 'approved' ORDER BY reviewed_at DESC LIMIT 3"),
        'posts' => all("SELECT * FROM posts WHERE status = 'published' AND published_at <= NOW() ORDER BY published_at DESC LIMIT 3"),
        'meta' => ['title' => '', 'image' => $img, 'jsonld' => $jsonld,
            'description' => setting('meta_description') ?: ($ev ? trim($ev['name'] . ($ev['theme'] ? ': ' . $ev['theme'] : '') . ($ev['starts_at'] ? '. ' . fmt_date_range($ev['starts_at'], $ev['ends_at']) : '') . ($ev['venue_name'] ? ', ' . $ev['venue_name'] : '')) : '')],
    ]);
}

function schedule_for_event(int $eventId): array
{
    $days = all('SELECT * FROM schedule_days WHERE event_id = ? ORDER BY sort_order, day_date, id', [$eventId]);
    foreach ($days as &$d) {
        $d['sessions'] = all('SELECT s.*, sp.name AS speaker_name, sp.slug AS speaker_slug FROM schedule_sessions s
            LEFT JOIN speakers sp ON sp.id = s.speaker_id AND sp.is_published = 1
            WHERE s.day_id = ? ORDER BY s.sort_order, s.starts_at, s.id', [$d['id']]);
    }
    return $days;
}

function page_about(array $p): void
{
    $page = page_get('about');
    if (!$page || !(int)$page['is_published']) not_found();
    view('public/about', ['page' => $page, 'meta' => system_page_meta($page, 'About')]);
}

function page_outreach(array $p): void
{
    $page = page_get('outreach');
    if (!$page || !(int)$page['is_published']) not_found();
    view('public/outreach', ['page' => $page, 'meta' => system_page_meta($page, 'Outreach')]);
}

function page_speakers(array $p): void
{
    $speakers = all('SELECT * FROM speakers WHERE is_published = 1 ORDER BY is_featured DESC, sort_order, name');
    if (!$speakers) not_found();
    view('public/speakers', ['speakers' => $speakers, 'meta' => ['title' => 'Speakers', 'description' => 'Ministers and speakers at ' . setting('site_name', 'The Gathering') . ': ' . implode(', ', array_slice(array_column($speakers, 'name'), 0, 6)) . '.']]);
}

function page_speaker(array $p): void
{
    $s = one('SELECT * FROM speakers WHERE slug = ? AND is_published = 1', [$p['slug']]);
    if (!$s || (!$s['photo_media_id'] && trim(strip_tags((string)$s['bio'])) === '')) not_found();
    $sessions = all('SELECT s.*, d.label AS day_label, d.day_date FROM schedule_sessions s JOIN schedule_days d ON d.id = s.day_id
        JOIN events e ON e.id = d.event_id AND e.is_current = 1 WHERE s.speaker_id = ? ORDER BY d.sort_order, s.starts_at', [$s['id']]);
    view('public/speaker', ['s' => $s, 'sessions' => $sessions, 'meta' => [
        'title' => $s['name'], 'type' => 'profile',
        'description' => $s['bio'] ? excerpt($s['bio']) : trim($s['name'] . ($s['role_title'] ? ', ' . $s['role_title'] : '') . ', speaker at ' . setting('site_name', 'The Gathering')),
        'image' => $s['photo_media_id'] ? media_url((int)$s['photo_media_id'], 960, true) : '',
    ]]);
}

function page_schedule(array $p): void
{
    $ev = current_event();
    $days = $ev ? schedule_for_event((int)$ev['id']) : [];
    if (!$days) not_found();
    view('public/schedule', ['event' => $ev, 'days' => $days, 'meta' => ['title' => 'Programme & schedule', 'description' => 'Programme for ' . $ev['name'] . ($ev['starts_at'] ? ', ' . fmt_date_range($ev['starts_at'], $ev['ends_at']) : '') . '.']]);
}

function page_register(array $p): void
{
    $ev = current_event();
    if (!form_enabled('registration') || !$ev) not_found();
    view('public/register', ['event' => $ev, 'state' => registration_state($ev), 'meta' => [
        'title' => 'Register', 'description' => 'Register for ' . $ev['name'] . ($ev['starts_at'] ? ', ' . fmt_date_range($ev['starts_at'], $ev['ends_at']) : '') . ($ev['venue_name'] ? ', ' . $ev['venue_name'] : '') . '.',
    ]]);
}

function page_venue(array $p): void
{
    $page = page_get('venue');
    $ev = current_event();
    if (!feature('venue')) not_found();
    view('public/venue', ['page' => $page && (int)$page['is_published'] ? $page : null, 'event' => $ev,
        'meta' => system_page_meta($page && (int)$page['is_published'] ? $page : null, 'Venue & directions', $ev && $ev['venue_name'] ? 'Venue and directions: ' . $ev['venue_name'] . ($ev['venue_address'] ? ', ' . $ev['venue_address'] : '') : '')]);
}

function page_media(array $p): void
{
    if (!feature('media')) not_found();
    $messages = all('SELECT * FROM messages WHERE is_published = 1 ORDER BY recorded_on DESC, id DESC');
    view('public/media', ['messages' => $messages, 'meta' => ['title' => 'Watch & listen', 'description' => 'Livestream and messages from ' . setting('site_name', 'The Gathering') . '.']]);
}

function page_gallery(array $p): void
{
    $albums = all('SELECT a.*, (SELECT media_id FROM photos WHERE album_id = a.id ORDER BY sort_order, id LIMIT 1) AS cover_media_id,
        (SELECT COUNT(*) FROM photos WHERE album_id = a.id) AS photo_count FROM albums a WHERE a.is_published = 1
        HAVING photo_count > 0 ORDER BY a.year DESC, a.sort_order, a.id DESC');
    if (!$albums) not_found();
    view('public/gallery', ['albums' => $albums, 'meta' => ['title' => 'Gallery', 'description' => 'Photos from past gatherings.',
        'image' => media_url((int)$albums[0]['cover_media_id'], 1600, true)]]);
}

function page_album(array $p): void
{
    $a = one('SELECT * FROM albums WHERE slug = ? AND is_published = 1', [$p['slug']]);
    if (!$a) not_found();
    $photos = all('SELECT p.*, m.* , p.id AS photo_id, p.alt AS photo_alt FROM photos p JOIN media m ON m.id = p.media_id WHERE p.album_id = ? ORDER BY p.sort_order, p.id', [$a['id']]);
    if (!$photos) not_found();
    view('public/album', ['album' => $a, 'photos' => $photos, 'meta' => ['title' => 'Gallery: ' . $a['title'],
        'description' => $a['description'] ? excerpt($a['description']) : 'Photos: ' . $a['title'] . '.', 'image' => media_url($photos[0], 1600, true)]]);
}

function page_news(array $p): void
{
    $posts = all("SELECT * FROM posts WHERE status = 'published' AND published_at <= NOW() ORDER BY published_at DESC");
    if (!$posts) not_found();
    view('public/news', ['posts' => $posts, 'meta' => ['title' => 'News & announcements', 'description' => 'Latest news and announcements from ' . setting('site_name', 'The Gathering') . '.']]);
}

function page_post(array $p): void
{
    $post = one("SELECT * FROM posts WHERE slug = ? AND status = 'published' AND published_at <= NOW()", [$p['slug']]);
    if (!$post) not_found();
    view('public/post', ['post' => $post, 'meta' => ['title' => $post['title'], 'type' => 'article',
        'description' => $post['excerpt'] ?: excerpt((string)$post['body']),
        'image' => $post['cover_media_id'] ? media_url((int)$post['cover_media_id'], 1600, true) : '']]);
}

function page_give(array $p): void
{
    if (!feature('give')) not_found();
    $page = page_get('give');
    $page = $page && (int)$page['is_published'] ? $page : null;
    view('public/give', ['page' => $page, 'meta' => system_page_meta($page, 'Give & partner', 'Support the work of ' . setting('site_name', 'The Gathering') . '.')]);
}

function page_volunteer(array $p): void
{
    if (!feature('volunteer')) not_found();
    $page = page_get('volunteer');
    $page = $page && (int)$page['is_published'] ? $page : null;
    view('public/form_page', ['page' => $page, 'type' => 'volunteer', 'heading' => $page['title'] ?? 'Volunteer', 'eyebrow' => 'Get involved',
        'intro' => setting('volunteer_intro'), 'submit' => 'Sign up to serve',
        'success' => 'Thank you for offering to serve. Our team will contact you with the next steps.',
        'meta' => system_page_meta($page, 'Volunteer', 'Serve at ' . setting('site_name', 'The Gathering') . '.')]);
}

function page_prayer(array $p): void
{
    if (!form_enabled('prayer')) not_found();
    view('public/form_page', ['page' => null, 'type' => 'prayer', 'heading' => 'Prayer request', 'eyebrow' => 'We will pray with you',
        'intro' => 'Share your request below. It is kept private and seen only by our prayer team. It is never published.',
        'submit' => 'Send prayer request', 'success' => 'Your request has been received. Our prayer team will be praying with you.',
        'meta' => ['title' => 'Prayer request', 'description' => 'Send a confidential prayer request to the ' . setting('site_name', 'The Gathering') . ' prayer team.']]);
}

function page_testimonies(array $p): void
{
    if (!feature('testimonies')) not_found();
    $items = all("SELECT * FROM testimonies WHERE status = 'approved' ORDER BY reviewed_at DESC");
    view('public/testimonies', ['items' => $items, 'meta' => ['title' => 'Testimonies', 'description' => 'Testimonies from ' . setting('site_name', 'The Gathering') . '.']]);
}

function page_faqs(array $p): void
{
    $faqs = all('SELECT * FROM faqs WHERE is_published = 1 ORDER BY sort_order, id');
    if (!$faqs) not_found();
    $ld = ['@context' => 'https://schema.org', '@type' => 'FAQPage', 'mainEntity' => array_map(fn($f) => [
        '@type' => 'Question', 'name' => $f['question'], 'acceptedAnswer' => ['@type' => 'Answer', 'text' => strip_tags($f['answer'])],
    ], $faqs)];
    view('public/faqs', ['faqs' => $faqs, 'meta' => ['title' => 'Frequently asked questions', 'description' => 'Answers to common questions about ' . setting('site_name', 'The Gathering') . '.', 'jsonld' => [$ld]]]);
}

function page_contact(array $p): void
{
    if (!form_enabled('contact')) not_found();
    view('public/contact', ['meta' => ['title' => 'Contact us', 'description' => 'Get in touch with ' . setting('site_name', 'The Gathering') . '.']]);
}

function page_robots(array $p): void
{
    header('Content-Type: text/plain; charset=utf-8');
    if (!is_production()) {
        echo "# Staging / development copy: keep out of search engines\nUser-agent: *\nDisallow: /\n";
        return;
    }
    echo "User-agent: *\nDisallow: /admin\nDisallow: /forms/\nDisallow: /cron/\n\nSitemap: " . url('/sitemap.xml') . "\n";
}

function page_sitemap(array $p): void
{
    header('Content-Type: application/xml; charset=utf-8');
    $urls = [['/', null]];
    $static = ['about' => '/about', 'speakers' => '/speakers', 'schedule' => '/schedule', 'venue' => '/venue', 'media' => '/media',
        'gallery' => '/gallery', 'news' => '/news', 'give' => '/give', 'volunteer' => '/volunteer', 'testimonies' => '/testimonies', 'faqs' => '/faqs'];
    foreach ($static as $f => $u) {
        if (feature($f)) $urls[] = [$u, null];
    }
    if (feature('register')) $urls[] = ['/register', null];
    if (form_enabled('contact')) $urls[] = ['/contact', null];
    if (form_enabled('prayer')) $urls[] = ['/prayer', null];
    if (page_published('privacy')) $urls[] = ['/privacy', null];
    foreach (all("SELECT slug, updated_at FROM speakers WHERE is_published = 1 AND (photo_media_id IS NOT NULL OR COALESCE(bio, '') <> '')") as $r) $urls[] = ['/speakers/' . $r['slug'], $r['updated_at']];
    foreach (all("SELECT slug, updated_at FROM posts WHERE status='published' AND published_at <= NOW()") as $r) $urls[] = ['/news/' . $r['slug'], $r['updated_at']];
    foreach (all('SELECT a.slug, a.updated_at FROM albums a WHERE a.is_published = 1 AND EXISTS (SELECT 1 FROM photos WHERE album_id = a.id)') as $r) $urls[] = ['/gallery/' . $r['slug'], $r['updated_at']];
    foreach (all('SELECT slug, updated_at FROM pages WHERE is_published = 1 AND is_system = 0') as $r) $urls[] = ['/' . $r['slug'], $r['updated_at']];
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n" . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    foreach ($urls as [$u, $mod]) {
        echo '  <url><loc>' . e(url($u)) . '</loc>' . ($mod ? '<lastmod>' . e(date('Y-m-d', strtotime($mod))) . '</lastmod>' : '') . "</url>\n";
    }
    echo '</urlset>';
}

function page_privacy(array $p): void
{
    $page = page_get('privacy');
    if (!$page || !(int)$page['is_published']) not_found();
    view('public/page', ['page' => $page, 'meta' => system_page_meta($page, 'Privacy policy')]);
}

/** Web cron for hosts without CLI cron: /cron/mail?key=... */
function page_cron_mail(array $p): void
{
    $key = (string)config('cron_key', '');
    if ($key === '' || !hash_equals($key, get('key'))) not_found();
    header('Content-Type: text/plain');
    echo json_encode(mail_process_queue());
}
