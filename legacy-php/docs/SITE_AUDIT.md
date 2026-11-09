# Site audit — thegatheringcof.org

**Audit date:** 3 November 2026 · **Method:** the site's SSL certificate is expired, so at the owner's request the certificate check was skipped and every page was fetched directly (HTML, WordPress REST API, sitemap). Raw text captures are in `docs/old_site_capture/`.

## Platform
| Item | Finding |
|---|---|
| Host | Hostinger (hPanel, Hostinger CDN), PHP 8.2 |
| CMS | **WordPress** |
| Theme | **Agora** by AncoraThemes (an event/conference theme) with its demo content still installed |
| Page builder | Elementor (+ Happy Addons), Slider Revolution 7 |
| Plugins seen | Gravity Forms (contact form), The Events Calendar + Event Tickets, WooCommerce (shop/cart/checkout), Instagram Feed, ThemeREX Addons |
| SSL | **Expired** — browsers block the site completely |
| Sitemap | `/wp-sitemap.xml` — 349 URLs |
| robots.txt | Allows everything except WooCommerce/admin paths |

## The key finding: most of the site is theme demo content
Of 349 URLs, only **5 pages contain the ministry's own content** (all created in 2026). Everything else is the theme's sample content that was never removed:

| Content | Count | Real or demo |
|---|---|---|
| Pages: **Home, About, Outreach, Give, Contact Us** | 5 | **Real** (Give is broken — see below) |
| Other pages (Business Forum, Concert, Fashion Event, Gaming & Comics, Food Festival, Pricing, Shop, Cart, Typography…) | 34 | Demo |
| Blog posts (business forums, fashion, concerts, gaming…) | 46 | All demo |
| Events (City lights festival, Disco music magic…) | 59 | All demo |
| Speakers page | 1 | Demo (stock speakers) |
| FAQs page | 1 | Demo ("Sed ut perspiciatis…" lorem ipsum) |
| Privacy Policy | 1 | **Demo — it is AncoraThemes' own policy** (a Cyprus company, servers in Germany). Legally wrong for the ministry |
| Shop products | several | Demo |
| Media library | 507 files | **~32 real** (logos + event photos); the rest are theme demo/stock images |

## Real content found (all migrated)
- **Event:** The Gathering 2026 · theme **"Breaking Territories"** · **26–28 November 2026** · **Oyo State, Nigeria** (no specific venue or times published).
- **Organisation:** The Gathering International Christian Network — annual interdenominational prayer conference; incorporated in the UK, Registration No. 15843980; an arm of The Chariot of Fire World Outreach (COFWO); Convener: Yomi Adeboye.
- **Mission, vision, "why it matters", four impact pillars, "Gathering in action"** (Home + About).
- **Impact figures:** 5,000+ lives touched yearly · 13 medical centre partners · 20,000+ individuals blessed (About page counters).
- **Outreach:** Spiritual Outreach, Welfare Outreach, Medical Aid (up to 5,000 people), **The Gathering Land** — 2.66 acres (10,783 m²) in Ido LGA, Oyo State — six planned infrastructure items, three 2026 impact-goal groups.
- **Contact:** thegatheringcof@gmail.com · Purley Way, Croydon, London CR0 4RG · YouTube @thegatheringcn.
- **Logos:** The Gathering (white, 635×320 — low resolution), COFWO (colour + white). **Photos:** 29 real event photos.

## Problems found on the live site
| # | Problem | Where |
|---|---|---|
| 1 | SSL certificate expired — site unreachable in browsers | Whole site |
| 2 | **Give page is broken**: shows theme demo text ("Hello / Ignissimos ducimus…"), a Berlin office address, info@example.com, a US phone number and AncoraThemes social links | /give/ |
| 3 | "GIVE" menu button links to `#` (goes nowhere) | Every page |
| 4 | Facebook and Instagram icons link to `#` | Every page footer |
| 5 | "Partner With Us", "Learn More", "Give to the Cause", "Contact us" buttons link to `#` | Home, About, Outreach |
| 6 | "BECOME A PARTNER" links to a demo event ("EduTech Expo") | Home |
| 7 | Hidden menu panel contains demo links: "Visit the Store" (/shop), info@website.com | Every page |
| 8 | Contact page phone **"+1 (234) 567 890" is a placeholder** | /contact-us/ |
| 9 | Privacy policy belongs to the theme vendor | /privacy-policy/ |
| 10 | 300+ demo pages/posts/events are public and indexed by Google under the ministry's domain | Site-wide |
| 11 | Impact counters render as "0" until animated (search engines and slow phones see 0) | About |
| 12 | Homepage `<title>` is "The Gathering – Conference"; OG description just "Conference" | SEO |

## Forms
One real form: **Contact** (Gravity Forms #2) — First name*, Last name*, Email*, Subject*, Message*. Its notification address is configured inside WordPress and could not be seen from outside. No registration, prayer, volunteer or giving forms exist.

## Not verifiable from outside
Gravity Forms notification recipient · whether any analytics / Search Console code is configured (none found in page source) · the real Facebook/Instagram URLs · giving/bank details · the exact venue.
