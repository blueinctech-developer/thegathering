# Build plan

## Stack (decided)
- **Front end:** hand-built HTML5, modern CSS (custom properties, Grid, Flexbox), ~6 KB of vanilla JavaScript. No framework, no build step.
- **Pages:** PHP 8 templates rendering server-side HTML from MySQL, so admin edits appear immediately.
- **Back end:** plain PHP 8.x, PDO prepared statements everywhere.
- **Database:** MySQL / MariaDB, versioned SQL files (`gathering_app/sql/001_schema.sql`, `002_seed.sql`).
- **Email:** PHPMailer 6.9.3 (bundled in `gathering_app/vendor/phpmailer`, no Composer needed) over authenticated SMTP from a domain mailbox. Every email is queued in the database and logged.
- **Rich text safety:** a built-in allow-list sanitiser (PHP DOM) instead of HTML Purifier — fewer files to upload; scripts, styles, event handlers and unsafe links are removed.
- **Server config:** `.htaccess` (HTTPS, clean URLs, caching, compression, security headers, blocked config/logs, no script execution in uploads).

## Folder layout on Hostinger
```
domains/thegatheringcof.org/
├── public_html/          ← upload the contents of the zip's public_html here
│   ├── index.php         (front controller)
│   ├── .htaccess
│   ├── assets/           (CSS, JS)
│   └── uploads/          (images & PDFs uploaded in the admin; scripts blocked)
└── gathering_app/        ← sits NEXT TO public_html, never inside it
    ├── config/config.php (passwords — created by you from config.example.php)
    ├── src/ admin/ controllers/ templates/ vendor/
    ├── sql/              (database files to import)
    ├── bin/              (cron + command-line tools)
    └── storage/logs/
```

## Pages (see PAGE_INVENTORY.csv)
Home, About, Speakers + profiles, Schedule (tabbed by day), Register, Venue & accommodation, Watch/Media, Gallery + albums (lightbox), News + posts, Give/Partner, Volunteer, Prayer, Testimonies, FAQs, Contact, Privacy, extra custom pages, branded 404.

Pages and homepage sections **appear only when they have real content**, so the site never shows empty sections, placeholder text or dead links.

## CMS scope (all built)
Event settings (theme, dates, venue, map, countdown, registration open/closed, capacity, flyer, programme PDF) · Pages (rich text) · Speakers (photos, bios, order) · Schedule (days, sessions, times, speakers) · Gallery (albums, multi-upload, captions, alt text) · Media/sermons · News (draft/publish/schedule) · Testimonies (approve before publishing) · FAQs · Submissions (search, filter, status, notes, check-in, CSV export, email retry) · Site settings (logo, colours, contacts, socials, livestream, giving, forms on/off, notification inboxes, SEO, analytics) · Staff accounts (Administrator / Editor) · Redirects · Email log · Media library · Activity log.

## Design system
- Display font **Bricolage Grotesque**, body font **Figtree** (Google Fonts).
- Brand colours are **editable in Settings** (defaults: deep navy `#0f1b2d` + warm gold `#d9a441`) and will be replaced with the ministry's real colours once the logo is supplied.
- Large confident type, generous whitespace, full-bleed photography, subtle scroll reveals (disabled for "reduce motion"), mobile-first with a sticky Register bar on phones.

## Launch plan
1. Audit old site (blocked → needs SSL renewal or files).
2. Import real content and assets.
3. Deploy to **staging** (`new.thegatheringcof.org`, noindex, password-protected) — see DEPLOYMENT.md.
4. Your review + real tests of every form and email on staging; Lighthouse; external link check.
5. Backup old site → your written approval → switch the live domain.
6. Post-launch smoke tests, Search Console sitemap submission.
