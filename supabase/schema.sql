-- =====================================================================
-- Spectre Rex Studios — database schema
--
-- Run this once in the Supabase SQL editor (or with psql against the
-- DIRECT connection on port 5432). It is idempotent: re-running is safe
-- and will not duplicate or destroy anything.
--
-- Then run seed.sql to load the studio's current content.
--
--   Tables
--     signals           transmissions / the public archive
--     projects          concept entries, published and classified
--     contact_messages  inbound from the contact form
--     subscribers       mailing list
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- signals
-- =====================================================================
create table if not exists public.signals (
  id                uuid primary key default gen_random_uuid(),
  -- display code shown in the UI, e.g. '006'
  code              text        not null unique,
  slug              text        not null unique,
  title             text        not null,
  subtitle          text,
  excerpt           text,
  -- editor content: ordered array of typed blocks (see src/lib/blocks.ts)
  blocks            jsonb       not null default '[]'::jsonb,
  -- how many redaction squares follow the title (0 = none)
  redaction_blocks  smallint    not null default 0 check (redaction_blocks >= 0),
  -- literal label rendered in the list, e.g. '06.08.26'
  date_label        text,
  date_redacted     boolean     not null default false,
  published_on      date,
  classified        boolean     not null default false,
  status            text        not null default 'draft'
                      check (status in ('draft', 'published')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists signals_status_idx
  on public.signals (status, published_on desc nulls last);

drop trigger if exists signals_set_updated_at on public.signals;
create trigger signals_set_updated_at
  before update on public.signals
  for each row execute function public.set_updated_at();

-- =====================================================================
-- projects
-- =====================================================================
create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  code              text        not null unique,        -- '01', '02', ...
  slug              text,
  codename          text,                               -- null while redacted
  subtitle          text,
  summary           text,
  -- path under /public, e.g. '/assets/img/concept-1.jpg'
  image_path        text,
  blocks            jsonb       not null default '[]'::jsonb,
  redaction_blocks  smallint    not null default 0 check (redaction_blocks >= 0),
  -- lifecycle, distinct from the publish status below
  stage             text        not null default 'in_development'
                      check (stage in ('in_development', 'shipped', 'archived')),
  classified        boolean     not null default true,
  status            text        not null default 'draft'
                      check (status in ('draft', 'published')),
  sort_order        integer     not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index if not exists projects_slug_key
  on public.projects (slug) where slug is not null;
create index if not exists projects_status_idx
  on public.projects (status, sort_order);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- =====================================================================
-- contact_messages — written by /api/contact
-- =====================================================================
create table if not exists public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  channel      text        not null default 'general'
                 check (channel in ('general', 'press', 'business')),
  name         text,
  email        text        not null check (position('@' in email) > 1),
  subject      text,
  message      text        not null check (char_length(message) between 1 and 5000),
  source_path  text,
  user_agent   text,
  handled      boolean     not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);
create index if not exists contact_messages_unhandled_idx
  on public.contact_messages (handled, created_at desc) where not handled;

-- =====================================================================
-- subscribers
-- =====================================================================
create table if not exists public.subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text        not null check (position('@' in email) > 1),
  source        text,
  confirmed     boolean     not null default false,
  confirmed_at  timestamptz,
  created_at    timestamptz not null default now()
);

-- case-insensitive uniqueness without needing the citext extension
create unique index if not exists subscribers_email_key
  on public.subscribers (lower(email));

-- =====================================================================
-- Row level security
--
-- Supabase exposes these tables over PostgREST with the anon key, so RLS
-- is not optional. Published rows are publicly readable; the two write
-- tables accept inserts but are never readable from the client.
--
-- The app's server code connects with the Postgres role from
-- DATABASE_URL, which owns these tables and therefore bypasses RLS —
-- that is what lets the admin panel read everything.
-- =====================================================================
alter table public.signals          enable row level security;
alter table public.projects         enable row level security;
alter table public.contact_messages enable row level security;
alter table public.subscribers      enable row level security;

drop policy if exists "published signals are public" on public.signals;
create policy "published signals are public"
  on public.signals for select
  using (status = 'published');

drop policy if exists "published projects are public" on public.projects;
create policy "published projects are public"
  on public.projects for select
  using (status = 'published');

drop policy if exists "anyone may send a message" on public.contact_messages;
create policy "anyone may send a message"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "anyone may subscribe" on public.subscribers;
create policy "anyone may subscribe"
  on public.subscribers for insert
  with check (true);
