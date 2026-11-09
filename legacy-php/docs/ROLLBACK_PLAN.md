# Rollback plan

## Before launch
- Full backup of the old site's files (and database, if any), downloaded to your computer (DEPLOYMENT.md Part 1).
- The old site's files are **moved** to `domains/thegatheringcof.org/old_site_backup_YYYYMMDD/`, not deleted.
- Hostinger automatic backups switched on.

## If something goes wrong after launch
**Small problem (one page or form):** keep the new site up and fix it. Content problems can be fixed in the admin straight away.

**Serious problem (site down, forms not saving):**
1. hPanel → File Manager → `domains/thegatheringcof.org/`.
2. Rename `public_html` → `public_html_new_failed`.
3. Rename `old_site_backup_YYYYMMDD` → `public_html`.
4. The old site is back within a minute. Nothing in `gathering_app/` or the new database needs to change, so the new site can be restored the same way once fixed.
5. If hPanel's own restore is easier: **Files → Backups → Restore** the backup taken just before launch.

**Database problem:** phpMyAdmin → Import the latest export of the production database (or restore it from Files → Backups → Databases).

## What is never deleted without your written approval
- The old site's files and database.
- Any form submissions.
- The staging site (kept for testing future changes).
