# Deployment guide — Hostinger

Everything here happens in **your** hPanel. I can't log in, so after each part please tell me it's done (or paste any error) before moving on.

**Rule: the live site is not touched until Part 7, and only with your written approval.**

Files you'll use (from `dist/`):
- `thegathering-staging.zip` — for the staging subdomain
- `thegathering-production.zip` — for launch day (Part 7)

---

## Part 1 — Back up the current site (before anything else)
1. hPanel → **Websites** → thegatheringcof.org → **Files → Backups**.
2. Click **Generate new backup** (files) and also download a **database backup** if the site uses one.
3. Download both to your computer and keep them safe. This is the rollback copy.
4. While there, turn on **automatic backups** (weekly or daily, depending on your plan).

## Part 2 — Fix SSL (needed for launch; the expired certificate currently blocks all visitors)
hPanel → **Websites** → thegatheringcof.org → **Security → SSL** → **Install** (free Let's Encrypt) or **Renew**. Wait up to 15 minutes, then open https://thegatheringcof.org — it should load without a warning.

## Part 3 — Create the email mailbox for sending
1. hPanel → **Emails** → thegatheringcof.org → **Create email account**: `noreply@thegatheringcof.org` (or another name you prefer). Use a long random password.
   - If the domain's email is with another provider (Google Workspace, Zoho…), tell me — the SMTP settings change.
2. hPanel → **Emails → DNS settings / Email deliverability**: make sure these are present (hPanel usually offers a one-click fix):
   - **SPF** (TXT on `@`): `v=spf1 include:_spf.mail.hostinger.com ~all` — if an SPF record already exists, *merge* rather than add a second one.
   - **DKIM**: the record(s) hPanel shows for Hostinger Email (CNAME/TXT named like `hostingermail-a._domainkey`).
   - **DMARC** (TXT on `_dmarc`): `v=DMARC1; p=none; rua=mailto:YOUR-INBOX@thegatheringcof.org`
3. Tell me when done. I will not assume they're active until a test email lands in Gmail's inbox (not spam).

## Part 4 — Create the staging subdomain
1. hPanel → **Domains → Subdomains** → create `new` (→ `new.thegatheringcof.org`). Note the folder hPanel shows (usually `public_html/new`).
2. hPanel → **Security → SSL** → install SSL for `new.thegatheringcof.org`.
3. Recommended: **Advanced → Password Protect Directories** → protect the staging folder so only your team can view it.

## Part 5 — Create the staging database
1. hPanel → **Databases → Management** → create a database and user, e.g. database `u123_gather_stg`, user `u123_gather_stg`, strong password. Write down all three.
2. Click **Enter phpMyAdmin** for that database → **Import** tab:
   - Import `gathering_app_staging/sql/001_schema.sql` → **Go**.
   - Then `002_seed.sql` → **Go**.
   - Then `003_blocks.sql` → **Go**.
   - Then `004_content.sql` → **Go** (the real content: pages, event, photos, settings).
   - You should see tables like `events`, `pages`, `blocks`, `settings`, `submissions`.
   - The photos are already inside the zip's `uploads/` folder, so they appear as soon as files are uploaded.

## Part 6 — Upload staging
1. hPanel → **Files → File Manager**. Open `domains/thegatheringcof.org/` (the folder that **contains** `public_html`).
2. Upload `thegathering-staging.zip` there and **Extract** it. You'll get:
   - `gathering_app_staging/` → leave it where it is (next to `public_html`, **not** inside it).
   - `staging_public/` → move its **contents** (including the hidden `.htaccess` and `app-location.php`) into the subdomain folder from Part 4 (e.g. `public_html/new/`). Then delete the empty `staging_public` folder.
3. In `gathering_app_staging/config/`, copy `config.example.php` to **`config.php`** and edit it:
   - `'env' => 'staging'`
   - `'base_url' => 'https://new.thegatheringcof.org'`
   - `'timezone'` → the ministry's timezone (e.g. `Africa/Lagos`, `Europe/London`)
   - `db` → the staging database name, user and password from Part 5 (`host` stays `localhost`)
   - `mail` → `username`/`from_email` = the mailbox from Part 3, `password` = its password (`smtp.hostinger.com`, port `465`, `ssl`)
   - `app_key` → a long random string (40+ characters, letters and numbers)
   - `setup_token` → a one-time code you make up
4. Open **https://new.thegatheringcof.org/admin/setup**, enter the setup code and create your administrator account. Then delete the `setup_token` value from config.php.
5. **Cron job** for email retries: hPanel → **Advanced → Cron Jobs** → every 10 minutes:
   `/usr/bin/php /home/YOUR_USER/domains/thegatheringcof.org/gathering_app_staging/bin/send-mail.php`
   (File Manager shows your exact `/home/…` path at the top.)
6. Admin → **Settings → Test email sending** → send a test to a Gmail address. Tell me if it arrives in the inbox, spam, or not at all.

### Staging checks (I'll do these with you)
- `https://new.thegatheringcof.org/robots.txt` shows `Disallow: /`.
- `https://new.thegatheringcof.org/uploads/` shows "Forbidden" (no file listing).
- `https://new.thegatheringcof.org/app-location.php` is blocked.
- Every form submitted for real; both emails arrive; registration duplicate + closed states.
- Lighthouse / PageSpeed Insights on mobile — real scores recorded in QA_REPORT.md.
- `python tools/check_links.py https://new.thegatheringcof.org --external` → zero broken links.

## Part 7 — Launch (only after your written approval)
1. Fresh backup of the old site (Part 1 again).
2. Create the **production** database (Part 5 with a new name). Easiest way to bring the content across: in staging phpMyAdmin **Export** the whole database, then **Import** it into the production database. Also copy `public_html/new/uploads/` to the live `public_html/uploads/`.
3. Move the old site's files out of `public_html` into a folder such as `old_site_backup_YYYYMMDD` (next to `public_html`, **not deleted**).
4. Upload `thegathering-production.zip` to `domains/thegatheringcof.org/`, extract: `gathering_app/` stays next to `public_html`; move the contents of `production_public/` into `public_html/`.
5. Create `gathering_app/config/config.php` as in Part 6, with `'env' => 'production'`, `'base_url' => 'https://thegatheringcof.org'` and the **production** database.
6. Cron job: same as Part 6 step 5, but with `gathering_app` instead of `gathering_app_staging`.
7. If the old site used `www.`, tell me before launch (the `.htaccess` currently sends `www` → bare domain).

### After launch (same day)
- Open every page; submit every form for real; confirm both emails arrive.
- Check old URLs redirect (REDIRECT_MAP.csv).
- `https://thegatheringcof.org/robots.txt` now **allows** indexing and lists the sitemap.
- Search Console → submit `https://thegatheringcof.org/sitemap.xml`.
- Keep the old site backup until you approve deleting it.

## Updating the site later
Content: always through the admin. Code changes: upload the changed files only; database changes come as new numbered SQL files (`003_….sql`) to import in phpMyAdmin.
