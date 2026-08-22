import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projects, signals } from "@/db/schema";
import { parseBlocks, type Block } from "@/lib/blocks";
import { scramble } from "@/lib/redact";

/**
 * The public read layer.
 *
 * Signals and projects are the same thing with a different label, so they
 * share one shape and one set of rules. The only asymmetry left is which
 * table a row came from and which column happens to hold its title.
 *
 * Visibility, in one place so it cannot drift between the list and the
 * detail page:
 *
 *   draft                  -> invisible everywhere
 *   published              -> listed, and its slug opens
 *   published + classified -> listed with everything redacted, slug 404s
 *
 * Redaction happens here rather than in a component, because a component
 * receives the real row and would ship it to the browser before hiding it.
 * A `PublicEntry` for a classified row simply has no plaintext in it: the
 * title is already ciphertext, the blocks are already gone.
 */

export type EntryKind = "signal" | "project";

export interface PublicEntry {
  id: string;
  kind: EntryKind;
  code: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  heroImage: string | null;
  blocks: Block[];
  classified: boolean;
  dateLabel: string;
  updatedAt: Date;
}

interface RawEntry extends Omit<PublicEntry, "blocks"> {
  blocks: Block[];
}

/* ------------------------------------------------------------------ */
/* Mapping                                                             */
/* ------------------------------------------------------------------ */

type SignalRow = typeof signals.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;

function fromSignal(row: SignalRow): RawEntry {
  return {
    id: row.id,
    kind: "signal",
    code: row.code,
    slug: row.slug,
    title: row.title ?? "",
    subtitle: row.subtitle ?? "",
    summary: row.excerpt ?? "",
    heroImage: row.heroImage ?? null,
    blocks: parseBlocks(row.blocks),
    classified: row.classified,
    dateLabel: row.dateLabel ?? "",
    updatedAt: row.updatedAt,
  };
}

function fromProject(row: ProjectRow): RawEntry {
  return {
    id: row.id,
    kind: "project",
    code: row.code,
    slug: row.slug ?? "",
    title: row.codename ?? "",
    subtitle: row.subtitle ?? "",
    summary: row.summary ?? "",
    heroImage: row.heroImage ?? null,
    blocks: parseBlocks(row.blocks),
    classified: row.classified,
    dateLabel: "",
    updatedAt: row.updatedAt,
  };
}

/**
 * The redaction boundary. Nothing from a classified row survives except its
 * kind, code, slug and shape.
 *
 * The hero image is dropped rather than blurred: a concept image is the
 * single biggest giveaway about an unannounced project, and a CSS filter is
 * removable with dev tools. The listing renders its own noise grid instead,
 * so the tile still has presence.
 */
export function toPublicEntry(entry: RawEntry): PublicEntry {
  if (!entry.classified) return entry;
  return {
    ...entry,
    title: scramble(entry.title, `${entry.id}:title`),
    subtitle: scramble(entry.subtitle, `${entry.id}:subtitle`),
    summary: scramble(entry.summary, `${entry.id}:summary`),
    dateLabel: scramble(entry.dateLabel, `${entry.id}:date`),
    heroImage: null,
    blocks: [],
  };
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

/**
 * Published entries of one kind, redacted where classified.
 *
 * Failure returns an empty list rather than throwing. A database blip
 * should degrade the page to "nothing to show", not replace the site with
 * an error -- the marketing pages around the list are still worth serving.
 */
export async function listPublished(kind: EntryKind): Promise<PublicEntry[]> {
  try {
    const db = getDb();
    if (kind === "signal") {
      const rows = await db
        .select()
        .from(signals)
        .where(eq(signals.status, "published"))
        .orderBy(desc(signals.publishedOn), desc(signals.createdAt));
      return rows.map(fromSignal).map(toPublicEntry);
    }
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.status, "published"))
      .orderBy(asc(projects.sortOrder), asc(projects.code));
    return rows.map(fromProject).map(toPublicEntry);
  } catch (error) {
    console.error(`[entries] list ${kind} failed:`, error);
    return [];
  }
}

/**
 * One entry by slug, or null.
 *
 * Null covers three different situations on purpose -- not found, still a
 * draft, and classified -- because the caller turns all three into the same
 * 404. Distinguishing them in the response would confirm that a hidden
 * entry exists at that slug, which is the thing being hidden.
 */
export async function getPublishedBySlug(
  kind: EntryKind,
  slug: string,
): Promise<PublicEntry | null> {
  try {
    const db = getDb();
    if (kind === "signal") {
      const [row] = await db
        .select()
        .from(signals)
        .where(and(eq(signals.slug, slug), eq(signals.status, "published")));
      if (!row || row.classified) return null;
      return toPublicEntry(fromSignal(row));
    }
    const [row] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.status, "published")));
    if (!row || row.classified) return null;
    return toPublicEntry(fromProject(row));
  } catch (error) {
    console.error(`[entries] get ${kind}/${slug} failed:`, error);
    return null;
  }
}

/** True when the entry has a page a visitor can actually open. */
export const isOpenable = (entry: PublicEntry): boolean => !entry.classified;

/** Neighbours for the prev/next footer on a detail page. */
export function neighbours(entries: PublicEntry[], slug: string) {
  const index = entries.findIndex((entry) => entry.slug === slug);
  if (index === -1) return { previous: null, next: null };
  /* Skip classified neighbours: linking to a page that 404s is worse than
     showing no link at all. */
  const openable = entries.filter(isOpenable);
  const position = openable.findIndex((entry) => entry.slug === slug);
  return {
    previous: position > 0 ? openable[position - 1] : null,
    next:
      position >= 0 && position < openable.length - 1
        ? openable[position + 1]
        : null,
  };
}
