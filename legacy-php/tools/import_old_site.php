<?php
/**
 * Imports the REAL content of thegatheringcof.org (captured 3 Nov 2026) into the CMS database.
 * Text is copied from the live pages (Home, About, Outreach, Contact Us). Images come from
 * assets_originals/ (downloaded from the live site's media library, theme demo images excluded).
 * Run once on an empty, migrated database:  php tools/import_old_site.php
 * Nothing here is invented: items the live site does not state are left empty and flagged in
 * docs/MIGRATION_REPORT.md.
 */
if (PHP_SAPI !== 'cli') exit;
require dirname(__DIR__) . '/gathering_app/bootstrap.php';
$src = dirname(__DIR__) . '/assets_originals';

if (scalar('SELECT COUNT(*) FROM events') || scalar('SELECT COUNT(*) FROM blocks')) {
    fwrite(STDERR, "Database already has content. Import into a fresh database.\n");
    exit(1);
}

$img = function (string $file, string $alt) use ($src): int {
    $r = media_store("$src/$file", $file, $alt, 'image');
    if (isset($r['error'])) throw new RuntimeException("$file: {$r['error']}");
    return $r['id'];
};

/* ---------- logos ---------- */
$logo = $img('THE-GATHERING.png', 'The Gathering');
$fav = $img('cropped-THE-GATHERING-e1763114568574.jpg', 'The Gathering');
$cofwo = $img('cofwo-logo-white.png', 'The Chariot of Fire World Outreach');

/* ---------- photos (alt text describes only what is visible) ---------- */
$albums = [
    ['the-gathering-2025', 'The Gathering 2025', 2025, 10, [
        ['20251025_141148.jpg', 'Worshippers lifting their hands in praise in a packed hall'],
        ['20251025_140350.jpg', 'A full conference hall during a prayer session'],
        ['20251025_161245.jpg', 'Worshippers standing in prayer across the hall'],
        ['20251025_143756.jpg', 'People lying in prayer before the stage during ministry'],
        ['20251025_141113.jpg', 'Attendees seated and standing during worship'],
        ['20251025_161318.jpg', 'Wide view of the congregation in prayer'],
        ['20251025_140920.jpg', 'Ushers and worshippers praying together in the hall'],
        ['20251025_141155.jpg', 'Worshippers in prayer near the front of the hall'],
        ['20251025_141217.jpg', 'Attendees seated in the hall during the service'],
        ['20251025_161511.jpg', 'The hall filled with worshippers'],
        ['20251025_140351.jpg', 'Crowd gathered for prayer in the main hall'],
    ]],
    ['worship-and-praise', 'Worship & Praise', null, 20, [
        ['swi-5787-scaled-1.jpg', 'Worshippers raising their hands in joyful praise'],
        ['swi-5791-scaled-1.jpg', 'Women worshipping with hands lifted'],
        ['swi-5706-scaled-1.jpg', 'Congregation praying with hands outstretched'],
        ['swi-5750-scaled-1.jpg', 'Worshippers singing during the service'],
        ['about-second.webp', 'A minister speaking to a full hall'],
        ['midcrowd.jpg', 'Attendees in prayer during a session'],
    ]],
    ['prayer-and-ministry', 'Prayer & Ministry', null, 30, [
        ['TG1.jpg', 'Ministers worshipping with hands raised'],
        ['TG2.jpg', 'Ministers standing in worship'],
        ['TG3.jpg', 'A minister preaching from the pulpit'],
        ['TG6.jpg', 'Attendees bowing in prayer'],
        ['TG7.jpg', 'A worshipper praying with hands together'],
        ['TG9.jpg', 'A woman worshipping with both hands raised'],
        ['TG10.jpg', 'A minister praying with attendees'],
        ['TG11.jpg', 'Attendees in quiet prayer'],
        ['TG12.jpg', 'Attendees listening during a session'],
        ['TG13.jpg', 'Attendees standing in prayer'],
        ['TG4.jpg', 'A minister preaching with a microphone'],
        ['TG5.jpg', 'A minister preaching with a microphone'],
    ]],
];
$photoIds = [];
foreach ($albums as [$slug, $title, $year, $order, $files]) {
    q('INSERT INTO albums (slug, title, year, is_published, sort_order) VALUES (?,?,?,1,?)', [$slug, $title, $year, $order]);
    $aid = last_id();
    foreach ($files as $i => [$f, $alt]) {
        $mid = $img($f, $alt);
        $photoIds[$f] = $mid;
        q('INSERT INTO photos (album_id, media_id, alt, sort_order) VALUES (?,?,?,?)', [$aid, $mid, $alt, ($i + 1) * 10]);
    }
}

