# Spectre Rex Studios

Studio site for an independent game studio in Gurugram, India.

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, GSAP, Lenis, Drizzle ORM,
Supabase (Postgres + Auth), deployed on Vercel

---

## Contents

- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [1. Supabase](#1-supabase)
- [2. Zoho Mail](#2-zoho-mail)
- [3. Sending auth email](#3-sending-auth-email)
- [4. Vercel](#4-vercel)
- [Admin panel](#admin-panel)
- [Project structure](#project-structure)
- [Known gaps](#known-gaps)

---

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in the values below
npm run dev                    # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build -- what Vercel runs |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

---

## Environment variables

| Name | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Supabase **transaction pooler**, port `6543` |
| `DIRECT_DATABASE_URL` | migrations only | Direct connection, port `5432` |
| `DATABASE_POOL_MAX` | no | Connections per lambda, default `3` |
| `NEXT_PUBLIC_SUPABASE_URL` | for `/admin` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for `/admin` | Supabase anon (publishable) key |
| `ADMIN_EMAILS` | for `/admin` | Comma-separated allowlist |

Use the **pooler** string on Vercel. Every serverless invocation opens its own pool and the direct
5432 connection runs out of Postgres slots quickly. Migrations are the exception -- `drizzle-kit`
needs a direct connection, which is why `drizzle.config.ts` prefers `DIRECT_DATABASE_URL`.

Nothing touches the database at build time: `src/db/index.ts` creates its pool lazily, so a missing
`DATABASE_URL` degrades `/api/health` instead of failing the build.

---

## 1. Supabase

### Create the database

1. Create a project at [supabase.com](https://supabase.com). Save the database password.
2. Open **SQL Editor** and run, in order:
   - `supabase/schema.sql` -- tables, indexes, triggers, row level security
   - `supabase/seed.sql` -- the studio's current content
3. Both files are idempotent. Re-running `seed.sql` resets content to the shipped baseline.

| Table | Holds | Public read |
|---|---|---|
| `signals` | Transmissions / the archive | rows where `status = 'published'` |
| `projects` | Concept entries | rows where `status = 'published'` |
| `contact_messages` | Contact form submissions | never -- insert only |
| `subscribers` | Mailing list | never -- insert only |

RLS is enabled on all four. The app's server code connects with the Postgres role from
`DATABASE_URL`, which owns the tables and so bypasses RLS -- that is what lets the admin panel read
everything while the anon key sees only published rows.

### Connection strings

**Project settings -> Database -> Connection string**

- `DATABASE_URL` -> **Transaction pooler**, port `6543`
- `DIRECT_DATABASE_URL` -> **Direct connection**, port `5432`

### Auth

1. **Authentication -> Providers -> Email**: enable it. Leave "Confirm email" on.
2. **Authentication -> URL Configuration**:
   - Site URL: `https://spectrerex.com`
   - Redirect URLs: `https://spectrerex.com/auth/callback` and your Vercel preview URL with the
     same path.
3. **Authentication -> Users -> Add user** -- create one for each admin address
   (`ishant@spectrerex.com`, `admin@spectrerex.com`). The login screen runs with
   `shouldCreateUser: false`, so only users that already exist can sign in.
4. Put the same addresses in `ADMIN_EMAILS`.

---

## 2. Zoho Mail

Zoho handles **receiving** mail for the domain.

1. Sign up for the [Zoho Mail Forever Free plan](https://www.zoho.com/mail/zohomail-pricing.html)
   (on the Zoho Workplace pricing page -- scroll to "Forever Free").
2. Add the domain `spectrerex.com` and verify it.
3. Create the user `ishant@spectrerex.com`.
4. Add `admin@` and `support@` as **aliases** on that account rather than separate users -- aliases
   are unlimited and do not consume one of the five free mailboxes.
5. Point the domain's **MX records** at Zoho as instructed during setup.

**Free plan limits:** webmail and the Zoho apps only. IMAP, POP, SMTP, email forwarding and
ActiveSync are paid-only, which matters for the next section.

---

## 3. Sending auth email

> **The Zoho free plan cannot send the magic-link emails.** Zoho removed SMTP from the free tier,
> so there is no relay to give Supabase. This is the one part of the setup that needs a decision.

Supabase's built-in email sender is rate-limited to a handful of messages per hour and is not
intended for production, so pick one:

**Option A -- Zoho Mail Lite** (~INR 59/user/month)
Unlocks SMTP. In Supabase, **Project settings -> Auth -> SMTP Settings**:

```
Host: smtp.zoho.com     Port: 465     Username: ishant@spectrerex.com
Password: an app-specific password from accounts.zoho.com -> Security -> App passwords
Sender: admin@spectrerex.com
```

**Option B -- a transactional provider** (Resend, Postmark, Brevo, SendGrid)
Free tiers cover magic links comfortably. Verify `spectrerex.com` with the provider, then use its
SMTP credentials in the same Supabase screen with `From: admin@spectrerex.com`.

Sending and receiving are independent. Keep Zoho's MX records for inbound mail and add the sending
provider's SPF and DKIM records alongside them.

> **One SPF record only.** A domain may have exactly one `v=spf1` TXT record. If you send through a
> second provider, extend the existing record rather than adding another:
> `v=spf1 include:zoho.com include:_spf.resend.com ~all`

---

## 4. Vercel

1. Push this repository to GitHub.
2. In Vercel, **Add New -> Project** and import it. The Next.js preset is detected automatically --
   no build settings need changing.
3. **Settings -> Environment Variables** -- add every variable from the table above for Production,
   Preview and Development.
4. Deploy.
5. **Settings -> Domains** -- add `spectrerex.com` and follow the DNS instructions. Adding the domain
   affects A/CNAME records only; it does not disturb the MX records pointing at Zoho.
6. Confirm the deployment: visit `/api/health`, which returns `{"ok":true,"database":"up"}` when
   `DATABASE_URL` is correct.

---

## Admin panel

`/admin` -- inbox for contact form submissions, with counts, an open/handled filter and one-click
reply.
`/admin/entries` -- content editor for signals and projects.
`/admin/login` -- magic-link sign-in.

Both live in the `(admin)` route group, so they inherit none of the site chrome: no nav, footer,
smooth scroll, page transition or first-load intro.

### Access control

`ADMIN_EMAILS` is the real gate, not the magic link -- anyone can ask Supabase for a link, so the
allowlist is checked in four places:

1. The login form runs `signInWithOtp` with `shouldCreateUser: false`.
2. `/auth/callback` verifies the email after the code exchange and signs out anything unlisted.
3. `middleware.ts` re-checks on every `/admin` request.
4. Each server action re-checks before writing -- middleware is routing, not authorisation.

With Supabase unconfigured the middleware **fails closed**: `/admin` redirects to the login screen,
which explains what is missing. An unconfigured deploy cannot expose the panel.

### Content editor

Entries are built from typed blocks stored as JSONB. Twelve types are available:

| | | |
|---|---|---|
| Title | Subtitle | Paragraph |
| List | Table | Quote |
| Classified | Click to reveal | Highlighted |
| Image | Image group | Video |

Each entry is a draft or published, and has a preview route that renders through the same component
the public site uses. The model lives in `src/lib/blocks.ts` -- add a variant there and the editor,
renderer and actions are all type-checked against it.

---

## Project structure

```
src/
  app/
    (site)/          public pages -- chrome, transitions, intro
    (admin)/         admin panel -- no site chrome
    api/             contact + health endpoints
    auth/            magic-link callback and sign-out
  components/
    admin/           panel UI
    content/         block renderer, shared by site and preview
    transition/      pixel transition + first-load intro
    ...
  db/                Drizzle schema and lazy pool
  lib/               block model, Supabase clients, hooks
supabase/
  schema.sql         tables, RLS, triggers
  seed.sql           current content
```

---

## Known gaps

- **The public pages still read `src/data/content.ts`.** Published entries do not appear on the live
  site yet -- pointing `/signals` and `/projects` at the database is the next step. The renderer,
  schema and seed data are all in place for it.
- **Images are AI-generated placeholders** in `public/assets/img/`. Swap them for real art; the
  paths and aspect handling stay the same.
- **`npm run lint`** reports five pre-existing `react-hooks` warnings in `SmoothScroll`, `Marquee`
  and `lib/hooks.ts`. They do not block the build.
