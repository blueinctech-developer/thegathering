<?php
/**
 * Adds the extra content from the ministry's earlier build (https://gathering-2026.vibepreview.app,
 * captured 3 Nov 2026) and its two official flyers. Run AFTER tools/import_old_site.php.
 * Where the two sources disagree, the ministry's official flyer wins (27–29 November;
 * "The Move of the Spirit; Breaking Territories"). Placeholder sentences were not copied.
 */
if (PHP_SAPI !== 'cli') exit;
require dirname(__DIR__) . '/gathering_app/bootstrap.php';
$dir = dirname(__DIR__) . '/assets_originals/preview_site';
if (scalar("SELECT COUNT(*) FROM blocks WHERE grp = 'bus_stops'")) { fwrite(STDERR, "Already imported.\n"); exit(1); }

$img = function (string $f, string $alt) use ($dir): int {
    $r = media_store("$dir/$f", $f, $alt, 'image');
    if (isset($r['error'])) throw new RuntimeException($r['error']);
    return $r['id'];
};
$lineup = $img('speakers-lineup.jpg', 'The Gathering 2026 flyer: The Move of the Spirit; Breaking Territories, 27 to 29 November, with the ministers lineup');
$bus = $img('join-the-bus.jpg', 'Join the bus flyer: free buses to and from The Gathering, 27 to 29 November at 8 AM');

/* ---------- event (per the official flyer) ---------- */
q("UPDATE events SET theme = ?, theme_scripture = ?, starts_at = ?, ends_at = ?, venue_name = ?, venue_address = ?, map_query = ?, flyer_media_id = ?, summary = ? WHERE is_current = 1", [
    'The Move of the Spirit', 'Breaking Territories', '2026-11-27 00:00:00', '2026-11-29 23:59:00',
    'The Gathering International Christian Centre, Ibadan',
    'Mekun, Elebu Axis, Alao Akala Expressway, New Garage, Ibadan, Oyo State, Nigeria',
    'Elebu, Alao Akala Expressway, Ibadan, Oyo State, Nigeria', $lineup,
    '<p>The Gathering 2026 is an annual interdenominational prayer and compassion conference under the theme “The Move of the Spirit; Breaking Territories”. Three days of worship, the Word, healing prayer, medical outreach and community feeding, reaching up to 5,000 people.</p>',
]);
$eventId = (int)scalar('SELECT id FROM events WHERE is_current = 1');

/* ---------- ministers (names exactly as on the official flyer) ---------- */
$ministers = [
    ['Pst Yomi Adeboye', 'Convener', 1], ['Pst Biola Adeboye', 'Co-Convener', 1],
    ['Rev Samson Ajetomobi', 'Minister', 0], ['Bishop Henry Praise', 'Minister', 0], ['Pst Odekunle Epaphras', 'Minister', 0],
    ['Pst Biodun Oladele', 'Minister', 0], ['Pst Cylas Omoloye', 'Minister', 0], ['Pro Kayode Asawe', 'Minister', 0],
    ['Min Tomiyin', 'Worship Minister', 0], ['Min Mamizo', 'Worship Minister', 0],
];
foreach ($ministers as $i => [$name, $role, $feat]) {
    q('INSERT INTO speakers (slug, name, role_title, is_featured, is_published, sort_order) VALUES (?,?,?,?,1,?)', [unique_slug('speakers', $name), $name, $role, $feat, ($i + 1) * 10]);
}
$yomi = (int)scalar("SELECT id FROM speakers WHERE name = 'Pst Yomi Adeboye'");

/* ---------- programme overview (no times published yet) ---------- */
$days = [
    ['Day 1', '2026-11-27', [['Opening worship & prayer', $yomi], ['Evening revival service', null]]],
    ['Day 2', '2026-11-28', [['Teaching & ministry sessions', null], ['Medical outreach', null], ['Compassion feeding', null]]],
    ['Day 3', '2026-11-29', [['Healing service', null], ['Closing commission', null]]],
];
foreach ($days as $d => [$label, $date, $sessions]) {
    q('INSERT INTO schedule_days (event_id, label, day_date, sort_order) VALUES (?,?,?,?)', [$eventId, $label, $date, $d + 1]);
    $dayId = last_id();
    foreach ($sessions as $s => [$title, $speaker]) {
        q('INSERT INTO schedule_sessions (day_id, title, speaker_id, sort_order) VALUES (?,?,?,?)', [$dayId, $title, null, ($s + 1) * 10]);
    }
}