/* ---------- event ---------- */
q('INSERT INTO events (name, theme, starts_at, ends_at, venue_name, summary, hero_media_id, registration_open, is_current) VALUES (?,?,?,?,?,?,?,1,1)', [
    'The Gathering 2026', 'Breaking Territories', '2026-11-26 00:00:00', '2026-11-28 23:59:00', 'Oyo State, Nigeria',
    '<p>In 2026, under the theme “Breaking Territories,” we believe God is calling us to expand our impact, spiritually and practically, establishing a permanent foundation for future generations.</p>',
    $photoIds['swi-5787-scaled-1.jpg'],
]);

/* ---------- pages ---------- */
$aboutBody = <<<HTML
<h2>Who we are</h2>
<p>The Gathering International Christian Network is an annual interdenominational prayer conference committed to spiritual revival and community transformation.</p>
<p>Incorporated in the United Kingdom, Registration No: 15843980. An arm of The Chariot of Fire World Outreach (COFWO). Convener: Yomi Adeboye.</p>
<p><strong>Our mission is simple:</strong> To inspire revival, impart truth, and empower communities, spiritually and practically.</p>
<blockquote>We believe prayer must be accompanied by compassion. Worship must be followed by action. Faith must produce impact.</blockquote>
<h2>Our vision</h2>
<p>“Breaking Territories” is not only our 2026 theme, it is our mission. We envision:</p>
<ul>
<li>Expanding spiritual revival across communities</li>
<li>Providing structured medical outreach to underserved families</li>
<li>Feeding vulnerable households through Heart of Compassion</li>
<li>Developing a permanent Gathering Land for long-term ministry</li>
<li>Building infrastructure that supports future impact</li>
</ul>
<p>The Gathering Land in Ido LGA (2.66 acres) represents a long term investment in sustainable ministry and outreach. We are building not just for one year, but for generations.</p>
HTML;
q("UPDATE pages SET title=?, intro=?, body=?, hero_media_id=?, meta_title='About', meta_description=?, is_published=1 WHERE slug='about'", [
    'About The Gathering',
    'It is an annual call to prayer, revival, and transformation, bringing together ministers, families, and communities in pursuit of spiritual awakening and tangible compassion.',
    $aboutBody, $photoIds['about-second.webp'],
    'The Gathering International Christian Network is an annual interdenominational prayer conference committed to spiritual revival and community transformation.',
]);
q("UPDATE pages SET title=?, intro=?, body=?, hero_media_id=?, meta_title='Outreach', meta_description=?, is_published=1 WHERE slug='outreach'", [
    'Fuel the mission',
    'This is not just a conference. It is a strategic mobilization. Your support directly funds the front-line outreach programs and medical aid initiatives.',
    '<h2>Infrastructure development</h2><p>To ensure that The Gathering can operate effectively and sustainably, several key infrastructure developments are planned for the land.</p>',
    $photoIds['20251025_141113.jpg'],
    'The Gathering 2026 outreach: spiritual outreach, welfare outreach, medical aid for up to 5,000 people, and the 2.66-acre Gathering Land in Ido LGA, Oyo State.',
]);
q("UPDATE pages SET title=?, intro=?, hero_media_id=?, meta_title='Give', meta_description=?, is_published=1 WHERE slug='give'", [
    'Give & partner',
    'Your support directly funds the front-line outreach programs and medical aid initiatives.',
    $photoIds['20251025_161245.jpg'],
    'Partner with The Gathering: support medical outreach, compassion feeding and the permanent Gathering Land in Oyo State, Nigeria.',
]);

