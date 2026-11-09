# The Gathering

Website and admin for **The Gathering**, the annual interdenominational prayer and compassion conference in Ibadan, Oyo State, Nigeria.

Built with Next.js 16 for Vercel, with a Neon Postgres database, an S3-compatible bucket for uploads, and Amazon SES for enquiry emails.

## What is in it

**Public site:** Home, About, The Gathering 2026, Ministries & Outreach, The Gathering Land, Partner With Us, Media, Contact and Privacy. Old site addresses (`/give`, `/about-us`, `/outreach`...) redirect to the new pages.

**Admin (`/admin`):** sign in with email and password, then edit:

| Section | What it controls |
|---|---|
| Event | Name, theme, dates (countdown), venue, hero photo, flyers, partnership PDF |
| Site content | All headings, paragraphs and contact details |
| Speakers | Lineup, order, optional photos |
| Programme | Days and sessions |
| Lists | Pillars, impact figures, bus stops, partnership tiers, land plans and more |
| Funding streams | Amounts in NGN, GBP and USD, one-page PDFs (the total is calculated) |
| Photos and files | Gallery uploads, descriptions, order |
| Enquiries | Contact and partnership messages (saved before any email is sent) |
| Account | Change password, add or remove admins |

Saving in the admin updates the public pages immediately. Public pages are otherwise served as cached static pages.

## Local development

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
```

In `.env.local`, set `BETTER_AUTH_SECRET` (any long random string) and, for a local database:

```
DATABASE_URL=postgresql://postgres@127.0.0.1:5433/postgres?sslmode=disable
BETTER_AUTH_URL=http://localhost:3000
```

Then, in one terminal, start the local database (an embedded Postgres stored in `.data/`):

```bash
npm run db:local
```

In another terminal:

```bash
npm run db:migrate
npm run db:seed
npm run admin:create -- "Your Name" you@example.org
npm run dev
```

`admin:create` prints a temporary password (or uses `ADMIN_PASSWORD` if set). Without `S3_BUCKET`, uploads are stored in `.data/storage`; without SES settings, enquiries are saved but not emailed.

## Deploying to Vercel

1. **Neon:** create a project (an AWS region near your visitors, e.g. `aws-eu-central-1`) and copy the **pooled** connection string.
2. **Bucket:** create an S3-compatible bucket (Neon Object Storage, AWS S3 or Cloudflare R2) and an access key that can read and write it. The bucket can stay private: files are served through `/media/...` and cached by Vercel.
3. **Amazon SES:** verify the sending domain (or address) in SES, request production access, and create an IAM key allowed `ses:SendEmail`.
4. **Vercel:** import the repository and add these environment variables (see `.env.example` for descriptions):
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (the live address, e.g. `https://thegatheringcof.org`), `NEXT_PUBLIC_SITE_URL` (same)
   - `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
   - `SES_REGION`, `SES_ACCESS_KEY_ID`, `SES_SECRET_ACCESS_KEY`, `SES_FROM`, `ENQUIRY_TO`
5. Deploy. The `vercel-build` script applies database migrations and then builds.
6. Once, from your computer with the production `DATABASE_URL` and bucket variables in `.env.local`: run `npm run db:seed` to load the starting content and photos, then `npm run admin:create -- "Name" email` for the first admin.

Notes:
- The build reads content from the database to pre-render pages, so `DATABASE_URL` must be set for builds.
- Preview deployments run migrations against whatever `DATABASE_URL` they are given. Give previews a Neon branch, not the production database.
- Only the production deployment is open to search engines (`robots.txt` blocks previews).

## Project layout

```
src/app/(site)/        Public pages and the enquiry form actions
src/app/admin/         Admin login and editors (server actions in (panel)/actions.ts)
src/app/media/         Serves uploaded files from the bucket
src/lib/db/            Drizzle schema and connection (Neon in production, node-postgres locally)
src/lib/content/       Cached public queries, editable site copy, list definitions
src/lib/               Auth, storage (S3), email (SES), media processing
scripts/               migrate, seed, create-admin
drizzle/               SQL migrations (generate with npm run db:generate after schema changes)
legacy-php/            The previous PHP/MySQL build, kept for reference only
assets_originals/      Original photos and flyers
```
