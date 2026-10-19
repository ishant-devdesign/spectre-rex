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
--     projects          concept entries
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
  code              text        not null unique,
  slug              text        not null unique,
  title             text        not null,
  subtitle          text,
  excerpt           text,
  blocks            jsonb       not null default '[]'::jsonb,
  date_label        text,
  published_on      date,
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
  code              text        not null unique,
  slug              text,
  codename          text,
  subtitle          text,
  summary           text,
  hero_image        text,
  blocks            jsonb       not null default '[]'::jsonb,
  stage             text        not null default 'in_development'
                      check (stage in ('in_development', 'shipped', 'archived')),
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
-- hero image migration (legacy image_path -> hero_image)
-- =====================================================================
alter table public.signals  add column if not exists hero_image text;
alter table public.projects add column if not exists hero_image text;

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
-- broadcast_id
-- =====================================================================
alter table public.signals  add column if not exists broadcast_id text;
alter table public.projects add column if not exists broadcast_id text;

-- =====================================================================
-- featured — single highlighted entry per kind
-- =====================================================================
alter table public.signals  add column if not exists featured boolean not null default false;
alter table public.projects add column if not exists featured boolean not null default false;

-- Only one featured per kind (partial unique index)
create unique index if not exists signals_featured_unique
  on public.signals (featured) where featured = true;
create unique index if not exists projects_featured_unique
  on public.projects (featured) where featured = true;

-- =====================================================================
-- classified system — REMOVED
-- Draft system is sufficient for visibility control.
-- =====================================================================
alter table public.signals  drop column if exists classified;
alter table public.projects drop column if exists classified;
alter table public.signals  drop column if exists redaction_blocks;
alter table public.signals  drop column if exists date_redacted;
alter table public.projects drop column if exists redaction_blocks;

-- =====================================================================
-- contact_messages — REMOVED
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

create unique index if not exists subscribers_email_key
  on public.subscribers (lower(email));

-- =====================================================================
-- templates — reusable content templates for signals, projects, emails
-- =====================================================================
create table if not exists public.templates (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  kind          text        not null check (kind in ('signal','project','email')),
  title         text,
  subtitle      text,
  summary       text,
  hero_image    text,
  blocks        jsonb       not null default '[]'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at
  before update on public.templates
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Row level security
-- =====================================================================
alter table public.signals          enable row level security;
alter table public.projects         enable row level security;
alter table public.subscribers      enable row level security;
alter table public.templates        enable row level security;

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

-- templates are admin-only, no public policies (service role bypasses RLS via ownership)
