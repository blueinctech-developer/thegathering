<?php
declare(strict_types=1);

function current_event(): ?array
{
    static $ev = false;
    if ($ev === false) {
        $ev = one('SELECT * FROM events WHERE is_current = 1 ORDER BY id DESC LIMIT 1');
    }
    return $ev;
}

/** 'open' | 'closed' | 'full' | 'none' */
function registration_state(?array $event): string
{
    if (!$event) {
        return 'none';
    }
    if ((int)$event['registration_open'] !== 1) {
        return 'closed';
    }
    if ($event['ends_at'] && strtotime($event['ends_at']) < time()) {
        return 'closed';
    }
    if ($event['capacity']) {
        if (registered_count((int)$event['id']) >= (int)$event['capacity']) {
            return 'full';
        }
    }
    return 'open';
}

function registered_count(int $eventId): int
{
    return (int)scalar('SELECT COALESCE(SUM(attendees),0) FROM registrations WHERE event_id = ?', [$eventId]);
}

function page_get(string $slug): ?array
{
    static $cache = [];
    if (!array_key_exists($slug, $cache)) {
        $cache[$slug] = one('SELECT * FROM pages WHERE slug = ?', [$slug]);
    }
    return $cache[$slug];
}

function page_published(string $slug): bool
{
    $p = page_get($slug);
    return $p && (int)$p['is_published'] === 1;
}

function has_rows(string $sql): bool
{
    static $cache = [];
    return $cache[$sql] ??= (bool)scalar($sql);
}

/** Feature availability, used for nav and to hide empty sections. */
function feature(string $name): bool
{
    $ev = current_event();
    return match ($name) {
        'about' => page_published('about'),
        'outreach' => page_published('outreach'),
        'venue' => page_published('venue') || (bool)($ev['map_query'] ?? null),
        'speakers' => has_rows('SELECT 1 FROM speakers WHERE is_published = 1 LIMIT 1'),
        'schedule' => $ev && has_rows('SELECT 1 FROM schedule_days d JOIN events e ON e.id = d.event_id WHERE e.is_current = 1 LIMIT 1'),
        'media' => has_rows('SELECT 1 FROM messages WHERE is_published = 1 LIMIT 1') || setting('livestream_url') !== '' || setting('livestream_embed_url') !== '',
        'gallery' => has_rows('SELECT 1 FROM albums a JOIN photos p ON p.album_id = a.id WHERE a.is_published = 1 LIMIT 1'),
        'news' => has_rows("SELECT 1 FROM posts WHERE status = 'published' AND published_at <= NOW() LIMIT 1"),
        'faqs' => has_rows('SELECT 1 FROM faqs WHERE is_published = 1 LIMIT 1'),
        'give' => page_published('give') || setting('giving_online_url') !== '' || setting('giving_bank_details') !== '' || form_enabled('partnership'),
        'volunteer' => form_enabled('volunteer') || page_published('volunteer'),
        'testimonies' => form_enabled('testimony') || has_rows("SELECT 1 FROM testimonies WHERE status = 'approved' LIMIT 1"),
        'register' => registration_state($ev) !== 'none' && form_enabled('registration'),
        default => false,
    };
}

function nav_items(): array
{
    $items = [];
    if (feature('about')) $items[] = ['/about', 'About'];
    if (page_published('outreach')) $items[] = ['/outreach', 'Outreach'];
    if (feature('speakers')) $items[] = ['/speakers', 'Speakers'];
    if (feature('venue')) $items[] = ['/venue', 'Venue & travel'];
    if (feature('gallery')) $items[] = ['/gallery', 'Gallery'];
    if (form_enabled('contact')) $items[] = ['/contact', 'Contact'];
    return $items;
}

function more_items(): array
{
    $items = [];
    if (feature('schedule')) $items[] = ['/schedule', 'Programme'];
    if (feature('media')) $items[] = ['/media', 'Watch'];
    if (feature('news')) $items[] = ['/news', 'News'];
    if (feature('volunteer')) $items[] = ['/volunteer', 'Volunteer'];
    if (form_enabled('prayer')) $items[] = ['/prayer', 'Prayer request'];
    if (feature('testimonies')) $items[] = ['/testimonies', 'Testimonies'];
    if (feature('faqs')) $items[] = ['/faqs', 'FAQs'];
    foreach (all("SELECT slug, title FROM pages WHERE is_published = 1 AND is_system = 0 ORDER BY title") as $p) {
        $items[] = ['/' . $p['slug'], $p['title']];
    }
    return $items;
}