/* ---------- video ---------- */
q("INSERT INTO messages (slug, title, kind, url, speaker_name, is_published) VALUES (?,?,?,?,?,1)", [
    'the-gathering-2026-on-the-gathering-land', 'The Gathering this year will take place on the Gathering land, Ibadan, Oyo State, Nigeria',
    'video', 'https://www.youtube.com/watch?v=PnToowvbqxA', 'The Gathering',
]);

/* ---------- blocks ---------- */
$blocks = [
    'values' => [['Inspire', 'Revival through prayer and worship.', 'spark'], ['Impact', 'Compassion that transforms communities.', 'heart'], ['Empower', 'Equipping lives for lasting change.', 'community']],
    'highlights' => [
        ['Three-day conference', '27–29 November 2026, Ibadan, Oyo State, Nigeria.', 'calendar'],
        ['Up to 5,000 people served', 'Through medical and compassion outreach.', 'community'],
        ['Medical outreach', 'Blood pressure, diabetes and eye screening, and essential medication.', 'medical'],
        ['Heart of Compassion', 'Community feeding for vulnerable families.', 'compassion'],
        ['The Gathering Land', 'Permanent land development in Ido LGA, Oyo State.', 'land'],
        ['Interdenominational', 'Uniting ministers, families, and communities in prayer.', 'globe'],
    ],
    'medical_services' => [['Blood pressure screening'], ['Diabetes screening'], ['Basic medical consultation'], ['Eye care support'], ['Distribution of essential medications'], ['Health education & preventive care']],
    'land_vision' => [['Host future Gathering conferences', '', 'calendar'], ['Provide space for outreach', '', 'community'], ['Support medical and compassion initiatives', '', 'medical'], ['Enable long-term ministry growth and training', '', 'spark']],
    'bus_stops' => [['Elebu Junction', 'Elebu axis'], ['Apata', 'Wema Bank'], ['New Garage', 'Transit hub'], ['Challenge', 'Opposite Glo'], ['Bodija', 'Bodija area'], ['Mobile', 'Petrol station'], ['University of Ibadan', 'UI gates & area']],
    'partner_tiers' => [
        ['Prayer Partner', 'Standing with The Gathering through prayer, intercession, and spiritual support.', 'prayer'],
        ['Support Partner', 'Contributing financially toward outreach, infrastructure, and conference operations.', 'heart'],
        ['Covenant Partner', 'Partners who make a significant commitment toward the vision at a leadership giving level.', 'shield'],
        ['Territory Builder', 'Individuals or organisations who sponsor specific infrastructure or development projects connected to the Gathering Land.', 'land'],
        ['Corporate / Ministry Sponsor', 'Churches, organisations, and businesses who partner in supporting specific outreach or development streams.', 'globe'],
    ],
    'funding_streams' => [
        ['Territory Foundation', "NGN: ₦18,500,000\nGBP: £11,563\nUSD: \$15,417", 'land'],
        ['Worship & Sound Infrastructure', "NGN: ₦30,000,000\nGBP: £18,750\nUSD: \$25,000", 'sound'],
        ['Power & Light Development', "NGN: ₦25,000,000\nGBP: £15,625\nUSD: \$20,833", 'solar'],
        ['Safety & Security', "NGN: ₦15,000,000\nGBP: £9,375\nUSD: \$12,500", 'fence'],
        ['Comfort & Crowd Support', "NGN: ₦12,500,000\nGBP: £7,813\nUSD: \$10,417", 'seat'],
        ['Compassion & Medical Outreach', "NGN: ₦10,000,000\nGBP: £6,250\nUSD: \$8,333", 'medical'],
        ['Hospitality & Programme Operations', "NGN: ₦20,000,000\nGBP: £12,500\nUSD: \$16,667", 'home'],
        ['Publicity & Programme Growth', "NGN: ₦2,000,000\nGBP: £1,250\nUSD: \$1,667", 'megaphone'],
    ],
    'governance' => [['Integrity', '', 'shield'], ['Accountability', '', 'community'], ['Responsible stewardship', '', 'heart']],
];
foreach ($blocks as $grp => $items) {
    foreach ($items as $i => $b) {
        q('INSERT INTO blocks (grp, title, body, icon, sort_order) VALUES (?,?,?,?,?)', [$grp, $b[0], ($b[1] ?? '') ?: null, $b[2] ?? null, ($i + 1) * 10]);
    }
}

