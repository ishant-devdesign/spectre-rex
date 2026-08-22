"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { projects, signals } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/supabase/config";
import { parseBlocks, type Block } from "@/lib/blocks";

export type EntryKind = "signal" | "project";

export interface Entry {
  id: string;
  kind: EntryKind;
  code: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  blocks: Block[];
  status: "draft" | "published";
  classified: boolean;
  updatedAt: Date;
}

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) throw new Error("Not authorised.");
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

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
        blocks: parseBlocks(row.blocks),
        status: row.status === "published" ? ("published" as const) : ("draft" as const),
        classified: row.classified,
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
        blocks: parseBlocks(row.blocks),
        status: row.status === "published" ? ("published" as const) : ("draft" as const),
        classified: row.classified,
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
      blocks: parseBlocks(row.blocks),
      status: row.status === "published" ? "published" : "draft",
      classified: row.classified,
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
    blocks: parseBlocks(row.blocks),
    status: row.status === "published" ? "published" : "draft",
    classified: row.classified,
    updatedAt: row.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

export async function createEntry(kind: EntryKind) {
  await assertAdmin();
  const db = getDb();
  const stamp = Date.now().toString().slice(-4);

  if (kind === "signal") {
    const [row] = await db
      .insert(signals)
      .values({
        code: stamp,
        slug: `untitled-${stamp}`,
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
      code: stamp,
      slug: `untitled-${stamp}`,
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
  classified: boolean;
  status: "draft" | "published";
  blocks: Block[];
}

export async function saveEntry(input: SaveInput) {
  await assertAdmin();
  const db = getDb();
  const slug = slugify(input.slug || input.title) || `entry-${Date.now()}`;
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
        classified: input.classified,
        status: input.status,
        blocks: input.blocks,
        updatedAt: now,
      })
      .where(eq(projects.id, input.id));
  }

  revalidatePath("/admin/entries");
  revalidatePath(`/admin/entries/${input.kind}/${input.id}`);
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
  redirect("/admin/entries");
}