function social_links(): array
{
    $map = [
        'social_facebook' => 'Facebook', 'social_instagram' => 'Instagram', 'social_youtube' => 'YouTube',
        'social_x' => 'X', 'social_tiktok' => 'TikTok',
    ];
    $out = [];
    foreach ($map as $k => $label) {
        $u = setting($k);
        if ($u !== '' && valid_http_url($u)) {
            $out[] = ['url' => $u, 'label' => $label, 'icon' => strtolower($label)];
        }
    }
    return $out;
}

/** Convert a YouTube/Vimeo/Facebook link into an embeddable URL, or '' if unknown. */
function embed_url(string $u): string
{
    $u = trim($u);
    if ($u === '') return '';
    if (preg_match('~(?:youtube\.com/(?:watch\?(?:.*&)?v=|embed/|live/|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})~', $u, $m)) {
        return 'https://www.youtube-nocookie.com/embed/' . $m[1];
    }
    if (preg_match('~youtube\.com/embed/live_stream\?channel=([A-Za-z0-9_-]+)~', $u, $m)) {
        return 'https://www.youtube.com/embed/live_stream?channel=' . $m[1];
    }
    if (preg_match('~vimeo\.com/(?:video/)?(\d+)~', $u, $m)) {
        return 'https://player.vimeo.com/video/' . $m[1];
    }
    if (preg_match('~facebook\.com/.+/videos/~', $u)) {
        return 'https://www.facebook.com/plugins/video.php?href=' . rawurlencode($u) . '&show_text=false';
    }
    if (preg_match('~soundcloud\.com/~', $u)) {
        return 'https://w.soundcloud.com/player/?url=' . rawurlencode($u);
    }
    return '';
}

function youtube_thumb(string $u): string
{
    if (preg_match('~(?:youtube\.com/(?:watch\?(?:.*&)?v=|embed/|live/|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})~', $u, $m)) {
        return 'https://i.ytimg.com/vi/' . $m[1] . '/hqdefault.jpg';
    }
    return '';
}

function map_embed(string $query): string
{
    return 'https://www.google.com/maps?q=' . rawurlencode($query) . '&output=embed';
}

function map_link(string $query): string
{
    return 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode($query);
}

/* ---------- SEO ---------- */

function meta_defaults(array $meta): array
{
    $site = setting('site_name', 'The Gathering');
    $title = $meta['title'] ?? '';
    $full = $title && $title !== $site ? "$title | $site" : ($site . (setting('site_tagline') ? ' | ' . setting('site_tagline') : ''));
    $ogImage = $meta['image'] ?? '';
    if (!$ogImage && setting('og_media_id')) {
        $ogImage = media_url((int)setting('og_media_id'), 1600, true);
    }
    return [
        'full_title' => $full,
        'description' => ($meta['description'] ?? '') ?: (setting('meta_description') ?: (setting('site_tagline') ?: "Official website of $site.")),
        'canonical' => $meta['canonical'] ?? url(request_path() === '/' ? '/' : request_path()),
        'image' => $ogImage,
        'type' => $meta['type'] ?? 'website',
        'noindex' => !is_production() || !empty($meta['noindex']),
        'jsonld' => $meta['jsonld'] ?? [],
    ];
}

function organization_jsonld(): array
{
    $org = ['@context' => 'https://schema.org', '@type' => 'Organization', 'name' => setting('site_name', 'The Gathering'), 'url' => base_url() . '/'];
    if (setting('logo_media_id')) $org['logo'] = media_url((int)setting('logo_media_id'), null, true);
    $same = array_column(social_links(), 'url');
    if ($same) $org['sameAs'] = $same;
    if (setting('contact_email')) $org['email'] = setting('contact_email');
    if (setting('contact_phone')) $org['telephone'] = setting('contact_phone');
    return $org;
}

