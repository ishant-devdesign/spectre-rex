import { sql } from "drizzle-orm";
import { getDb } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getDb().execute(sql`select 1`);
    return Response.json({ ok: true, database: "up" });
  } catch (error) {
    /* Surfaced in the body so a misconfigured DATABASE_URL on Vercel is
       diagnosable without digging through function logs. */
    const reason = error instanceof Error ? error.message : "unknown error";
    return Response.json({ ok: false, database: "down", reason }, { status: 503 });
  }
}
