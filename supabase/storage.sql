-- Spectre Rex Studios -- media storage
--
-- Run this in the Supabase SQL editor AFTER schema.sql. It is idempotent:
-- re-running it is safe and changes nothing.
--
-- Creates one public bucket, `media`, that the admin editor uploads images
-- into. Video is never stored here -- video blocks embed YouTube/Vimeo, so
-- the studio never pays for the bandwidth.
--
-- NOTE: if any statement below fails with
--   ERROR: must be owner of table objects
-- your project restricts policy creation on storage.objects from the SQL
-- editor. In that case create the bucket and the four policies by hand in
-- Dashboard -> Storage, using the same names and rules described here.

-- ---------------------------------------------------------------------------
-- Bucket
-- ---------------------------------------------------------------------------
-- public = true so images are served straight off the Supabase CDN with no
-- signed URL. Anything in here is world-readable by design: it is published
-- artwork, not private data.
--
-- The size and MIME limits are enforced by Storage itself, server side. The
-- browser checks the same rules first, but that check is only a courtesy --
-- this one is the one that matters.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760, -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
-- Reads are open. Writes require an authenticated Supabase session.
--
-- Why `authenticated` is equivalent to "admin" here: the login form calls
-- signInWithOtp with shouldCreateUser:false, and users are created by hand in
-- the Supabase dashboard. There is no public signup, so the only accounts that
-- exist are the studio's own. A leaked anon key still cannot write, because
-- the anon role is not authenticated.
--
-- To tighten this to specific addresses, replace the `true` in the three write
-- policies with:
--   (auth.jwt() ->> 'email') in ('ishant@spectrerex.com', 'admin@spectrerex.com')
-- Keeping it role-based instead means the allowlist lives in exactly one place
-- (the ADMIN_EMAILS env var) rather than being duplicated into SQL that then
-- drifts out of sync.

drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  to public
  using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and true);

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and true)
  with check (bucket_id = 'media' and true);

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and true);