/* ---------- blocks ---------- */
$blocks = [
    'stats' => [['5,000+', 'Lives touched yearly'], ['13', 'Medical centre partners'], ['20,000+', 'Individuals blessed']],
    'pillars' => [
        ['Prayer & Worship', 'Uniting believers in worship, prayer, healing, and spiritual renewal, and experience deeper growth.', 'prayer'],
        ['Medical Outreach', 'Providing free screenings, and essential medications to underserved communities.', 'medical'],
        ['Compassion Outreach', 'Delivering food support and practical assistance to families facing hardship.', 'compassion'],
        ['Community Transformation', 'Strengthening communities through sustainable outreach, unity, and long-term ministry initiatives.', 'community'],
    ],
    'challenges' => [
        ['Limited access to healthcare', '', 'medical'], ['Financial hardship and food insecurity', '', 'compassion'],
        ['Spiritual and emotional burdens', '', 'prayer'], ['Inadequate community infrastructure', '', 'home'],
    ],
    'activities' => [
        ['Worship & Prayer Sessions', 'An atmosphere of intercession, revival, healing, and restoration.', 'prayer'],
        ['Heart of Compassion Outreach', 'Food distribution and practical support for vulnerable families.', 'compassion'],
        ['Medical Outreach', 'Basic health checks, medication distribution, and preventive care.', 'medical'],
        ['Family & Community Engagement', 'Encouraging unity, faith, and long-term transformation.', 'community'],
    ],
    'programmes' => [
        ['Spiritual Outreach', "Disseminating the message of hope through large-scale events and personalized ministry teams. The Gathering is an annual interdenominational prayer conference committed to spiritual revival and tangible community transformation.", 'prayer'],
        ['Welfare Outreach', 'Food distribution and practical support for vulnerable families.', 'compassion'],
        ['The Gathering Land', 'In order to expand the impact of The Gathering and create a permanent foundation for future ministry and outreach, land has been secured in Ido Local Government Area, Oyo State, Nigeria. The land spans approximately 2.66 Acres (10,783 m²).', 'land'],
        ['Medical Aid', 'As part of The Gathering 2026, a dedicated Medical Outreach Programme will provide free health screening, consultation, and basic medication distribution to support community well-being. Our goal is to reach up to 5,000 people during the outreach programme.', 'medical'],
    ],
    'infrastructure' => [
        ['Solar Power Installation', 'Reliable energy to support lighting, sound systems, and outreach activities.', 'solar'],
        ['Perimeter Fencing', 'Security and protection of the land and equipment.', 'fence'],
        ['Seating Infrastructure', 'Chairs and equipment to accommodate conference attendees.', 'seat'],
        ['Street Lighting', 'Improved safety and visibility for evening programmes.', 'light'],
        ['Worship Instruments & Sound Equipment', 'Permanent equipment to support worship and ministry sessions.', 'sound'],
        ['Guest Accommodation', 'Basic guest house facilities to support visiting ministers and volunteers.', 'home'],
    ],
    'goals' => [
        ['Spiritual impact', "Three-day interdenominational prayer conference\nWorship, healing, and revival gatherings\nMinistry from invited speakers and ministers", 'prayer'],
        ['Community impact', "Medical outreach reaching up to 5,000 people\nCompassion feeding support for vulnerable families\nCommunity engagement and outreach initiatives", 'community'],
        ['Infrastructure development', "Progress toward completing land payments\nInstallation of essential infrastructure\nEstablishing a permanent Gathering venue", 'land'],
    ],
];
foreach ($blocks as $grp => $items) {
    foreach ($items as $i => $b) {
        q('INSERT INTO blocks (grp, title, body, icon, sort_order) VALUES (?,?,?,?,?)', [$grp, $b[0], $b[1] ?: null, $b[2] ?? null, ($i + 1) * 10]);
    }
}

