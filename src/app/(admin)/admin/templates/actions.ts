"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { templates } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/supabase/config";
import type { Block } from "@/lib/blocks";
import type { TemplateKind } from "@/lib/templates";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) throw new Error("Not authorised.");
}

export async function createTemplate(kind: TemplateKind, name: string) {
  await assertAdmin();
  const db = getDb();
  const [row] = await db
    .insert(templates)
    .values({ name: name || `Untitled ${kind} template`, kind })
    .returning({ id: templates.id });
  revalidatePath("/admin/templates");
  redirect(`/admin/templates/${row.id}`);
}

export async function saveTemplate(input: {
  id: string;
  name: string;
  kind: TemplateKind;
  title: string;
  subtitle: string;
  summary: string;
  heroImage: string;
  blocks: Block[];
}) {
  await assertAdmin();
  const db = getDb();
  await db
    .update(templates)
    .set({
      name: input.name,
      kind: input.kind,
      title: input.title || null,
      subtitle: input.subtitle || null,
      summary: input.summary || null,
      heroImage: input.heroImage || null,
      blocks: input.blocks,
      updatedAt: new Date(),
    })
    .where(eq(templates.id, input.id));
  revalidatePath("/admin/templates");
  revalidatePath(`/admin/templates/${input.id}`);
  return { ok: true };
}

export async function deleteTemplate(id: string) {
  await assertAdmin();
  const db = getDb();
  await db.delete(templates).where(eq(templates.id, id));
  revalidatePath("/admin/templates");
  redirect("/admin/templates");
}
