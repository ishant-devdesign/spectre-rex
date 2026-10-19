import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { templates } from "@/db/schema";
import { parseBlocks, type Block } from "@/lib/blocks";

export type TemplateKind = "signal" | "project" | "email";

export interface Template {
  id: string;
  name: string;
  kind: TemplateKind;
  title: string | null;
  subtitle: string | null;
  summary: string | null;
  heroImage: string | null;
  blocks: Block[];
  emailOptions: Record<string, any>;
  updatedAt: Date;
}

export async function listTemplates(kind?: TemplateKind): Promise<Template[]> {
  try {
    const db = getDb();
    const rows = kind
      ? await db.select().from(templates).where(eq(templates.kind, kind)).orderBy(desc(templates.updatedAt))
      : await db.select().from(templates).orderBy(desc(templates.updatedAt));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      kind: r.kind as TemplateKind,
      title: r.title ?? null,
      subtitle: r.subtitle ?? null,
      summary: r.summary ?? null,
      heroImage: r.heroImage ?? null,
      blocks: parseBlocks(r.blocks),
      emailOptions: (r.emailOptions as any) ?? {},
      updatedAt: r.updatedAt,
    }));
  } catch (e) {
    console.error("[templates] list failed", e);
    return [];
  }
}

export async function getTemplate(id: string): Promise<Template | null> {
  try {
    const db = getDb();
    const [row] = await db.select().from(templates).where(eq(templates.id, id));
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      kind: row.kind as TemplateKind,
      title: row.title ?? null,
      subtitle: row.subtitle ?? null,
      summary: row.summary ?? null,
      heroImage: row.heroImage ?? null,
      blocks: parseBlocks(row.blocks),
      emailOptions: (row.emailOptions as any) ?? {},
      updatedAt: row.updatedAt,
    };
  } catch {
    return null;
  }
}