/* ---------- settings ---------- */
$settings = [
    'site_name' => 'The Gathering',
    'site_tagline' => 'Annual interdenominational prayer conference',
    'logo_media_id' => (string)$logo, 'logo_light_media_id' => (string)$logo, 'favicon_media_id' => (string)$fav,
    'og_media_id' => (string)$photoIds['swi-5787-scaled-1.jpg'], 'hero_media_id' => (string)$photoIds['swi-5787-scaled-1.jpg'],
    'parent_logo_media_id' => (string)$cofwo, 'parent_org_name' => 'The Chariot of Fire World Outreach (COFWO)',
    'brand_primary' => '#0b0b0c', 'brand_accent' => '#ffcc00',
    'hero_summary' => 'The Gathering is an annual interdenominational prayer conference committed to spiritual revival and tangible community transformation.',
    'marquee_words' => 'Prayer, Revival, Compassion, Impact',
    'welcome_heading' => 'A Movement Beyond an Event',
    'welcome_body' => '<p>The Gathering is more than a conference. It is an annual call to prayer, revival, and transformation, bringing together ministers, families, and communities in pursuit of spiritual awakening and tangible compassion.</p><p>Each year, lives are touched through worship, the Word, healing prayer, community feeding, and medical outreach.</p><p>In 2026, under the theme “Breaking Territories,” we believe God is calling us to expand our impact, spiritually and practically, establishing a permanent foundation for future generations.</p>',
    'mission_lines' => "Prayer must be accompanied by compassion.\nWorship must be followed by action.\nFaith must produce impact.",
    'why_heading' => 'Why The Gathering Matters',
    'why_body' => "Across many communities in Nigeria, families face ongoing challenges. For many, opportunities for medical screening, basic medications, and community support are rare.\n\nThe Gathering responds to both spiritual and practical needs, creating an atmosphere of prayer while delivering tangible outreach.",
    'land_heading' => 'The Gathering Land',
    'land_body' => 'In order to expand the impact of The Gathering and create a permanent foundation for future ministry and outreach, land has been secured in Ido Local Government Area, Oyo State, Nigeria. We are building not just for one year, but for generations.',
    'land_figure' => '2.66 acres', 'land_figure_label' => 'Approximately 10,783 m² in Ido Local Government Area, Oyo State, Nigeria',
    'partner_heading' => 'Be part of the vision',
    'partner_body' => 'Join a global network of believers and professionals dedicated to changing the world through strategic ministry.',
    'contact_intro' => 'Whether you seek prayer, guidance, or simply wish to learn more about our community, our doors and hearts are always open.',
    'contact_email' => 'thegatheringcof@gmail.com',
    'postal_address' => 'Purley Way, Croydon, London CR0 4RG',
    'social_youtube' => 'https://www.youtube.com/@thegatheringcn',
    'footer_text' => 'An annual interdenominational prayer conference committed to spiritual revival and community transformation. A Movement of Prayer, Compassion, Impact.',
    'org_legal' => "The Gathering International Christian Network, incorporated in the United Kingdom, Registration No: 15843980.\nAn arm of The Chariot of Fire World Outreach (COFWO). Convener: Yomi Adeboye.",
    'meta_description' => 'The Gathering 2026: Breaking Territories. An annual interdenominational prayer conference committed to spiritual revival and community transformation. 26–28 November 2026, Oyo State, Nigeria.',
    'notify_default' => 'thegatheringcof@gmail.com',
    'form_registration_enabled' => '1', 'form_contact_enabled' => '1', 'form_partnership_enabled' => '1',
];
foreach ($settings as $k => $v) setting_save($k, $v);

/* ---------- redirects for old URLs that moved ---------- */
foreach ([['/contact-us', '/contact'], ['/home', '/']] as [$from, $to]) {
    q('INSERT INTO redirects (from_path, to_path, code) VALUES (?,?,301)', [$from, $to]);
}
echo "Imported: 3 albums, " . count($photoIds) . " photos, 1 event, 4 pages, " . scalar('SELECT COUNT(*) FROM blocks') . " blocks, settings, 2 redirects.\n";

/* ---------- privacy policy (approved by the ministry 3 Nov 2026) ---------- */
q("UPDATE pages SET title=?, intro=?, body=?, meta_title=?, meta_description=?, is_published=1 WHERE slug='privacy'", [
    'Privacy policy', 'How The Gathering collects, uses and protects your personal information.',
    clean_html(file_get_contents(__DIR__ . '/privacy_policy.html')), 'Privacy policy',
    'How The Gathering International Christian Network collects, uses and protects personal information submitted through this website.',
]);
q("INSERT INTO redirects (from_path, to_path, code) VALUES ('/privacy-policy', '/privacy', 301)");
