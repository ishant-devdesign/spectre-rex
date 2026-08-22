"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  projects as projectsTable,
  signals as signalsTable,
} from "@/db/schema";
const projects = projectsTable;
const signals = signalsTable;
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/supabase/config";
import { parseBlocks, type Block } from "@/lib/blocks";
import { classifiedSlug, slugify } from "@/lib/redact";
import { createBroadcastDraft } from "@/lib/resend";
import { listPublished, toPublicEntry } from "@/lib/entries";
import { renderEntryEmail } from "@/lib/email/entryEmail";

export type EntryKind = "signal" | "project";

export interface Entry {
  id: string;
  kind: EntryKind;
  code: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  heroImage: string;
  blocks: Block[];
  status: "draft" | "published";
  classified: boolean;
  broadcastId: string | null;
  updatedAt: Date;
}

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) throw new Error("Not authorised.");
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

export async function listEntries(): Promise<{
  entries: Entry[];
  error: string | null;
}> {
  try {
    const db = getDb();
    const [signalRows, projectRows] = await Promise.all([
      db.select().from(signals).orderBy(desc(signals.updatedAt)).limit(200),
      db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(200),
    ]);

    const entries: Entry[] = [
      ...signalRows.map((row) => ({
        id: row.id,
        kind: "signal" as const,
        code: row.code,
        slug: row.slug,
        title: row.title,
        subtitle: row.subtitle ?? "",
        summary: row.excerpt ?? "",
        heroImage: row.heroImage ?? "",
        blocks: parseBlocks(row.blocks),
        status: row.status === "published" ? ("published" as const) : ("draft" as const),
        classified: row.classified,
        broadcastId: row.broadcastId ?? null,
        updatedAt: row.updatedAt,
      })),
      ...projectRows.map((row) => ({
        id: row.id,
        kind: "project" as const,
        code: row.code,
        slug: row.slug ?? "",
        /* Seeded concepts ship with a null codename on purpose -- the public
           site redacts them. Falling back to a literal here would make all
           six rows read "Untitled project"; the list renders `title || slug`
           instead so the field stays honestly empty for the editor. */
        title: row.codename ?? "",
        subtitle: row.subtitle ?? "",
        summary: row.summary ?? "",
        heroImage: row.heroImage ?? "",
        blocks: parseBlocks(row.blocks),
        status: row.status === "published" ? ("published" as const) : ("draft" as const),
        classified: row.classified,
        broadcastId: row.broadcastId ?? null,
        updatedAt: row.updatedAt,
      })),
    ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return { entries, error: null };
  } catch (error) {
    return {
      entries: [],
      error: error instanceof Error ? error.message : "Database unavailable",
    };
  }
}

export async function getEntry(
  kind: EntryKind,
  id: string,
): Promise<Entry | null> {
  const db = getDb();
  if (kind === "signal") {
    const [row] = await db.select().from(signals).where(eq(signals.id, id));
    if (!row) return null;
    return {
      id: row.id,
      kind,
      code: row.code,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle ?? "",
      summary: row.excerpt ?? "",
      heroImage: row.heroImage ?? "",
      blocks: parseBlocks(row.blocks),
      status: row.status === "published" ? "published" : "draft",
      classified: row.classified,
      broadcastId: row.broadcastId ?? null,
      updatedAt: row.updatedAt,
    };
  }
  const [row] = await db.select().from(projects).where(eq(projects.id, id));
  if (!row) return null;
  return {
    id: row.id,
    kind,
    code: row.code,
    slug: row.slug ?? "",
    title: row.codename ?? "",
    subtitle: row.subtitle ?? "",
    summary: row.summary ?? "",
    heroImage: row.heroImage ?? "",
    blocks: parseBlocks(row.blocks),
    status: row.status === "published" ? "published" : "draft",
    classified: row.classified,
    broadcastId: row.broadcastId ?? null,
    updatedAt: row.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

/**
 * Next sequential code for a kind, zero-padded to two digits.
 *
 * Codes were a timestamp fragment, which produced things like "SIGNAL 7431"
 * -- unreadable and unordered. They are author-facing identifiers, so they
 * count up. Derived from max(code) rather than count(*) so deleting an
 * entry never causes a collision with a code already in use.
 */
async function nextCode(kind: EntryKind): Promise<string> {
  const db = getDb();
  const rows =
    kind === "signal"
      ? await db.select({ code: signals.code }).from(signals)
      : await db.select({ code: projects.code }).from(projects);
  const highest = rows.reduce((max, row) => {
    const value = Number.parseInt(row.code, 10);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);
  return String(highest + 1).padStart(2, "0");
}

export async function createEntry(kind: EntryKind) {
  await assertAdmin();
  const db = getDb();
  const code = await nextCode(kind);

  if (kind === "signal") {
    const [row] = await db
      .insert(signals)
      .values({
        code,
        slug: `signal-${code}`,
        title: "Untitled signal",
        status: "draft",
      })
      .returning({ id: signals.id });
    revalidatePath("/admin/entries");
    redirect(`/admin/entries/signal/${row.id}`);
  }

  const [row] = await db
    .insert(projects)
    .values({
      code,
      slug: `project-${code}`,
      codename: "Untitled project",
      status: "draft",
    })
    .returning({ id: projects.id });
  revalidatePath("/admin/entries");
  redirect(`/admin/entries/project/${row.id}`);
}

export interface SaveInput {
  kind: EntryKind;
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  code: string;
  summary: string;
  heroImage: string;
  classified: boolean;
  status: "draft" | "published";
  blocks: Block[];
}

/**
 * Creates a draft campaign the first time an entry goes live.
 *
 * Three guards, each earning its place:
 *
 *   - Only on the draft -> published transition. Saving an already-live
 *     entry must not produce a second campaign.
 *   - Only once, tracked by broadcast_id. Belt and braces with the above,
 *     because status could be toggled back and forth.
 *   - Never for classified entries. Their copy is scrambled by the read
 *     layer, so the campaign would be gibberish announcing nothing.
 *
 * It creates a DRAFT and never sends. Publishing to the site and mailing
 * the list are separate decisions, and only one of them is reversible.
 */
async function draftCampaign(kind: EntryKind, id: string): Promise<void> {
  try {
    const entry = await getEntry(kind, id);
    if (!entry || entry.classified) return;

    const [signals, projects] = await Promise.all([
      listPublished("signal"),
      listPublished("project"),
    ]);
    const email = renderEntryEmail(
      toPublicEntry({
        id: entry.id,
        kind: entry.kind,
        code: entry.code,
        slug: entry.slug,
        title: entry.title,
        subtitle: entry.subtitle,
        summary: entry.summary,
        heroImage: entry.heroImage || null,
        blocks: entry.blocks,
        classified: entry.classified,
        dateLabel: "",
        updatedAt: entry.updatedAt,
      }),
      [...projects, ...signals].filter((m) => m.id !== entry.id),
    );

    const created = await createBroadcastDraft({
      name: `${entry.kind} ${entry.code} - ${entry.title}`.slice(0, 190),
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    if (!created.ok) {
      console.warn("[campaign] draft not created:", created.error);
      return;
    }

    const db = getDb();
    if (kind === "signal") {
      await db
        .update(signalsTable)
        .set({ broadcastId: created.id })
        .where(eq(signalsTable.id, id));
    } else {
      await db
        .update(projectsTable)
        .set({ broadcastId: created.id })
        .where(eq(projectsTable.id, id));
    }
  } catch (error) {
    /* Never fail the save. The entry is published either way, and a
       campaign that did not get drafted can be written by hand. */
    console.warn("[campaign] draft failed:", error);
  }
}

export async function saveEntry(input: SaveInput) {
  await assertAdmin();
  const db = getDb();

  /* Read the pre-save state so the publish transition can be detected. */
  const before = await getEntry(input.kind, input.id).catch(() => null);
  const goingLive =
    input.status === "published" &&
    before?.status !== "published" &&
    !before?.broadcastId &&
    !input.classified;
  /**
   * Slug is derived, never typed.
   *
   * A classified entry gets an opaque slug built from its kind and code.
   * Deriving it from the title instead would defeat the redaction entirely
   * -- /projects/dragon-reborn tells a reader exactly what the scrambled
   * headline was hiding. Both halves of that rule have to live here rather
   * than in the form, because the form is not the only caller and a client
   * can send anything.
   */
  const slug = input.classified
    ? classifiedSlug(input.kind, input.code)
    : slugify(input.title) || classifiedSlug(input.kind, input.code);
  const now = new Date();

  if (input.kind === "signal") {
    await db
      .update(signals)
      .set({
        title: input.title,
        subtitle: input.subtitle || null,
        slug,
        code: input.code,
        excerpt: input.summary || null,
        heroImage: input.heroImage || null,
        classified: input.classified,
        status: input.status,
        blocks: input.blocks,
        updatedAt: now,
      })
      .where(eq(signals.id, input.id));
  } else {
    await db
      .update(projects)
      .set({
        codename: input.title,
        subtitle: input.subtitle || null,
        slug,
        code: input.code,
        summary: input.summary || null,
        heroImage: input.heroImage || null,
        classified: input.classified,
        status: input.status,
        blocks: input.blocks,
        updatedAt: now,
      })
      .where(eq(projects.id, input.id));
  }

  revalidatePath("/admin/entries");
  revalidatePath(`/admin/entries/${input.kind}/${input.id}`);
  /* The public pages read the same rows, so a save that did not revalidate
     them would leave the live site showing the previous version. */
  revalidatePath(`/${input.kind}s`);
  revalidatePath(`/${input.kind}s/${slug}`);

  if (goingLive) await draftCampaign(input.kind, input.id);

  return { ok: true as const, slug };
}

export async function deleteEntry(kind: EntryKind, id: string) {
  await assertAdmin();
  const db = getDb();
  if (kind === "signal") {
    await db.delete(signals).where(eq(signals.id, id));
  } else {
    await db.delete(projects).where(eq(projects.id, id));
  }
  revalidatePath("/admin/entries");
  revalidatePath(`/${kind}s`);
  redirect(kind === "project" ? "/admin/projects" : "/admin/signals");
}
