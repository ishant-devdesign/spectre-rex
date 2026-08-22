import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { subscribers } from "@/db/schema";
import { addContact } from "@/lib/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const reject = (error: string, status = 400) =>
  Response.json({ ok: false, error }, { status });

/**
 * Newsletter signup. Single opt-in by design -- no confirmation email.
 *
 * The abuse surface that normally justifies double opt-in is handled
 * elsewhere: a honeypot field here, and campaigns sent from the
 * send.spectrerex.com subdomain so any reputation damage is quarantined
 * away from the team's mail on the root domain.
 *
 * Postgres is the record of who subscribed; the Resend audience is a cache
 * of it. The sync is therefore best-effort -- a Resend outage must not turn
 * a successful signup into a visible failure.
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return reject("We could not read that request.");
  }

  const str = (key: string) =>
    typeof payload[key] === "string" ? (payload[key] as string).trim() : "";

  if (str("company")) return Response.json({ ok: true });

  const email = str("email").toLowerCase();
  if (!EMAIL.test(email)) return reject("That email address looks wrong.");
  if (email.length > 320) return reject("That email address is too long.");

  try {
    /* Re-subscribing is not an error, so the insert is idempotent. Raw SQL
       rather than the query builder because the unique index is on the
       expression `lower(email)`, and Drizzle's onConflictDoNothing target
       only accepts columns. */
    const source = str("source") || "site";
    await getDb().execute(
      sql`insert into ${subscribers} (email, source)
          values (${email}, ${source})
          on conflict (lower(email)) do nothing`,
    );
  } catch (error) {
    console.error("[subscribe] insert failed:", error);
    return Response.json(
      { ok: false, error: "We could not save that just now." },
      { status: 503 },
    );
  }

  const synced = await addContact(email);
  if (!synced.ok) console.warn("[subscribe] contact sync:", synced.error);

  return Response.json({ ok: true });
}
