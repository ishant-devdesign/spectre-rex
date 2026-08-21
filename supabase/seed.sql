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
    'project-redacted',
    'Project',
    'The contents of this transmission are classified.',
    '██.██.26',
    null,
    true,
    'published',
    '[
      {"id":"s5b1","type":"paragraph","text":"The contents of this transmission are classified."},
      {"id":"s5b2","type":"paragraph","text":"Development continues behind closed doors."},
      {"id":"s5b3","type":"reveal","label":"Attempt access","text":"Clearance insufficient. The dragon declines to elaborate."},
      {"id":"s5b4","type":"paragraph","text":"Until then, the dragon is working."},
      {"id":"s5b5","type":"code","label":"Transmission footer","text":"— ACCESS DENIED"}
    ]'::jsonb
  )
on conflict (slug) do update set
  title            = excluded.title,
  excerpt          = excluded.excerpt,
  date_label       = excluded.date_label,
  published_on     = excluded.published_on,
  classified       = excluded.classified,
  status           = excluded.status,
  blocks           = excluded.blocks;

-- the redacted signal shows five squares after its title
update public.signals set redaction_blocks = 5, date_redacted = true
  where slug = 'project-redacted';

-- ---------------------------------------------------------------------
-- projects — visible concepts
-- ---------------------------------------------------------------------
insert into public.projects
  (code, slug, codename, summary, image_path, redaction_blocks,
   classified, status, sort_order, blocks)
values
  (
    '01', 'concept-01', null,
    'Abstract concept exploration. Not a game reveal.',
    '/assets/img/concept-1.jpg', 10, true, 'published', 10,
    '[
      {"id":"p1b1","type":"paragraph","text":"An atmosphere study: monolithic geometry, fog, and a single seam of light."},
      {"id":"p1b2","type":"image","src":"/assets/img/concept-1.jpg","alt":"Monolithic structure emerging from fog","caption":"Fig. 01 — Structure study"},
      {"id":"p1b3","type":"classified","text":"Working title","blocks":10}
    ]'::jsonb
  ),
  (
    '02', 'concept-02', null,
    'Abstract concept exploration. Not a game reveal.',
    '/assets/img/concept-2.jpg', 12, true, 'published', 20,
    '[
      {"id":"p2b1","type":"paragraph","text":"Silhouette work. The shape came first; the story is still arguing with it."},
      {"id":"p2b2","type":"image","src":"/assets/img/concept-2.jpg","alt":"Winged creature dissolving into particles","caption":"Fig. 02 — Silhouette study"},
      {"id":"p2b3","type":"classified","text":"Working title","blocks":12}
    ]'::jsonb
  ),
  (
    '03', 'concept-03', null,
    'Abstract concept exploration. Not a game reveal.',
    '/assets/img/concept-3.jpg', 9, true, 'published', 30,
    '[
      {"id":"p3b1","type":"paragraph","text":"Environment pass: what is left standing, and what the light does to it."},
      {"id":"p3b2","type":"image","src":"/assets/img/concept-3.jpg","alt":"Brutalist ruins under a dim sky","caption":"Fig. 03 — Environment study"},
      {"id":"p3b3","type":"classified","text":"Working title","blocks":9}
    ]'::jsonb
  ),
-- ---------------------------------------------------------------------
-- projects — classified entries (no imagery, drafts by design)
-- ---------------------------------------------------------------------
  ('04', 'classified-04', null, 'Classified.', null, 11, true, 'draft', 40,
   '[{"id":"p4b1","type":"classified","text":"","blocks":11}]'::jsonb),
  ('05', 'classified-05', null, 'Classified.', null,  8, true, 'draft', 50,
   '[{"id":"p5b1","type":"classified","text":"","blocks":8}]'::jsonb),
  ('06', 'classified-06', null, 'Classified.', null, 13, true, 'draft', 60,
   '[{"id":"p6b1","type":"classified","text":"","blocks":13}]'::jsonb)
on conflict (code) do update set
  slug             = excluded.slug,
  summary          = excluded.summary,
  image_path       = excluded.image_path,
  redaction_blocks = excluded.redaction_blocks,
  classified       = excluded.classified,
  status           = excluded.status,
  sort_order       = excluded.sort_order,
  blocks           = excluded.blocks;

-- ---------------------------------------------------------------------
-- contact_messages and subscribers intentionally start empty: they are
-- filled by the contact form and the mailing list.
-- ---------------------------------------------------------------------

select
  (select count(*) from public.signals)  as signals,
  (select count(*) from public.projects) as projects;
