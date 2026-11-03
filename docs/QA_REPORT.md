# QA report

**Date:** 3 November 2026 (re-run after the redesign) · **Environment:** local (PHP 8.3 built-in server + MySQL 8.0.46 + a local SMTP test server) · **Content:** the REAL content migrated from thegatheringcof.org. Tests create temporary records and remove them afterwards.

Re-run any time: `tools/test_forms.py`, `tools/test_admin.py`, `tools/check_links.py`.

## Summary

| Area | Result |
|---|---|
| Forms (automated) | **31 / 31 passed** |
| Admin, CMS, roles & security (automated) | **32 / 32 passed** |
| Link check (10 pages, 191 links/assets, external links included) | **0 problems** |
| Fresh install from the staging zip (SQL import → setup → admin) | **Passed** |
| Fresh import of all 4 SQL files (incl. real content) into an empty database | **Passed** |
| PHP syntax (all files) | **Passed** |
| PHP error log after all tests | **Empty** |

## Forms — tested and passed
- Contact: valid submit → 303 redirect → success with reference → row saved → **2 emails delivered** (team + confirmation) → email status "sent".
- Invalid submit → field errors shown, typed values kept, nothing saved.
- Honeypot filled → bot sees normal success; stored as spam; no emails.
- Submitted in under 3 seconds → stored as spam.
- Bad CSRF token → rejected, nothing saved.
- 7th submission in 10 minutes → blocked.
- Registration: saved with `REG-…` reference; confirmation email contains reference, event name and venue.
- Duplicate **email** rejected; duplicate **phone** rejected; consent required; attendee count validated.
- Capacity: fills to exactly the limit, then the page shows "Registration is full".
- Closed switch: page shows "Registration is closed"; homepage Register buttons disappear.
- Prayer, volunteer, testimony, partnership, newsletter: all save and confirm.
- Testimony lands as **pending** and does not appear publicly.
- **SMTP down:** submission saved, visitor sees success + reference, emails marked failed with the error → SMTP restored → cron job sent both → status "sent".

## Admin & security — tested and passed
- Anonymous visitors redirected to sign-in from /admin, settings, submissions, a submission, CSV export, speakers, users.
- Wrong password rejected; correct password signs in; **locked after 5 failures** even with the right password; logout ends the session.
- Password reset: generic message (doesn't reveal accounts), email sent, link from the email sets a new password, link **can't be reused**, new password works.
- First-time setup requires the setup code, then locks itself.
- Edit speaker → **change appears on the public page immediately**; `<script>` and `javascript:` links stripped from rich text.
- Gallery multi-photo upload works; images converted to WebP + JPEG at several sizes.
- A PHP file disguised as `.jpg` is **rejected**; no `.php` files exist in uploads.
- Settings change (contact email) appears in the footer; invalid URL rejected.
- Editor role: can manage content; **403** on settings, users, redirects; can't delete users by crafted POST.
- Admin CSRF: forged delete refused.
- Redirect created in admin → old URL returns 301 to new page.
- Branded 404 page returns status 404.
- CSV export downloads with headers (formula-injection protected).
- Security headers present (CSP, X-Frame-Options, nosniff, Referrer-Policy); staging/local send `noindex` + `robots.txt Disallow: /`.

## Visual checks (Chromium, in the built-in browser)
Homepage, About, Outreach, Give, Gallery album at 1440px desktop; homepage at 375–390px phone; mobile menu; countdown; registration; admin. No horizontal scrolling on phones. Fixed during review: hero title clipping on phones, paragraph spacing (CSS specificity bug), pillar title alignment, duplicate photos between sections, duplicated "Infrastructure development" heading, gallery tiles not filled, header photo contrast. Screenshots were reviewed live; they are not saved as files.

## Style checks (3 Nov 2026)
- Brand yellow #FFCC00 (taken from the live site's Elementor colours) applied; dark text on yellow; a darker gold used for small text on light backgrounds so it stays readable.
- Every public page scanned: **0 em dashes, 0 eyebrow labels**.
- Bank account card rendered and removed in a live test.

## NOT yet tested (needs staging on Hostinger)
| Item | Why |
|---|---|
| `.htaccess` rules (HTTPS redirect, caching, compression, blocking config/uploads scripts) | The local PHP server ignores `.htaccess`; must be verified on Hostinger |
| Real email delivery via Hostinger SMTP; SPF/DKIM/DMARC; inbox vs spam | Needs the real mailbox and DNS |
| Lighthouse / PageSpeed scores | Only meaningful on the real server (compression, caching, HTTPS). **No scores are claimed yet.** |
| Facebook / Instagram / giving links | The old site had none (links were `#`); real URLs needed |
| Google Maps / YouTube embeds displaying | Embed URLs verified to load; the preview pane doesn't render third-party frames |
| Safari / iOS and Firefox | Only Chromium tested so far |

## Remaining issues
1. Logo file is low resolution (635×320) — original/vector needed.
2. Missing real details: phone/WhatsApp, Facebook, Instagram, giving/bank details, exact venue and session times.
3. Privacy policy: draft written, unpublished, awaiting the ministry's approval.
4. Prayer, testimony, volunteer and newsletter forms are built but switched off until approved.
