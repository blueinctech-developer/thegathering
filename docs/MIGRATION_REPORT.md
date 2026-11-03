# Migration report

**Date:** 3 November 2026 · **Source:** live thegatheringcof.org (fetched with the expired certificate check skipped, at the owner's request) · **Importer:** `tools/import_old_site.php` → packaged as `gathering_app/sql/004_content.sql`.

## Summary
| Item | On old site | Migrated | Skipped (demo) | Needs your input |
|---|---|---|---|---|
| Real pages | 5 | 4 (Home, About, Outreach, Contact) | — | Give: no giving details existed |
| Demo pages / posts / events | 34 / 46 / 59 | 0 | All | — |
| Event details | 1 | Name, theme, dates, venue, programme, ministers (see second source below) | — | Session times |
| Impact figures | 3 | 3 | — | — |
| Content blocks (pillars, needs, programmes, infrastructure, goals, activities) | 28 items | 28 | — | — |
| Logos | 3 real (+variants) | 3 | — | Original high-resolution / vector logo |
| Photos | 29 real | 29 (3 albums, alt text on all) | ~450 theme demo images | Confirm album names; permission for any photographer credits |
| Documents (PDF) | 0 | — | — | Programme PDF if one exists |
| Contact form | 1 | Rebuilt with the same fields | — | Confirm notification inbox |
| Contact details | email, address, YouTube | All 3 | Placeholder phone "+1 (234) 567 890" | Real phone/WhatsApp, Facebook, Instagram |
| Privacy policy | Vendor's policy | Replaced with the ministry's own policy (published) | — | — |
| Old URLs | 5 real | 5 (2 redirects + 3 automatic) | Demo URLs return 404 | — |

## Text
All text is copied from the live pages word for word. Changes:
- "preventive car" → "preventive care" (typo on About).
- The homepage's "Why The Gathering Matters" challenges were run together in one sentence on the old site; they are now shown as a list with the same wording.
- Headings that appeared in ALL CAPS on the old site are stored in normal capitals; the design applies capitals where appropriate.

## Images
Originals are kept untouched in `assets_originals/` (backup). Web versions are re-encoded and resized (WebP + JPEG at 480/960/1600 px). Every photo has descriptive alt text that only describes what is visible — no names were guessed. See `ASSET_INVENTORY.csv`.

## Decisions (confirmed by the ministry, 3 Nov 2026)
1. **Album names:** "The Gathering 2025" (11 photos), "Worship & Praise" (6), "Prayer & Ministry" (12). Staff can rename them in Admin > Gallery.
2. **Online registration** is on for The Gathering 2026.
3. **Form notifications** go to thegatheringcof@gmail.com.
4. **Privacy policy** approved and published at /privacy (old /privacy-policy redirects to it).
5. **Colours:** the live site's brand yellow **#FFCC00** (its Elementor primary colour) with black and white.
6. **Style:** no eyebrow labels and no em dashes anywhere on the site; the imported text was re-punctuated with commas/colons without changing its meaning.
7. **Bank account details** are entered by staff in Admin > Bank accounts (one entry per account).

## Second source: the ministry's earlier build (3 Nov 2026)
Source: https://gathering-2026.vibepreview.app plus its two official flyers (speakers lineup, "Join the bus"). Importer: `tools/import_preview_site.php`.

### Conflicts and how they were resolved
| Item | Live WordPress site | Earlier build | Official flyer | Used on new site |
|---|---|---|---|---|
| Dates | 26–28 Nov 2026 | 27–29 Nov 2026 | **27th–29th Nov** | **27–29 November 2026** |
| Theme | Breaking Territories | The Move of the Spirit | **The Move of the Spirit; Breaking Territories** | Title "The Move of the Spirit", subtitle "Breaking Territories" |
| Venue | Oyo State, Nigeria | Ido, Oyo State | **The Gathering International Christian Centre, Mekun, Elebu Axis, Alao Akala Expressway, Ibadan** | Flyer address |
| Land size | 2.66 acres (10,783 m²) | "1 acre (10,783 m²) within a 2.66-acre site" | — | "1 acre secured within a 2.66-acre site". Note: 10,783 m² equals about 2.66 acres, not 1 acre. **Please confirm.** |

### Added
- 10 ministers (names and roles exactly as on the flyer; no individual photos or bios exist, so speaker cards show name and role only and do not link to empty profile pages).
- Programme overview for 3 days (no times published; note shown that the ministry will confirm).
- Free bus: 7 pick-up points, 8:00 AM daily, free to and fro, drop-off location, helpline **+234 708 784 7372** (now the site's phone number).
- Medical outreach services (6), Heart of Compassion, Gathering Land progress and vision (4).
- Values: Inspire / Impact / Empower. "At a glance" facts (6).
- Partnership tiers (5) and 8 funding streams with NGN / GBP / USD amounts, total ₦133,000,000 / £83,125 / $110,833, and the Google Drive partnership documents link.
- About: convener statement and governance & transparency.
- YouTube video "The Gathering this year will take place on the Gathering land, Ibadan, Oyo State, Nigeria".
- Partnership form now asks for Country and uses the five tiers as interests.

### Not used
- "A fuller biography will be added..." and "PLACEHOLDER" gallery tiles (placeholders).
- www.thecofwo.org link: saved but hidden, because that site's SSL certificate has also expired (visitors would see a security warning).
