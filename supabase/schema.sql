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
-- hero image
--
-- Added after the fact, so these are ALTERs rather than columns in the
-- CREATE above: the table already exists in deployed projects and
-- "create table if not exists" would skip a changed definition silently.
--
-- projects.image_path is folded into hero_image and dropped. Signals and
-- projects are the same entity with a different label; two names for one
-- concept is how the two code paths drifted apart in the first place.
-- =====================================================================
alter table public.signals  add column if not exists hero_image text;
alter table public.projects add column if not exists hero_image text;

-- The copy-then-drop has to be guarded and dynamic. A bare
--   update public.projects set hero_image = image_path
-- fails at PARSE time once the column is gone, so re-running the file after
-- a successful migration would error with 42703 -- "if exists" on the drop
-- does not help, because the statement above it never gets that far.
-- EXECUTE defers parsing until the branch is actually taken.
do $$
begin
  if exists (
    select 1
      from information_schema.columns
     where table_schema = 'public'
       and table_name   = 'projects'
       and column_name  = 'image_path'
  ) then
    execute 'update public.projects
                set hero_image = image_path
              where hero_image is null
                and image_path is not null';
    execute 'alter table public.projects drop column image_path';
  end if;
end $$;

-- =====================================================================
-- contact_messages — REMOVED
--
-- The contact form used to write here and an admin inbox read it back. Both
-- are gone: /api/contact now relays straight to the studio's Zoho group via
-- Resend, so the mail lands where the team already works instead of in a
-- table someone has to remember to open.
--
-- Dropped rather than left in place, because an unused table with an open
-- insert policy is a spam target with no one watching it.
-- =====================================================================
drop table if exists public.contact_messages;

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
alter table public.subscribers      enable row level security;

drop policy if exists "published signals are public" on public.signals;
create policy "published signals are public"
  on public.signals for select
  using (status = 'published');

drop policy if exists "published projects are public" on public.projects;
create policy "published projects are public"
  on public.projects for select
  using (status = 'published');

drop policy if exists "anyone may subscribe" on public.subscribers;
create policy "anyone may subscribe"
  on public.subscribers for insert
  with check (true);
