<?php
declare(strict_types=1);

/**
 * Content types managed by the generic admin editor.
 * Field: [name, label, type, options]
 * types: text, textarea, richtext, slug, image, document, date, datetime, time, number, checkbox, select, url, email
 */
function admin_resources(): array
{
    static $r = null;
    if ($r !== null) return $r;
    $speakerOpts = fn() => ['' => 'None'] + array_column(all('SELECT id, name FROM speakers ORDER BY name'), 'name', 'id');
    $r = [
        'events' => [
            'table' => 'events', 'title' => 'Events', 'singular' => 'event', 'order' => 'is_current DESC, starts_at DESC',
            'help' => 'The event marked "Current event" drives the homepage, countdown, registration and schedule.',
            'list' => ['name' => 'Event', 'starts_at' => 'Starts', 'venue_name' => 'Venue', 'is_current' => 'Current', 'registration_open' => 'Registration'],
            'fields' => [
                ['name', 'Event name', 'text', ['required' => true, 'help' => 'e.g. the name and year exactly as it should appear.']],
                ['theme', 'Theme', 'text'],
                ['theme_scripture', 'Theme scripture', 'text', ['help' => 'Optional. Shown under the theme on the homepage.']],
                ['starts_at', 'Starts', 'datetime', ['help' => 'Used for the countdown. Leave blank until the date is confirmed.']],
                ['ends_at', 'Ends', 'datetime'],
                ['venue_name', 'Venue name', 'text'],
                ['venue_address', 'Venue address', 'text'],
                ['map_query', 'Map location', 'text', ['help' => 'What to search in Google Maps, e.g. the venue name and city, or "latitude,longitude".']],
                ['summary', 'Event description', 'richtext'],
                ['hero_media_id', 'Homepage background photo', 'image', ['help' => 'A wide landscape photo works best (at least 1600px wide).']],
                ['flyer_media_id', 'Event flyer', 'image', ['help' => 'Shown on the registration page and used when the site is shared on WhatsApp/Facebook.']],
                ['programme_media_id', 'Programme (PDF)', 'document'],
                ['is_current', 'This is the current event', 'checkbox'],
                ['registration_open', 'Registration is open', 'checkbox'],
                ['capacity', 'Capacity (optional)', 'number', ['help' => 'Total number of people. Registration closes automatically when reached. Leave blank for no limit.']],
            ],
            'after_save' => function (int $id, array $data) {
                if (!empty($data['is_current'])) q('UPDATE events SET is_current = 0 WHERE id <> ?', [$id]);
            },
        ],
        'pages' => [
            'table' => 'pages', 'title' => 'Pages', 'singular' => 'page', 'order' => 'is_system DESC, title',
            'help' => 'Built-in pages (About, Venue, Give, Volunteer, Privacy) appear in the menu once published. You can also add extra pages.',
            'list' => ['title' => 'Title', 'slug' => 'Address', 'is_published' => 'Published', 'updated_at' => 'Updated'],
            'no_delete_if' => fn($row) => (int)$row['is_system'] === 1,
            'fields' => [
                ['title', 'Title', 'text', ['required' => true]],
                ['slug', 'Web address', 'slug', ['from' => 'title', 'lock_if_system' => true, 'help' => 'The part after the domain, e.g. "our-history" → /our-history']],
                ['intro', 'Introduction', 'textarea', ['help' => 'One or two sentences shown at the top of the page.']],
                ['body', 'Page content', 'richtext'],
                ['hero_media_id', 'Header photo (optional)', 'image'],
                ['meta_title', 'Search engine title (optional)', 'text', ['help' => 'Leave blank to use the page title.']],
                ['meta_description', 'Search engine description', 'textarea', ['help' => 'About 150 characters. Shown in Google results and link previews.']],
                ['is_published', 'Published (visible on the website)', 'checkbox'],
            ],
            'before_save' => function (array $data, ?int $id) {
                $reserved = ['admin', 'speakers', 'schedule', 'register', 'media', 'gallery', 'news', 'faqs', 'contact', 'prayer',
                    'testimonies', 'forms', 'uploads', 'assets', 'cron', 'sitemap', 'robots', 'index'];
                $isSystem = $id && (int)scalar('SELECT is_system FROM pages WHERE id = ?', [$id]) === 1;
                if (!$isSystem && isset($data['slug']) && in_array($data['slug'], array_merge($reserved, ['about', 'venue', 'give', 'volunteer', 'privacy']), true)) {
                    throw new InvalidArgumentException('The web address "/' . $data['slug'] . '" is already used by the website. Please choose another.');
                }
                return $data;
            },
            'public_url' => fn($row) => '/' . $row['slug'],
        ],
        'speakers' => [
            'table' => 'speakers', 'title' => 'Speakers', 'singular' => 'speaker', 'order' => 'sort_order, name', 'sortable' => true, 'search' => ['name', 'ministry'],
            'list' => ['photo_media_id' => '', 'name' => 'Name', 'role_title' => 'Title', 'is_featured' => 'Featured', 'is_published' => 'Visible'],
            'fields' => [
                ['name', 'Full name (as it should appear)', 'text', ['required' => true]],
                ['slug', 'Web address', 'slug', ['from' => 'name']],
                ['role_title', 'Title / role', 'text', ['help' => 'e.g. Senior Pastor']],
                ['ministry', 'Church or ministry', 'text'],
                ['photo_media_id', 'Photo', 'image', ['help' => 'Portrait photo, ideally 800×1000px or larger.']],
                ['bio', 'Biography', 'richtext'],
                ['is_featured', 'Feature on the homepage', 'checkbox'],
                ['is_published', 'Show on the website', 'checkbox', ['default' => 1]],
            ],
            'public_url' => fn($row) => '/speakers/' . $row['slug'],
        ],
        'days' => [
            'table' => 'schedule_days', 'title' => 'Programme days', 'singular' => 'programme day', 'order' => 'sort_order, day_date', 'hidden' => true, 'back' => '/admin/schedule',
            'fields' => [
                ['event_id', 'Event', 'select', ['required' => true, 'options' => fn() => array_column(all('SELECT id, name FROM events ORDER BY starts_at DESC'), 'name', 'id')]],
                ['label', 'Day label', 'text', ['required' => true, 'help' => 'e.g. "Day 1" or "Friday"']],
                ['day_date', 'Date', 'date'],
                ['sort_order', 'Order', 'number'],
            ],
        ],
        'sessions' => [
            'table' => 'schedule_sessions', 'title' => 'Sessions', 'singular' => 'session', 'order' => 'sort_order, starts_at', 'hidden' => true, 'back' => '/admin/schedule',
            'fields' => [
                ['day_id', 'Day', 'select', ['required' => true, 'options' => fn() => array_column(all('SELECT d.id, CONCAT(e.name, ": ", d.label) AS l FROM schedule_days d JOIN events e ON e.id = d.event_id ORDER BY e.starts_at DESC, d.sort_order'), 'l', 'id')]],
                ['title', 'Session title', 'text', ['required' => true]],
                ['starts_at', 'Start time', 'time'],
                ['ends_at', 'End time', 'time'],
                ['speaker_id', 'Speaker', 'select', ['options' => $speakerOpts]],
                ['location', 'Room / location', 'text'],
                ['description', 'Short description', 'textarea'],
                ['sort_order', 'Order (if times are equal)', 'number'],
            ],
        ],
        'albums' => [
            'table' => 'albums', 'title' => 'Gallery', 'singular' => 'album', 'order' => 'year DESC, sort_order, id DESC',
            'help' => 'Create an album, save it, then upload photos into it.',
            'list' => ['title' => 'Album', 'year' => 'Year', 'photo_count' => 'Photos', 'is_published' => 'Visible'],
            'list_sql' => 'SELECT a.*, (SELECT COUNT(*) FROM photos WHERE album_id = a.id) AS photo_count FROM albums a',
            'fields' => [
                ['title', 'Album title', 'text', ['required' => true]],
                ['slug', 'Web address', 'slug', ['from' => 'title']],
                ['year', 'Year', 'number'],
                ['description', 'Description', 'textarea'],
                ['is_published', 'Show on the website', 'checkbox', ['default' => 1]],
                ['sort_order', 'Order within the year', 'number'],
            ],
            'after_form' => 'admin_album_photos',
            'public_url' => fn($row) => '/gallery/' . $row['slug'],
        ],
        'messages' => [
            'table' => 'messages', 'title' => 'Media & sermons', 'singular' => 'message', 'order' => 'recorded_on DESC, id DESC', 'search' => ['title', 'speaker_name'],
            'help' => 'Add YouTube, Facebook, Vimeo, SoundCloud or podcast links. The livestream link itself is in Settings.',
            'list' => ['title' => 'Title', 'speaker_name' => 'Speaker', 'recorded_on' => 'Date', 'is_published' => 'Visible'],
            'fields' => [
                ['title', 'Title', 'text', ['required' => true]],
                ['slug', 'Short name', 'slug', ['from' => 'title']],
                ['kind', 'Type', 'select', ['options' => ['video' => 'Video', 'audio' => 'Audio']]],
                ['url', 'Link (YouTube, Facebook, audio…)', 'url', ['required' => true]],
                ['speaker_name', 'Speaker', 'text'],
                ['recorded_on', 'Date', 'date'],
                ['description', 'Description', 'textarea'],
                ['thumb_media_id', 'Thumbnail (optional, YouTube thumbnails are automatic)', 'image'],
                ['is_published', 'Show on the website', 'checkbox', ['default' => 1]],
            ],
        ],
        'posts' => [
            'table' => 'posts', 'title' => 'News', 'singular' => 'news post', 'order' => 'COALESCE(published_at, created_at) DESC', 'search' => ['title'],
            'list' => ['title' => 'Title', 'status' => 'Status', 'published_at' => 'Publish date'],
            'fields' => [
                ['title', 'Headline', 'text', ['required' => true]],
                ['slug', 'Web address', 'slug', ['from' => 'title']],
                ['excerpt', 'Summary', 'textarea', ['help' => 'One or two sentences for the news list and link previews.']],
                ['body', 'Article', 'richtext'],
                ['cover_media_id', 'Cover photo', 'image'],
                ['status', 'Status', 'select', ['options' => ['draft' => 'Draft (hidden)', 'published' => 'Published']]],
                ['published_at', 'Publish date', 'datetime', ['help' => 'Leave blank to use the moment you publish. A future date schedules the post.']],
            ],
            'before_save' => function (array $data, ?int $id) {
                if ($data['status'] === 'published' && empty($data['published_at'])) $data['published_at'] = date('Y-m-d H:i:s');
                if ($id === null) $data['author_id'] = current_user()['id'];
                return $data;
            },
            'public_url' => fn($row) => $row['status'] === 'published' ? '/news/' . $row['slug'] : null,
        ],
        'blocks' => [
            'table' => 'blocks', 'title' => 'Content blocks', 'singular' => 'block', 'order' => 'grp, sort_order, id', 'sortable' => true,
            'help' => 'Short repeatable items shown on the website: impact figures, the four pillars, outreach programmes, Gathering Land infrastructure, 2026 goals and more. Use the filter to see one group.',
            'list' => ['grp' => 'Group', 'title' => 'Title', 'is_published' => 'Visible'],
            'filter' => ['grp' => block_groups()],
            'fields' => [
                ['grp', 'Group (where it appears)', 'select', ['required' => true, 'options' => block_groups()]],
                ['title', 'Title (impact figures: the number, e.g. 5,000+. Bank accounts: e.g. UK account)', 'text', ['required' => true]],
                ['body', 'Text (goals: one point per line. Bank accounts: one detail per line, e.g. Account number: 12345678)', 'textarea'],
                ['icon', 'Icon', 'select', ['options' => ['' => 'None'] + array_combine(block_icons(), array_map('ucfirst', block_icons()))]],
                ['media_id', 'Photo (optional)', 'image'],
                ['is_published', 'Show on the website', 'checkbox', ['default' => 1]],
            ],
        ],
        'faqs' => [
            'table' => 'faqs', 'title' => 'FAQs', 'singular' => 'question', 'order' => 'sort_order, id', 'sortable' => true,
            'list' => ['question' => 'Question', 'is_published' => 'Visible'],
            'fields' => [
                ['question', 'Question', 'text', ['required' => true]],
                ['answer', 'Answer', 'textarea', ['required' => true]],
                ['is_published', 'Show on the website', 'checkbox', ['default' => 1]],
            ],
        ],
        'testimonies' => [
            'table' => 'testimonies', 'title' => 'Testimonies', 'singular' => 'testimony', 'order' => "FIELD(status,'pending','approved','rejected'), created_at DESC",
            'help' => 'Testimonies sent through the website arrive here as "Pending". Only approved ones appear on the site.',
            'list' => ['name' => 'Name', 'body' => 'Testimony', 'status' => 'Status', 'created_at' => 'Received'],
            'filter' => ['status' => ['pending' => 'Pending', 'approved' => 'Approved', 'rejected' => 'Rejected']],
            'fields' => [
                ['name', 'Name', 'text', ['required' => true]],
                ['location', 'City / country', 'text'],
                ['body', 'Testimony', 'textarea', ['required' => true, 'help' => 'You may correct spelling, but keep the person\'s meaning.']],
                ['status', 'Status', 'select', ['options' => ['pending' => 'Pending review', 'approved' => 'Approved (visible)', 'rejected' => 'Rejected']]],
            ],
            'before_save' => function (array $data, ?int $id) {
                $data['reviewed_by'] = current_user()['id'];
                $data['reviewed_at'] = date('Y-m-d H:i:s');
                return $data;
            },
        ],
        'redirects' => [
            'table' => 'redirects', 'title' => 'Redirects', 'singular' => 'redirect', 'order' => 'from_path', 'role' => 'admin',
            'help' => 'Send visitors from an old address to the right new page. Use paths like /old-page.',
            'list' => ['from_path' => 'From', 'to_path' => 'To', 'code' => 'Type', 'hits' => 'Uses'],
            'fields' => [
                ['from_path', 'Old address (path)', 'text', ['required' => true, 'help' => 'Must start with /, e.g. /convention-2024']],
                ['to_path', 'New address', 'text', ['required' => true, 'help' => 'A path like /speakers or a full https:// link']],
                ['code', 'Type', 'select', ['options' => ['301' => 'Permanent (301)', '302' => 'Temporary (302)']]],
            ],
            'before_save' => function (array $data, ?int $id) {
                $data['from_path'] = '/' . trim(parse_url($data['from_path'], PHP_URL_PATH) ?: '', '/');
                if (!str_starts_with($data['to_path'], '/') && !valid_http_url($data['to_path'])) {
                    throw new InvalidArgumentException('The new address must start with / or https://');
                }
                if ($data['from_path'] === rtrim($data['to_path'], '/')) {
                    throw new InvalidArgumentException('A redirect cannot point to itself.');
                }
                return $data;
            },
        ],
    ];
    return $r;
}
