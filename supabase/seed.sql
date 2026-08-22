-- =====================================================================
-- Spectre Rex Studios — seed data
--
-- Run AFTER schema.sql. Idempotent: every row is keyed on a unique
-- column and re-running updates rather than duplicating, so this is also
-- how you reset content back to the shipped baseline.
--
-- `blocks` is the editor's content model (see src/lib/blocks.ts). Each
-- element is { id, type, ... }. Types available:
--   title, subtitle, paragraph, list, table, classified, reveal,
--   image, imageGroup, video, code, quote
--
-- Classified entries below hold their REAL title, summary and body. Nothing
-- here is pre-redacted, because redaction is no longer a property of the
-- data -- src/lib/entries.ts scrambles the text on read and withholds the
-- body and hero image before they leave the server. Writing "Classified."
-- into the summary column, as this file used to, meant the panel showed the
-- author a placeholder instead of what they had written, and the scrambler
-- had nothing real to scramble.
-- =====================================================================

-- ---------------------------------------------------------------------
-- signals
-- ---------------------------------------------------------------------
insert into public.signals
  (code, slug, title, excerpt, date_label, published_on, classified, status, blocks)
values
  (
    '006',
    'we-have-a-website-now',
    'We have a website now',
    'We finally built a website. We built it ourselves, obviously.',
    '06.08.26',
    date '2026-08-06',
    false,
    'published',
    '[
      {"id":"s6b1","type":"paragraph","text":"We finally built a website. We built it ourselves, obviously."},
      {"id":"s6b2","type":"paragraph","text":"There is no game to show you yet — that is intentional. When there is, you will know."},
      {"id":"s6b3","type":"paragraph","text":"The pixel dragon is here. The grid is live. The projects are still hidden — but only because they are not finished. Patience."},
      {"id":"s6b4","type":"paragraph","text":"More soon. Probably."}
    ]'::jsonb
  ),
  (
    '005',
    'signal-005',
    'Vertical slice is playable end to end',
    'Twelve minutes of it, anyway. The traversal loop finally holds together.',
    '29.07.26',
    date '2026-07-29',
    true,
    'published',
    '[
      {"id":"s5b1","type":"paragraph","text":"The vertical slice runs start to finish without a crash, which is not the same as being good, but it is the prerequisite."},
      {"id":"s5b2","type":"paragraph","text":"Traversal was the piece we kept rebuilding. It is settled now."},
      {"id":"s5b3","type":"quote","text":"If the movement is not fun with nothing else on screen, nothing else on screen will save it.","cite":"Studio note, week 14"},
      {"id":"s5b4","type":"paragraph","text":"Next: the thing that happens when you stop moving."}
    ]'::jsonb
  )
-- Keyed on code, not slug. Both are unique, but code is the stable
-- identifier and the slug is derived from the title -- so re-seeding after
-- a title change would try to INSERT a new slug and collide on code, which
-- "on conflict (slug)" cannot catch. Projects already keyed on code; this
-- makes the two consistent.
on conflict (code) do update set
  slug             = excluded.slug,
  title            = excluded.title,
  excerpt          = excluded.excerpt,
  date_label       = excluded.date_label,
  published_on     = excluded.published_on,
  classified       = excluded.classified,
  status           = excluded.status,
  blocks           = excluded.blocks;

-- ---------------------------------------------------------------------
-- projects — visible concepts
--
-- classified = false, so these keep their hero image, their slug opens and
-- the codename reads as written.
-- ---------------------------------------------------------------------
insert into public.projects
  (code, slug, codename, summary, hero_image,
   classified, status, sort_order, blocks)
values
  (
    '01', 'monolith', 'Monolith',
    'An atmosphere study: monolithic geometry, fog, and a single seam of light.',
    '/assets/img/concept-1.jpg', false, 'published', 10,
    '[
      {"id":"p1b1","type":"paragraph","text":"An atmosphere study: monolithic geometry, fog, and a single seam of light."},
      {"id":"p1b2","type":"image","src":"/assets/img/concept-1.jpg","alt":"Monolithic structure emerging from fog","caption":"Fig. 01 — Structure study"},
      {"id":"p1b3","type":"classified","text":"Working title","blocks":10}
    ]'::jsonb
  ),
  (
    '02', 'wingspan', 'Wingspan',
    'Silhouette work. The shape came first; the story is still arguing with it.',
    '/assets/img/concept-2.jpg', false, 'published', 20,
    '[
      {"id":"p2b1","type":"paragraph","text":"Silhouette work. The shape came first; the story is still arguing with it."},
      {"id":"p2b2","type":"image","src":"/assets/img/concept-2.jpg","alt":"Winged creature dissolving into particles","caption":"Fig. 02 — Silhouette study"},
      {"id":"p2b3","type":"classified","text":"Working title","blocks":12}
    ]'::jsonb
  ),
  (
    '03', 'afterlight', 'Afterlight',
    'Environment pass: what is left standing, and what the light does to it.',
    '/assets/img/concept-3.jpg', false, 'published', 30,
    '[
      {"id":"p3b1","type":"paragraph","text":"Environment pass: what is left standing, and what the light does to it."},
      {"id":"p3b2","type":"image","src":"/assets/img/concept-3.jpg","alt":"Brutalist ruins under a dim sky","caption":"Fig. 03 — Environment study"},
      {"id":"p3b3","type":"classified","text":"Working title","blocks":9}
    ]'::jsonb
  ),
-- ---------------------------------------------------------------------
-- projects — classified entries
--
-- These carry their real codename and summary. The read layer scrambles
-- them, withholds the body and returns 404 for the slug; 06 is left as a
-- draft so the draft path is covered too.
-- ---------------------------------------------------------------------
  ('04', 'project-04', 'Tidewater', 'Water simulation that survives contact with a player.', null, true, 'published', 40,
   '[{"id":"p4b1","type":"paragraph","text":"Buoyancy, foam and shoreline behaviour that does not fall apart when a player stands in it."}]'::jsonb),
  ('05', 'project-05', 'Repeater', 'A level built entirely from one repeated room.', null, true, 'published', 50,
   '[{"id":"p5b1","type":"paragraph","text":"One room, repeated, rearranged. The interest has to come from the rearrangement."}]'::jsonb),
  ('06', 'project-06', 'Longhand', 'Handwriting as an input device. Probably a bad idea.', null, true, 'draft', 60,
   '[{"id":"p6b1","type":"paragraph","text":"Handwriting as an input device. Probably a bad idea, worth proving either way."}]'::jsonb)
on conflict (code) do update set
  slug             = excluded.slug,
  codename         = excluded.codename,
  summary          = excluded.summary,
  hero_image       = excluded.hero_image,
  classified       = excluded.classified,
  status           = excluded.status,
  sort_order       = excluded.sort_order,
  blocks           = excluded.blocks;

-- ---------------------------------------------------------------------
-- subscribers intentionally starts empty: it is filled by the newsletter
-- signup form on /contact.
-- ---------------------------------------------------------------------

select
  (select count(*) from public.signals)  as signals,
  (select count(*) from public.projects) as projects;