/* ---------- About: convener + governance ---------- */
$about = (string)scalar("SELECT body FROM pages WHERE slug = 'about'");
$about .= '<h2>The convener</h2><p>Pastor Yomi Adeboye is the Convener of The Gathering International Christian Network and leads The Chariot of Fire World Outreach (COFWO).</p>'
    . '<h2>Governance & transparency</h2><p>The Gathering is committed to integrity, accountability, and responsible stewardship of all resources.</p>'
    . '<ul><li>Financial oversight is provided by the leadership team.</li><li>Major expenditures are reviewed and approved internally.</li><li>Partners receive updates and impact reports following the event.</li><li>Documentation supporting key projects is maintained.</li></ul>';
q("UPDATE pages SET body = ? WHERE slug = 'about'", [clean_html($about)]);

/* ---------- Venue page (published now that the address is known) ---------- */
q("UPDATE pages SET title = 'Venue & travel', intro = ?, meta_title = 'Venue & travel', meta_description = ?, is_published = 1 WHERE slug = 'venue'", [
    'The Gathering 2026 takes place at The Gathering International Christian Centre, Ibadan, with free buses to and fro every day.',
    'Venue, directions and free bus pick-up points for The Gathering 2026, 27–29 November, Ibadan, Oyo State, Nigeria.',
]);

/* ---------- settings ---------- */
foreach ([
    'hero_summary' => 'Annual interdenominational prayer and compassion conference. Reaching up to 5,000 people through medical and compassion outreach.',
    'marquee_words' => '',
    'meta_description' => 'The Gathering 2026: The Move of the Spirit; Breaking Territories. 27–29 November 2026, Ibadan, Oyo State, Nigeria. An annual interdenominational prayer and compassion conference.',
    'contact_phone' => '+234 708 784 7372',
    'parent_org_url' => '', // www.thecofwo.org has an expired SSL certificate (3 Nov 2026); add it back in Settings once renewed
    'programme_note' => 'The full programme will be confirmed and updated by the ministry team.',
    'bus_heading' => 'Join the bus: free to and fro',
    'bus_body' => 'To make attending The Gathering seamless and accessible for everyone, complimentary buses will collect attendees each morning from designated pick-up locations across Ibadan.',
    'bus_time' => '8:00 AM daily, 27–29 November',
    'bus_fee' => '100% free, to and fro',
    'bus_dropoff' => 'The Gathering International Christian Network, Mekun, Elebu Axis, Alao Akala Expressway, New Garage, Ibadan',
    'bus_media_id' => (string)$bus,
    'land_body' => 'Land has been secured in Ido Local Government Area, Oyo State, Nigeria. 1 acre has been secured within a 2.66-acre site as the first phase. Initial payments have been made and development has begun, with the orange tree stands protected and the water tank stand preserved. This investment is a foundation for future generations of impact.',
    'land_figure_label' => 'Total site in Ido LGA, Oyo State. 1 acre secured so far; development has begun.',
    'funding_total' => "NGN: ₦133,000,000\nGBP: £83,125\nUSD: \$110,833",
    'funding_note' => 'Exchange rates are planning estimates. All giving is stewarded with integrity and accountability.',
    'partnership_docs_url' => 'https://drive.google.com/drive/folders/17andQG8HPetyNSHIRYT59MVy0o8OkLdK',
    'partner_heading' => 'Stand with us in The Move of the Spirit',
    'partner_body' => 'Support prayer, compassion, and community impact in Nigeria.',
] as $k => $v) setting_save($k, $v);

echo "Preview content imported: event updated, " . count($ministers) . " ministers, 3 programme days, 1 video, "
    . scalar("SELECT COUNT(*) FROM blocks WHERE grp IN ('values','highlights','medical_services','land_vision','bus_stops','partner_tiers','funding_streams','governance')") . " blocks, 2 flyers.\n";
