# SEO report — new site

The "old vs new" comparison cannot be completed until the old site is audited (`SEO_BASELINE.md`). This records what the new site does, verified locally.

| Item | New site | Verified |
|---|---|---|
| Clean URLs | `/speakers`, `/register` etc. Old-style `/page.php`, `/page.html` and trailing slashes 301 to the clean URL | Yes (local) |
| Unique `<title>` per page | `Page | Site name`; homepage uses site name + tagline | Yes — link checker found no duplicates |
| Meta description per page | From the page's own field, its intro/body, or the default in Settings | Yes — none missing |
| One `<h1>` per page | Enforced in every template | Yes — checked on all 21 pages |
| Canonical URL | On every page | Yes |
| Open Graph + Twitter cards | Title, description, URL, image (page image → event flyer/hero → default share image) | Yes (tags present); share preview to be tested on staging with WhatsApp/Facebook |
| Event structured data (JSON-LD) | Built from the current event **only when real name, date and venue exist** | Yes |
| Organization structured data | Name, URL, logo, socials, contact | Yes |
| FAQ structured data | On /faqs | Yes |
| XML sitemap | `/sitemap.xml`, lists only published pages | Yes |
| robots.txt | Live: allows all, blocks /admin, links sitemap. Staging/local: `Disallow: /` | Yes (staging mode) |
| Staging not indexed | `noindex` meta + `X-Robots-Tag` header + robots Disallow when `env` ≠ production | Yes |
| Images | Descriptive alt text fields on every image; responsive WebP/JPEG; lazy loading; fixed dimensions | Yes |
| Analytics / GTM / Pixel / Search Console | Fields in Settings; only output on production | Built; IDs unknown |
| Redirects for old URLs | Admin → Redirects + `.htaccess` | Built; old URLs unknown |
| HTTPS | Forced in `.htaccess`; HSTS header | To verify on Hostinger |

## After launch
1. Search Console → add/verify property → submit `https://thegatheringcof.org/sitemap.xml`.
2. Use URL Inspection on the homepage and /register.
3. Test sharing previews with the Facebook Sharing Debugger and by sending the link in WhatsApp.