function event_jsonld(?array $ev): ?array
{
    if (!$ev || !$ev['starts_at'] || !$ev['venue_name']) {
        return null; // only publish structured data when real details exist
    }
    $d = [
        '@context' => 'https://schema.org', '@type' => 'Event',
        'name' => $ev['name'] . ($ev['theme'] ? ': ' . $ev['theme'] : ''),
        'startDate' => (new DateTime($ev['starts_at']))->format(DATE_ATOM),
        'eventStatus' => 'https://schema.org/EventScheduled',
        'eventAttendanceMode' => (setting('livestream_url') || setting('livestream_embed_url')) ? 'https://schema.org/MixedEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
        'location' => ['@type' => 'Place', 'name' => $ev['venue_name'], 'address' => $ev['venue_address'] ?: $ev['venue_name']],
        'organizer' => ['@type' => 'Organization', 'name' => setting('site_name', 'The Gathering'), 'url' => base_url() . '/'],
    ];
    if ($ev['ends_at']) $d['endDate'] = (new DateTime($ev['ends_at']))->format(DATE_ATOM);
    if ($ev['summary']) $d['description'] = excerpt($ev['summary'], 300);
    $img = $ev['flyer_media_id'] ?: $ev['hero_media_id'];
    if ($img) $d['image'] = [media_url((int)$img, 1600, true)];
    if (registration_state($ev) === 'open') {
        $d['offers'] = ['@type' => 'Offer', 'url' => url('/register'), 'availability' => 'https://schema.org/InStock'];
    }
    return $d;
}

/** Icons from Lucide (lucide.dev, ISC licence). Decorative, so hidden from screen readers. */
function icon(string $name, int $size = 20): string
{
    static $lucide = [
        'arrow' => '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',  // lucide: arrow-right
        'play' => '<polygon points="6 3 20 12 6 21 6 3"/>',  // lucide: play
        'pin' => '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',  // lucide: map-pin
        'calendar' => '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',  // lucide: calendar
        'clock' => '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',  // lucide: clock
        'mail' => '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',  // lucide: mail
        'phone' => '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',  // lucide: phone
        'download' => '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',  // lucide: download
        'heart' => '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',  // lucide: heart
        'external' => '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',  // lucide: external-link
        'facebook' => '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',  // lucide: facebook
        'instagram' => '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',  // lucide: instagram
        'youtube' => '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',  // lucide: youtube
        'whatsapp' => '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',  // lucide: message-circle
    ];
    // Lucide has no X or TikTok logo, so these two stay as filled brand marks.
    static $brand = [
        'x' => '<path d="M17.8 3.5h3l-6.6 7.5 7.8 9.5h-6.1l-4.8-5.9-5.5 5.9H2.6l7-7.9L2.2 3.5h6.2l4.3 5.4zm-1 15.3h1.7L7.3 5.1H5.5z" fill="currentColor"/>',
        'tiktok' => '<path d="M16.5 3c.4 2.2 1.8 3.6 4 3.8v3a7.3 7.3 0 0 1-4-1.3v6.2a5.8 5.8 0 1 1-5.8-5.8h.6v3.1a2.8 2.8 0 1 0 2.2 2.7V3z" fill="currentColor"/>',
    ];
    $attrs = 'class="icon" aria-hidden="true" focusable="false" width="' . $size . '" height="' . $size . '" viewBox="0 0 24 24"';
    if (isset($lucide[$name])) {
        return '<svg ' . $attrs . ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' . $lucide[$name] . '</svg>';
    }
    if (isset($brand[$name])) {
        return '<svg ' . $attrs . '>' . $brand[$name] . '</svg>';
    }
    return '';
}

/* ---------- content blocks ---------- */

function block_groups(): array
{
    return [
        'stats' => 'Impact figures (homepage & About)',
        'pillars' => 'How The Gathering creates impact (homepage)',
        'challenges' => 'Why The Gathering matters: challenges (homepage & About)',
        'activities' => 'The Gathering in action (About)',
        'programmes' => 'Strategic aid programmes (Outreach)',
        'infrastructure' => 'Gathering Land infrastructure (Outreach & Give)',
        'goals' => 'Impact goals for the year (Outreach)',
        'bank_accounts' => 'Bank accounts (Give page)',
        'values' => 'Inspire / Impact / Empower values (homepage)',
        'highlights' => 'At a glance facts (homepage)',
        'medical_services' => 'Medical outreach services (Outreach)',
        'land_vision' => 'Vision for the land (Outreach)',
        'bus_stops' => 'Free bus pick-up points (homepage & Venue)',
        'partner_tiers' => 'Partnership tiers (Give)',
        'funding_streams' => 'Funding streams (Give): title = stream, text = one amount per line, e.g. NGN: ₦18,500,000',
        'governance' => 'Governance values (About)',
    ];
}

