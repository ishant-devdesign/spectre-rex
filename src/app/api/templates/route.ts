import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { templates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/supabase/config";
import { parseBlocks } from "@/lib/blocks";

export const dynamic = "force-dynamic";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) throw new Error("Not authorised");
}

export async function GET(request: NextRequest) {
  try {
    await assertAdmin();
    const kind = request.nextUrl.searchParams.get("kind");
    const db = getDb();
    const rows = kind
      ? await db.select().from(templates).where(eq(templates.kind, kind)).orderBy(desc(templates.updatedAt))
      : await db.select().from(templates).orderBy(desc(templates.updatedAt));
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        name: r.name,
        kind: r.kind,
        title: r.title,
        subtitle: r.subtitle,
        summary: r.summary,
        heroImage: r.heroImage,
        blocks: parseBlocks(r.blocks),
        updatedAt: r.updatedAt,
      })),
    );
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertAdmin();
    const body = await request.json();
    const { name, kind, title, subtitle, summary, heroImage, blocks } = body;
    if (!name || !kind) {
      return NextResponse.json({ error: "name and kind required" }, { status: 400 });
    }
    const db = getDb();
    const [row] = await db
      .insert(templates)
      .values({
        name,
        kind,
        title: title || null,
        subtitle: subtitle || null,
        summary: summary || null,
        heroImage: heroImage || null,
        blocks: blocks || [],
      })
      .returning({ id: templates.id });
    return NextResponse.json({ ok: true, id: row.id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 500 });
  }
}
