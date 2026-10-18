-- =====================================================================
-- Spectre Rex Studios — seed data
-- Run AFTER schema.sql. Idempotent: keyed on code.
-- Blocks: title, subtitle, paragraph, list, table, reveal, image,
--         imageGroup, video, code, quote
-- Draft system controls visibility — no classified system.
-- =====================================================================

insert into public.signals
  (code, slug, title, excerpt, date_label, published_on, status, blocks)
values
  (
    '006',
    'we-have-a-website-now',
    'We have a website now',
    'We finally built a website. We built it ourselves, obviously.',
    '06.08.26',
    date '2026-08-06',
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
    'vertical-slice-is-playable-end-to-end',
    'Vertical slice is playable end to end',
    'Twelve minutes of it, anyway. The traversal loop finally holds together.',
    '29.07.26',
    date '2026-07-29',
    'published',
    '[
      {"id":"s5b1","type":"paragraph","text":"The vertical slice runs start to finish without a crash, which is not the same as being good, but it is the prerequisite."},
      {"id":"s5b2","type":"paragraph","text":"Traversal was the piece we kept rebuilding. It is settled now."},
      {"id":"s5b3","type":"quote","text":"If the movement is not fun with nothing else on screen, nothing else on screen will save it.","attribution":"Studio note, week 14"},
      {"id":"s5b4","type":"paragraph","text":"Next: the thing that happens when you stop moving."}
    ]'::jsonb
  )
on conflict (code) do update set
  slug             = excluded.slug,
  title            = excluded.title,
  excerpt          = excluded.excerpt,
  date_label       = excluded.date_label,
  published_on     = excluded.published_on,
  status           = excluded.status,
  blocks           = excluded.blocks;

insert into public.projects
  (code, slug, codename, summary, hero_image, status, sort_order, blocks)
values
  (
    '01', 'monolith', 'Monolith',
    'An atmosphere study: monolithic geometry, fog, and a single seam of light.',
    '/assets/img/concept-1.jpg', 'published', 10,
    '[
      {"id":"p1b1","type":"paragraph","text":"An atmosphere study: monolithic geometry, fog, and a single seam of light."},
      {"id":"p1b2","type":"image","src":"/assets/img/concept-1.jpg","alt":"Monolithic structure emerging from fog","caption":"Fig. 01 — Structure study"}
    ]'::jsonb
  ),
  (
    '02', 'wingspan', 'Wingspan',
    'Silhouette work. The shape came first; the story is still arguing with it.',
    '/assets/img/concept-2.jpg', 'published', 20,
    '[
      {"id":"p2b1","type":"paragraph","text":"Silhouette work. The shape came first; the story is still arguing with it."},
      {"id":"p2b2","type":"image","src":"/assets/img/concept-2.jpg","alt":"Winged creature dissolving into particles","caption":"Fig. 02 — Silhouette study"}
    ]'::jsonb
  ),
  (
    '03', 'afterlight', 'Afterlight',
    'Environment pass: what is left standing, and what the light does to it.',
    '/assets/img/concept-3.jpg', 'published', 30,
    '[
      {"id":"p3b1","type":"paragraph","text":"Environment pass: what is left standing, and what the light does to it."},
      {"id":"p3b2","type":"image","src":"/assets/img/concept-3.jpg","alt":"Brutalist ruins under a dim sky","caption":"Fig. 03 — Environment study"}
    ]'::jsonb
  ),
  (
    '04', 'longhand', 'Longhand',
    'Handwriting as an input device. Probably a bad idea, worth proving either way.',
    '/assets/img/concept-3.jpg', 'published', 40,
    '[
      {"id":"p4b1","type":"paragraph","text":"Handwriting as an input device. Probably a bad idea, worth proving either way."}
    ]'::jsonb
  )
on conflict (code) do update set
  slug             = excluded.slug,
  codename         = excluded.codename,
  summary          = excluded.summary,
  hero_image       = excluded.hero_image,
  status           = excluded.status,
  sort_order       = excluded.sort_order,
  blocks           = excluded.blocks;

select
  (select count(*) from public.signals)  as signals,
  (select count(*) from public.projects) as projects;
