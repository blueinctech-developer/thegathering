# SEO baseline (old site, captured 3 Nov 2026)

| Item | Old site |
|---|---|
| Homepage title | "The Gathering – Conference" |
| Other titles | "About – The Gathering", "OUTREACH – The Gathering", "Give – The Gathering", "Contact Us – The Gathering" |
| Meta descriptions | **None** (no `<meta name="description">` on any page) |
| Open Graph | og:description = "Conference" on the homepage; other pages use raw page text with tabs/line breaks; og:image = the white logo PNG (invisible on white previews) |
| H1 | Homepage has two H1s ("THE GATHERING 2026", "Breaking Territories"); inner pages have no H1 |
| Sitemap | `/wp-sitemap.xml` — 349 URLs, ~340 of them theme demo content |
| robots.txt | WordPress/WooCommerce defaults; demo pages fully indexable |
| Structured data | None for the event or organisation |
| Analytics / Tag Manager / Pixel / Search Console | **None found** in the page source |
| HTTPS | Certificate **expired** — browsers and Google show security errors |

## Implications
- Google has been shown hundreds of unrelated demo pages (fashion events, gaming conferences, concerts) under the ministry's domain. Removing them (they now return 404) and submitting the new sitemap will clean this up over a few weeks.
- Nothing needs to be preserved for analytics continuity — no tracking codes existed. If you have a Google Analytics or Search Console account for the domain anyway, enter the IDs in Admin → Settings → Search & sharing.

See `SEO_REPORT.md` for what the new site does.
