import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await assertAdmin();
    const { id } = await params;
    const db = getDb();
    const [row] = await db.select().from(templates).where(eq(templates.id, id));
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      id: row.id,
      name: row.name,
      kind: row.kind,
      title: row.title,
      subtitle: row.subtitle,
      summary: row.summary,
      heroImage: row.heroImage,
      blocks: parseBlocks(row.blocks),
      updatedAt: row.updatedAt,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error" }, { status: 401 });
  }
}