function block_icons(): array
{
    return ['prayer', 'medical', 'compassion', 'community', 'land', 'solar', 'fence', 'seat', 'light', 'sound', 'home', 'globe', 'heart', 'bus', 'calendar', 'shield', 'spark', 'megaphone'];
}

function blocks(string $grp): array
{
    static $cache = [];
    return $cache[$grp] ??= all('SELECT * FROM blocks WHERE grp = ? AND is_published = 1 ORDER BY sort_order, id', [$grp]);
}

/** Lucide icons for content blocks (the keys are what Admin stores). */
function block_icon(?string $name, int $size = 28): string
{
    static $p = [
        'prayer' => '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',  // lucide: flame
        'medical' => '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',  // lucide: stethoscope
        'compassion' => '<path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16"/><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 15 6 6"/><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z"/>',  // lucide: hand-heart
        'community' => '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',  // lucide: users
        'land' => '<path d="m12 8 6-3-6-3v10"/><path d="m8 11.99-5.5 3.14a1 1 0 0 0 0 1.74l8.5 4.86a2 2 0 0 0 2 0l8.5-4.86a1 1 0 0 0 0-1.74L16 12"/><path d="m6.49 12.85 11.02 6.3"/><path d="M17.51 12.85 6.5 19.15"/>',  // lucide: land-plot
        'solar' => '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',  // lucide: sun
        'fence' => '<path d="M4 3 2 5v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z"/><path d="M6 8h4"/><path d="M6 18h4"/><path d="m12 3-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z"/><path d="M14 8h4"/><path d="M14 18h4"/><path d="m20 3-2 2v15c0 .6.4 1 1 1h2c.6 0 1-.4 1-1V5Z"/>',  // lucide: fence
        'seat' => '<path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"/><path d="M5 18v2"/><path d="M19 18v2"/>',  // lucide: armchair
        'light' => '<path d="M8 2h8l4 10H4L8 2Z"/><path d="M12 12v6"/><path d="M8 22v-2c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v2H8Z"/>',  // lucide: lamp
        'sound' => '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M12 6h.01"/><circle cx="12" cy="14" r="4"/><path d="M12 14h.01"/>',  // lucide: speaker
        'home' => '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',  // lucide: house
        'globe' => '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',  // lucide: globe
        'heart' => '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',  // lucide: heart
        'bus' => '<path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>',  // lucide: bus
        'calendar' => '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',  // lucide: calendar
        'shield' => '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',  // lucide: shield-check
        'spark' => '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',  // lucide: sparkles
        'megaphone' => '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',  // lucide: megaphone
    ];
    if (!$name || !isset($p[$name])) return '';
    return '<svg class="bicon" aria-hidden="true" focusable="false" width="' . $size . '" height="' . $size . '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' . $p[$name] . '</svg>';
}

/** A photo from the ministry's gallery for page headers without their own photo (stable per page). */
function fallback_photo(string $key): ?int
{
    static $ids = null;
    $ids ??= array_map('intval', array_column(all('SELECT p.media_id FROM photos p JOIN albums a ON a.id = p.album_id AND a.is_published = 1 JOIN media m ON m.id = p.media_id WHERE m.width >= m.height ORDER BY a.sort_order, p.sort_order, p.id'), 'media_id'));
    if (!$ids) return null;
    return $ids[crc32($key) % count($ids)];
}

/** "Label: value" lines into pairs. */
function label_lines(?string $text): array
{
    $out = [];
    foreach (array_filter(array_map('trim', preg_split('/\R/', (string)$text) ?: [])) as $line) {
        [$k, $v] = array_pad(array_map('trim', explode(':', $line, 2)), 2, '');
        $out[] = [$k, $v];
    }
    return $out;
}

/** Header menu: About Us, Outreach, Contact Us (Give is the button beside it). */
function main_menu(): array
{
    $items = [];
    if (feature('about')) $items[] = ['/about', 'About Us'];
    if (page_published('outreach')) $items[] = ['/outreach', 'Outreach'];
    if (form_enabled('contact')) $items[] = ['/contact', 'Contact Us'];
    return $items;
}
