import { sql } from "drizzle-orm";
import { getDb } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getDb().execute(sql`select 1`);
    return Response.json({ ok: true, database: "up" });
  } catch (error) {
    /* Surfaced in the body so a misconfigured DATABASE_URL on Vercel is
       diagnosable without digging through function logs.
       
       Drizzle wraps driver failures in "Failed query: ..." and hides the
       useful part on `cause` -- the difference between a wrong password, an
       unresolvable host and a blocked port is entirely in there, so it is
       unwrapped rather than reported as one indistinguishable error. */
    const reason = error instanceof Error ? error.message : "unknown error";
    const cause = error instanceof Error ? error.cause : undefined;
    const detail =
      cause instanceof Error
        ? {
            detail: cause.message,
            code: (cause as NodeJS.ErrnoException).code,
          }
        : {};

    /* Never echo the connection string itself: it carries the password, and
       this endpoint is public. */
    const configured = Boolean(process.env.DATABASE_URL);

    return Response.json(
      { ok: false, database: "down", configured, reason, ...detail },
      { status: 503 },
    );
  }
}
