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
import { slugify } from "@/lib/redact";
import { createBroadcastDraft } from "@/lib/resend";
import { listPublished } from "@/lib/entries";
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
  featured: boolean;
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
        featured: (row as any).featured ?? false,
        broadcastId: row.broadcastId ?? null,
        updatedAt: row.updatedAt,
      })),
      ...projectRows.map((row) => ({
        id: row.id,
        kind: "project" as const,
        code: row.code,
        slug: row.slug ?? "",
        title: row.codename ?? "",
        subtitle: row.subtitle ?? "",
        summary: row.summary ?? "",
        heroImage: row.heroImage ?? "",
        blocks: parseBlocks(row.blocks),
        status: row.status === "published" ? ("published" as const) : ("draft" as const),
        featured: (row as any).featured ?? false,
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
      featured: (row as any).featured ?? false,
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
    featured: (row as any).featured ?? false,
    broadcastId: row.broadcastId ?? null,
    updatedAt: row.updatedAt,
  };
}

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
  status: "draft" | "published";
  blocks: Block[];
}

export type CampaignResult =
  | { ok: true; id: string }
  | { ok: false; error: string }
  | null;

async function draftCampaign(
  kind: EntryKind,
  id: string,
): Promise<CampaignResult> {
  try {
    const entry = await getEntry(kind, id);
    if (!entry) return { ok: false, error: "Entry not found." };

    const [sigs, projs] = await Promise.all([
      listPublished("signal"),
      listPublished("project"),
    ]);
    const email = renderEntryEmail(
      {
        id: entry.id,
        kind: entry.kind,
        code: entry.code,
        slug: entry.slug,
        title: entry.title,
        subtitle: entry.subtitle,
        summary: entry.summary,
        heroImage: entry.heroImage || null,
        blocks: entry.blocks,
        dateLabel: "",
        featured: entry.featured ?? false,
        updatedAt: entry.updatedAt,
      },
      [...projs, ...sigs].filter((m) => m.id !== entry.id),
    );

    const created = await createBroadcastDraft({
      name: `${entry.kind} ${entry.code} - ${entry.title}`.slice(0, 190),
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    if (!created.ok) {
      console.warn("[campaign] draft not created:", created.error);
      return created;
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
    revalidatePath(`/admin/entries/${kind}/${id}`);
    return created;
  } catch (error) {
    console.warn("[campaign] draft failed:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function createCampaign(
  kind: EntryKind,
  id: string,
): Promise<CampaignResult> {
  await assertAdmin();
  const existing = await getEntry(kind, id);
  if (existing?.broadcastId) {
    return { ok: true, id: existing.broadcastId };
  }
  return draftCampaign(kind, id);
}

export async function saveEntry(input: SaveInput) {
  await assertAdmin();
  const db = getDb();

  const before = await getEntry(input.kind, input.id).catch(() => null);
  const goingLive =
    input.status === "published" &&
    before?.status !== "published" &&
    !before?.broadcastId;

  const slug = slugify(input.title) || `entry-${input.code}`;
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
        status: input.status,
        blocks: input.blocks,
        updatedAt: now,
      })
      .where(eq(projects.id, input.id));
  }

  revalidatePath("/admin/entries");
  revalidatePath(`/admin/entries/${input.kind}/${input.id}`);
  revalidatePath(`/${input.kind}s`);
  revalidatePath(`/${input.kind}s/${slug}`);

  const campaign = goingLive ? await draftCampaign(input.kind, input.id) : null;

  return { ok: true as const, slug, campaign };
}

export async function toggleFeatured(kind: EntryKind, id: string) {
  await assertAdmin();
  const db = getDb();
  const current = await getEntry(kind, id);
  if (!current) throw new Error("Not found");
  const willFeature = !current.featured;

  // Only one featured per kind — clear others if starring
  if (willFeature) {
    if (kind === "signal") {
      await db.update(signals).set({ featured: false }).where(eq(signals.featured, true));
    } else {
      await db.update(projects).set({ featured: false }).where(eq(projects.featured, true));
    }
  }

  if (kind === "signal") {
    await db.update(signals).set({ featured: willFeature, updatedAt: new Date() }).where(eq(signals.id, id));
  } else {
    await db.update(projects).set({ featured: willFeature, updatedAt: new Date() }).where(eq(projects.id, id));
  }

  revalidatePath("/admin/entries");
  revalidatePath(`/admin/${kind}s`);
  revalidatePath(`/${kind}s`);
  revalidatePath("/");
  return { ok: true, featured: willFeature };
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
