# The Gathering — website & CMS

New website for **thegatheringcof.org**: hand-built HTML/CSS/JS front end, PHP 8 + MySQL back end with a staff admin (CMS), built to run on any Hostinger web hosting plan with no Node.js or build step.

## Folders
| Folder | What it is | Uploaded? |
|---|---|---|
| `public_html/` | Web root: `index.php`, `.htaccess`, CSS/JS, `uploads/` | Yes → `public_html` |
| `gathering_app/` | Application code, templates, PHPMailer, SQL, cron scripts, config | Yes → **next to** `public_html` |
| `docs/` | Audit, plans, reports, deployment, admin guide | No |
| `tools/` | Test suites, link checker, package builder, local SMTP catcher | No |
| `dist/` | Ready-to-upload zips (built by `php tools/build_package.php`) | — |

## Quick start (local)
1. MySQL: create a database, import `gathering_app/sql/001_schema.sql` then `002_seed.sql` (or run `php gathering_app/bin/migrate.php`).
2. Copy `gathering_app/config/config.example.php` → `config.php`, set `env` to `local`, DB details and `base_url` `http://localhost:8080`.
3. `php -S localhost:8080 -t public_html public_html/index.php`
4. Create an admin: `php gathering_app/bin/create-admin.php "Your Name" you@example.org` (or use `/admin/setup`).

## Deploying
See **docs/DEPLOYMENT.md** (staging first, live only with approval) and **docs/ROLLBACK_PLAN.md**.

## Testing
```
python -I tools/test_forms.py http://localhost:8080 <mail_dir> mysql -h… -u… <db>
python -I tools/test_admin.py http://localhost:8080 <image.jpg> mysql -h… -u… <db>
python -I tools/check_links.py https://new.thegatheringcof.org --external
```
Results: **docs/QA_REPORT.md**.

## Key design decisions
- Content lives in the database; templates show a section only when it has real content (no placeholders, no `#` links).
- Every form saves to the database **before** emailing; emails are queued, logged and retried by cron.
- Secrets live only in `gathering_app/config/config.php`, outside the web root; never in the packages.
- Staging copies are forced to `noindex` and use their own app folder and database (`app-location.php`).

## Status
Foundation, CMS, forms, design and tests are complete. The old-site audit, asset scraping and content migration are **blocked** by the old site's expired SSL certificate — see `docs/SITE_AUDIT.md`.
