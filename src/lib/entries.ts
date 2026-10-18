import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projects, signals } from "@/db/schema";
import { parseBlocks, type Block } from "@/lib/blocks";

/**
 * Public read layer — simplified: draft vs published only.
 * Classified system removed, draft system is sufficient.
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
  dateLabel: string;
  updatedAt: Date;
}

interface RawEntry extends Omit<PublicEntry, "blocks"> {
  blocks: Block[];
}

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
    dateLabel: "",
    updatedAt: row.updatedAt,
  };
}

export async function listPublished(kind: EntryKind): Promise<PublicEntry[]> {
  try {
    const db = getDb();
    if (kind === "signal") {
      const rows = await db
        .select()
        .from(signals)
        .where(eq(signals.status, "published"))
        .orderBy(desc(signals.publishedOn), desc(signals.createdAt));
      return rows.map(fromSignal);
    }
    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.status, "published"))
      .orderBy(asc(projects.sortOrder), asc(projects.code));
    return rows.map(fromProject);
  } catch (error) {
    console.error(`[entries] list ${kind} failed:`, error);
    return [];
  }
}

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
      if (!row) return null;
      return fromSignal(row);
    }
    const [row] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.status, "published")));
    if (!row) return null;
    return fromProject(row);
  } catch (error) {
    console.error(`[entries] get ${kind}/${slug} failed:`, error);
    return null;
  }
}

export function neighbours(entries: PublicEntry[], slug: string) {
  const index = entries.findIndex((entry) => entry.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: index > 0 ? entries[index - 1] : null,
    next: index < entries.length - 1 ? entries[index + 1] : null,
  };
}
