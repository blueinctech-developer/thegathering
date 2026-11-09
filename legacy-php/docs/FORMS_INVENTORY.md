# Forms inventory

## Old site (audited 3 Nov 2026)

| Form | Page | Fields | Sent to | Notes |
|---|---|---|---|---|
| Contact (Gravity Forms #2) | /contact-us/ | First name*, Last name*, Email*, Subject*, Message* | Configured inside WordPress — **not visible from outside** | "A member of our ministry team will reach out within 24 hours" |

No other working forms existed: no registration, prayer, volunteer, newsletter or giving form, and no payment provider (the Give page was broken and every "Give"/"Partner" button linked to `#`). The theme's demo WooCommerce shop and Event Tickets checkout were demo only.

## New site — how every form works

All forms share the same engine (`gathering_app/src/forms.php`):

1. **Validated on the server** (required fields, email format, phone 7–15 digits, number ranges, allowed choices, length limits). Browser validation is not relied on.
2. On error: clear messages next to each field, the visitor's typed values are kept, focus moves to the problem.
3. **Saved to MySQL first** (`submissions` table: id, form type, unique reference, fields as JSON, status, email status, timestamp, hashed IP).
4. **Then** emails are sent through authenticated SMTP (PHPMailer): a notification to the ministry inbox and a branded confirmation to the person, both with the reference number.
5. If email fails, the submission is **still saved**, marked `email: failed`, shown on the dashboard, and retried automatically by the cron job (every 10 minutes, up to 6 tries) or manually from the admin.
6. The success message ("Received — thank you!" + reference) is shown **only after the database save succeeds**.
7. **Spam protection:** CSRF token, hidden honeypot field, minimum fill time (3 seconds), and a limit of 6 submissions per 10 minutes per visitor per form. Bots get a normal-looking reply; their entries are stored as "spam" with no emails sent. reCAPTCHA/Turnstile is **not** added (only if spam becomes a real problem).
8. Every form can be switched on/off in **Admin → Settings → Forms**. A switched-off form has no page and no menu link.

| Form | Page | Fields (* required) | Default | Notification goes to | Confirmation email |
|---|---|---|---|---|---|
| Registration | `/register` | Full name*, Email*, Phone/WhatsApp*, City, Church/ministry, Number of people* (1–10), Notes, Consent* | **On** | `notify_registration` → default → contact email | Yes — event name, theme, dates, venue, reference, directions link, optional note |
| Contact | `/contact` | First name*, Last name*, Email*, Subject*, Message* (same as old form) | **On** | `notify_contact` → default | Yes |
| Prayer request | `/prayer` | Name*, Email*, Phone, Request*, "You may contact me" | Off until approved | `notify_prayer` → default | Yes. Never shown publicly |
| Testimony | `/testimonies` | Name*, City/country, Email*, Testimony*, Permission to publish* | Off until approved | `notify_testimony` → default | Yes. Goes to review queue; published only after staff approve |
| Volunteer | `/volunteer` | Name*, Email*, Phone*, Team* (choices from Settings), Experience, Consent* | Off until approved | `notify_volunteer` → default | Yes |
| Partnership / sponsorship | `/give` | Name*, Organisation, Email*, Phone, Interest* (ministry partner, medical outreach, compassion feeding, Gathering Land, sponsorship, other), Message* | **On** — gives the old site's many "Partner with us" buttons a real destination; please confirm | `notify_partnership` → default | Yes |
| Newsletter | Site footer | First name, Email* | Off until approved | `notify_newsletter` → default | Yes |

### Registration extras
- **Duplicate prevention:** one registration per email **and** per phone number for each event (checked in code and enforced by unique database keys).
- **Reference:** e.g. `REG-26-K7M2QX` (unambiguous letters/numbers).
- **Capacity:** optional, counts total people. Registration closes automatically when reached ("Registration is full").
- **Open/closed switch:** Admin → Events → "Registration is open". Also closes automatically after the event ends.
- **Check-in:** staff can mark a registration as checked in from its admin page.
- **QR code on confirmation:** *not built* — awaiting your approval.

### Payments
No payment flow was built. The old site's giving provider (if any) is unknown. The Give page shows an **online giving button only if you enter a real giving link** (Paystack/Flutterwave/PayPal/other) in Settings, and **bank details only exactly as you enter them**. To embed a payment provider properly, I need the provider name and the live payment page link (or live public key) from you.

### Email addresses
Notifications go to **thegatheringcof@gmail.com** — the address published on the old Contact page. Please confirm this is the right inbox (the old form's real recipient couldn't be seen). Change it any time in Admin → Settings → Forms & notifications.

## Tested
See `QA_REPORT.md` — 31 automated form tests passed locally, including valid/invalid submissions, honeypot, time trap, CSRF, rate limit, duplicate email/phone, capacity/full, closed state, and SMTP-down → saved → retried → delivered.
