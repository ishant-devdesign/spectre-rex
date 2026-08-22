# Spectre Rex Studios

Studio site for an independent game studio in Gurugram, India.

**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4, GSAP, Lenis, Drizzle ORM,
Supabase (Postgres + Auth), deployed on Vercel

---

## Contents

- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [1. Supabase](#1-supabase)
- [2. Email architecture](#2-email-architecture)
- [3. Admin magic links](#3-admin-magic-links)
- [4. Vercel](#4-vercel)
- [Admin panel](#admin-panel)
- [Project structure](#project-structure)
- [Known gaps](#known-gaps)

---

## Quick start

```bash
npm install
# create .env.local with the variables in the table below
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

There is no `.env.example` in the repo -- this table is the reference. Create
`.env.local` locally (it is gitignored) and set the same names on Vercel.

| Name | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Supabase **transaction pooler**, port `6543` |
| `DIRECT_DATABASE_URL` | migrations only | Direct connection, port `5432` |
| `DATABASE_POOL_MAX` | no | Connections per lambda, default `3` |
| `NEXT_PUBLIC_SUPABASE_URL` | for `/admin` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for `/admin` | Supabase anon (publishable) key |
| `ADMIN_EMAILS` | for `/admin` | Comma-separated allowlist |
| `RESEND_API_KEY` | for outbound mail | Contact form relay and audience sync |
| `RESEND_FROM` | no | Defaults to `Spectre Rex <no-reply@send.spectrerex.com>` |
| `CONTACT_TO` | no | Defaults to `hello@spectrerex.com` |
| `RESEND_ADMIN_API_KEY` | no | Full-access key, only for the campaigns list |

`NEXT_PUBLIC_SUPABASE_URL` is also read at **build** time, by `next.config.ts`, to allowlist the
Storage host for `next/image`. Set it in Vercel before the first deploy or uploaded images fail to
render.

There is deliberately **no** `SUPABASE_SERVICE_ROLE_KEY`. Nothing in the codebase reads one: server
code writes through `DATABASE_URL` and uploads go straight from the browser to Storage as the
signed-in user. A service-role key bypasses every row level security policy, so it is not worth
carrying for no gain.

### Why both Supabase keys and a DATABASE_URL?

They are two different protocols into the same Postgres, not a duplicate.
`@supabase/supabase-js` talks HTTPS to PostgREST and is used **only for auth** --
login, sessions, and storage uploads. Everything else (`signals`, `projects`,
`subscribers`) goes over the Postgres wire protocol through `pg` and Drizzle.

The reason matters: the admin panel has to read drafts and write content. Over
PostgREST that requires `SUPABASE_SERVICE_ROLE_KEY`, which bypasses every RLS
policy on every table and is catastrophic if leaked. With `DATABASE_URL` the
Postgres role owns the tables and bypasses RLS as a consequence of ownership, so
no such key needs to exist. Type safety is the secondary benefit -- `db/schema.ts`
is checked by `tsc`, whereas generated PostgREST types drift silently.

Of the three database variables, only `DATABASE_URL` is required.
`DIRECT_DATABASE_URL` is for `drizzle-kit` migrations, which are unnecessary if
`schema.sql` is run by hand in the SQL Editor -- and newer Supabase projects have
no IPv4 direct host to point it at. `DATABASE_POOL_MAX` defaults to `3` in code.

**Copy `DATABASE_URL` from Supabase -> Connect -> Transaction pooler.** The region
and the `aws-0` / `aws-1` prefix are project-specific. A wrong host fails with
`tenant/user postgres.<ref> not found` -- the pooler rejecting the handshake, not
DNS, since every pooler hostname resolves regardless of which projects live on
it. Percent-encode `@` as `%40` and `#` as `%23` in the password.

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
   - `supabase/storage.sql` -- the `media` bucket for image uploads
3. All three files are idempotent. Re-running `seed.sql` resets content to the shipped baseline.

| Table | Holds | Public read |
|---|---|---|
| `signals` | Transmissions / the archive | rows where `status = 'published'` |
| `projects` | Concept entries | rows where `status = 'published'` |
| `subscribers` | Mailing list | never -- insert only |

RLS is enabled on all four. The app's server code connects with the Postgres role from
`DATABASE_URL`, which owns the tables and so bypasses RLS -- that is what lets the admin panel read
everything while the anon key sees only published rows.

### Entries: signals and projects

One model, one renderer, one set of rules. The two differ only by `kind` and
which table they live in.

| Status | Listed | Slug opens | Title, summary, hero, body |
|---|---|---|---|
| `draft` | no | 404 | -- |
| `published` | yes | yes | as written |
| `published` + `classified` | yes | **404** | scrambled / withheld |

**Redaction happens on the server**, in `src/lib/entries.ts`. A classified
entry's real title never enters the HTML or the RSC payload, so view-source
defeats nothing. Scrambling in a component would ship the plaintext and then
hide it, which is theatre. The hero image is dropped rather than blurred: a
CSS filter is removable with dev tools, and a concept image gives away more
than a title does.

`scramble()` in `src/lib/redact.ts` maps each visible character to a cipher
glyph, preserving length and word boundaries -- `Dragon Reborn` becomes
`OQ?AGY ZCAOZ1`. It is seeded from the entry id, so the same entry always
redacts to the same string instead of flickering between requests.

**Slugs and codes are derived, never typed.** Codes count up per kind from
`max(code)`, so deleting an entry cannot cause a collision. Slugs come from
the title -- except for classified entries, which get `kind-code`. A slug
generated from the title would defeat the whole exercise:
`/projects/dragon-reborn` announces exactly what the scrambled headline was
hiding.

Classified rows are not wrapped in links anywhere. Offering a click that
dead-ends in a 404 is worse than offering none, and the prev/next footer
skips them for the same reason.

**The seed holds real content, not pre-redacted content.** It used to store
`'Classified.'` as the summary and a separate `redaction_blocks` count saying
how many squares to draw. That is gone: `redaction_blocks` and
`date_redacted` are dropped, classified rows carry their true codename and
summary, and the scrambler derives the mask from the text. A stored count
could disagree with the string it was covering, and the author saw a
placeholder in the panel instead of what they had written.

The seed is keyed on `code` for both kinds. Slug and code are both unique,
but the slug is derived from the title, so re-seeding after a title change
would try to insert a new slug and collide on code -- which
`on conflict (slug)` cannot catch.

`EntryArticle` is rendered by the public detail page **and** by the admin
preview, through the same `toPublicEntry()` boundary. Preview used to be a
separate 760px article, so authors were shown something no reader would ever
see; a classified draft now previews as scrambled, because that is what ships.

### Inline formatting

Block text supports five tags: `<b>`, `<i>`, `<u>`, `<code>` and `<reveal>`.
They nest, and an unclosed tag runs to the end of the string rather than
swallowing the document.

`src/components/content/RichText.tsx` is a **parser, not a sanitiser**. It
tokenises that fixed vocabulary into React elements; anything else is literal
text. No `dangerouslySetInnerHTML` is involved, so a `<script>`, an
`onerror` attribute or a `javascript:` href written into a block renders as
visible characters and cannot execute -- verified against all three.

Paragraphs carry a `size` of `sm`, `base`, `lg` or `lead`. `lead` is the
oversized opener, so an author can start big without using a heading and
lying to screen readers about the document outline.

### Title, subtitle, summary

Three distinct fields with three distinct jobs:

| Field | Where it renders |
|---|---|
| Title | the headline |
| Subtitle | directly under the headline, qualifying it |
| Summary | opening the body at lead size, above the blocks |

Summary is not hero copy. It is the standing introduction to the piece, so
it sits with the prose it introduces.

Every entry closes with an end-of-transmission rule. Classified entries
render a fixed stand-in body -- held in the component, not the database, so
the author's editor shows their actual draft rather than a placeholder.

### Newsletter and contact

Two public endpoints, both stateless apart from one table:

| Route | Does | Needs |
|---|---|---|
| `POST /api/contact` | Relays the form to `CONTACT_TO` via Resend | `RESEND_API_KEY` |
| `POST /api/subscribe` | Inserts into `subscribers`, then syncs to Resend contacts | `DATABASE_URL`; Resend optional |

Both carry a honeypot field and answer `200` when it is filled, so bots learn
nothing from the response.

The contact relay puts the visitor's address in **Reply-To**, never in `From`.
Sending as an arbitrary third party breaks DKIM alignment and is the exact
pattern spam filters penalise; replying from Zoho still reaches them.

Signup is **single opt-in** -- no confirmation email. Re-subscribing is not an
error: the insert is `on conflict (lower(email)) do nothing`, matching the
case-insensitive unique index. The Postgres row is the record of who
subscribed and the Resend audience is a cache of it, so a failed sync is
logged and ignored rather than shown to the visitor.

`confirmed` and `confirmed_at` exist on the table but are unused, so double
opt-in can be switched on later without a migration.

**Campaigns are composed in the Resend dashboard**, not in `/admin`. Resend
already provides an editor, test sends, scheduling and open/click stats;
rebuilding that inside the panel would be the most expensive piece of the
whole system and worse than what it replaced.

`/admin/campaigns` lists them read-only -- subject, status and sent date,
each linking through to Resend, plus a button to the composer. What was
missing was visibility, not an editor. It degrades in three steps: no API key
says so plainly, an API error surfaces the message, and an empty list says
nothing has been sent.

### Media and uploads

`supabase/storage.sql` creates one public bucket, `media`, limited to 10 MB image
files. The admin editor's image blocks upload into it: pick or drag a file and the
block's `src` is filled in with the resulting public URL.

Two kinds of value are valid in an image block, and both keep working:

| Value | Where it lives |
|---|---|
| `/assets/img/hero.jpg` | committed to `public/` in this repo |
| `https://<ref>.supabase.co/storage/...` | uploaded through `/admin` |

Uploads go from the browser **straight to Supabase**, never through the Next
server. That is deliberate: Vercel caps serverless request bodies at 4.5 MB, so
proxying a 10 MB image through an API route would fail at exactly the sizes
photographs arrive at.

Writes require an authenticated Supabase session; reads are open. Since there is
no public signup (`shouldCreateUser: false`, users created by hand), the only
accounts that can write are the studio's own. A leaked anon key cannot upload.

**Video needs no bucket.** Video blocks take a YouTube or Vimeo URL and render an
iframe, so the studio never pays to serve it. Hosting video on the free tier's
1 GB storage and 5 GB monthly egress would not survive one trailer.

`next.config.ts` must allow the Supabase hostname or `next/image` throws
`hostname is not configured`. It reads `NEXT_PUBLIC_SUPABASE_URL`, which therefore
has to be set at **build** time on Vercel, not just at runtime.

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

## 2. Email architecture

Three systems, each doing one job. Step-by-step DNS and console instructions are
in [MAIL-SETUP.md](MAIL-SETUP.md); this section is the reasoning.
 Nothing here blocks a deploy -- the site runs
without any of it -- but this is the target shape.

| Job | System | Cost |
|---|---|---|
| Team mailboxes, inbound role addresses | Zoho Mail Forever Free | 0 |
| `support@` tickets, assigned by HR | Zoho Desk Free | 0 |
| Subscriber campaigns, transactional | Resend | 0 to 1,000 contacts |
| Admin magic links | Supabase built-in -> Gmail | 0 |

### 2.1 Zoho Mail -- mailboxes and groups

1. Sign up for the [Forever Free plan](https://www.zoho.com/mail/zohomail-pricing.html)
   (Zoho Workplace pricing page, scroll to "Forever Free"). Cap: **5 users**, one
   domain, webmail and mobile app only.
2. Add `spectrerex.com` and verify it. Point the domain's **MX records** at Zoho.
3. Create one **user** per team member. Four people = four of the five seats.
4. Create the role addresses as **groups**, not aliases:
   **Admin Console -> Groups -> Create Group**.

| Group | Members | Published? |
|---|---|---|
| `hello@` | founders | yes -- site-wide, and the campaign From address |
| `support@` | HR (feeds Zoho Desk) | yes |
| `press@` | founders | yes |
| `work@` | founders | yes |
| `team@` | everyone | **no -- internal only** |

Groups, not aliases, for all five. An alias points at exactly one mailbox; a
group has a membership list you edit later. Onboarding becomes "add to two
groups" and offboarding becomes "remove from three", instead of hunting through
per-user alias config. Free allows 30 groups and they do **not** consume user
seats. Aliases still exist for one-human cases at
**Users -> [user] -> Mail Settings -> Email Alias** (30 per mailbox).

`team@` must never appear on the website. A published internal address means
cold pitches land in every inbox, and puts one Reply All between an internal
thread and an outsider.

**Free plan limits that will eventually bite:** no IMAP/POP/SMTP, no email
forwarding, 5 users. The sixth hire forces every seat onto Mail Lite
(~INR 59/user/month).

### 2.2 Zoho Desk -- support tickets

"HR assigns the ticket, the assignee replies privately" is a helpdesk, not a
shared inbox. A shared inbox has no ownership, no status, and lets two people
reply at once.

1. Create a [Zoho Desk](https://www.zoho.com/desk/) account -- **Free plan, 3
   agents, no time limit**, email ticketing included.
2. Add `support@spectrerex.com` as the support channel and follow the forwarding
   or MX instructions Desk gives you.
3. HR triages and assigns; the assignee replies from inside the ticket.

Free has no automation and caps at 3 agents. Express is ~USD 7/agent/month after
that.

### 2.3 Resend -- subscribers and campaigns

**Use a subdomain.** Verify `send.spectrerex.com` in Resend, not the root domain.
Zoho keeps the root MX for inbound. If a campaign ever gets spam-flagged, the
damage is contained to the subdomain and the team's day-to-day mail is untouched.

1. Create a [Resend](https://resend.com) account and add the domain
   `send.spectrerex.com`.
2. Add the **DKIM and SPF records** Resend shows you, plus a **DMARC** record.
   Since February 2024 Gmail and Yahoo require all three from bulk senders -- this
   is an entry requirement, not a best practice.
4. Set `RESEND_API_KEY` in `.env.local` and Vercel. Contacts are account-level
   in Resend's current API -- `POST /contacts` takes neither an audience nor a
   segment id, so there is nothing else to configure.

Campaigns are composed in `/admin`, not by emailing an address. The admin panel
already has an authenticated 12-block editor and a preview route, so a compose
page gives preview, test send, recipient count and a draft state. An
email-to-broadcast trigger has none of that, and anyone who spoofs the From
header could reach the whole list.

Resend injects `{{{RESEND_UNSUBSCRIBE_URL}}}` into broadcasts, so one-click
unsubscribe -- also mandatory under the same bulk-sender rules -- is handled.

**Signup is single opt-in** by design: the form takes an address and the person
is subscribed, no confirmation email. The tradeoffs are absorbed elsewhere -- a
honeypot field and per-IP rate limit on the form, and the sending subdomain
quarantining reputation.

> **One SPF record per hostname.** A hostname may have exactly one `v=spf1` TXT
> record. Zoho's lives on the root; Resend's lives on `send.` -- they do not
> collide. Only if you later send from the root as well would you merge them:
> `v=spf1 include:zoho.com include:_spf.resend.com ~all`

---

## 3. Admin magic links

**Current setup: no SMTP configured.** Magic links go to a Gmail address through
Supabase's built-in sender, which works because of a rule worth understanding:
without custom SMTP, Supabase Auth refuses to deliver to any address that is not
a member of the project's Supabase organisation. The account owner is
`ishant.devdesign@gmail.com`, and that is the only address in `ADMIN_EMAILS`.

Two limits:

- **2 emails per hour, project-wide.** Requesting three links in a row means the
  third is silently never sent, with no client-side error.
- **Team members only.** Adding a `@spectrerex.com` address to `ADMIN_EMAILS`
  will not work until that address joins the Supabase organisation, or custom
  SMTP is configured.

Custom SMTP becomes necessary when a non-Gmail address needs to log in, or links
should come from the studio's domain. It also raises the limit to 30/hour.
Configure under **Authentication -> SMTP Settings**. The Zoho free plan cannot
provide it (no SMTP); point it at Resend instead, reusing the account from 2.3.

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

| Route | Purpose |
|---|---|
| `/admin/projects` | List, create, edit and delete projects |
| `/admin/signals` | List, create, edit and delete signals |
| `/admin/campaigns` | Read-only list of Resend broadcasts |
| `/admin/entries/<kind>/<id>` | Block editor for one entry |
| `/admin/entries/<kind>/<id>/preview` | Renders through the public component |
| `/admin/login` | Magic-link sign-in |

`/admin` and `/admin/entries` both redirect to `/admin/projects`; they are kept as routes because
middleware, the login form's `next` parameter and existing bookmarks point at them.

All of it lives in the `(admin)` route group, so it inherits none of the site chrome: no nav,
footer, smooth scroll, page transition or first-load intro.

**There is no inbox, and nothing to check.** `/api/contact` relays submissions straight to
`CONTACT_TO` through Resend, so they land in the Zoho group the team already reads. The
`contact_messages` table has been dropped -- an unused table with an open insert policy is a spam
target nobody is watching.

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

Image and image-group blocks accept a drag-and-drop upload as well as a typed path; see
[Media and uploads](#media-and-uploads).

Deleting is two-step in the list -- the trash icon arms a Cancel/Confirm pair rather than firing on
one click, because it sits next to Edit in a dense row. A native `confirm()` is not used: it is
blocked in some embedded browsers and cannot be styled.

Seeded projects have a null `codename` on purpose, since the public site redacts them. The list
shows `slug (unnamed)` in italics for those rather than a shared placeholder, so six classified
concepts remain distinguishable.

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
  lib/               block model, media helpers, Supabase clients, hooks
supabase/
  schema.sql         tables, RLS, triggers
  seed.sql           current content
  storage.sql        media bucket + storage policies
```

---

## Known gaps

- **The public pages still read `src/data/content.ts`.** Published entries do not appear on the live
  site yet -- pointing `/signals` and `/projects` at the database is the next step. The renderer,
  schema and seed data are all in place for it.
- **Images are AI-generated placeholders** in `public/assets/img/`. Swap them for real art; the
  paths and aspect handling stay the same.
- **Subscriber mail is not built.** The `subscribers` table exists but nothing writes to it, there
  is no signup form, and no broadcast composer in `/admin`. Section 2.3 is the plan, not the state.
- **`npm run lint`** reports five pre-existing `react-hooks` warnings in `SmoothScroll`, `Marquee`
  and `lib/hooks.ts`. They do not block the build.
