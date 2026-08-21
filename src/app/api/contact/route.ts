import { contactMessages } from "@/db/schema";
import { getDb } from "@/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHANNELS = new Set(["general", "press", "business"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const reject = (error: string, status = 400) =>
  Response.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return reject("We could not read that request.");
  }

  const str = (key: string) =>
    typeof payload[key] === "string" ? (payload[key] as string).trim() : "";

  /* Honeypot: bots fill hidden fields. Answer 200 so they learn nothing. */
  if (str("company")) return Response.json({ ok: true });

  const email = str("email");
  const message = str("message");
  const channel = str("channel") || "general";

  if (!EMAIL.test(email)) return reject("That email address looks wrong.");
  if (message.length < 10)
    return reject("Tell us a little more — at least 10 characters.");
  if (message.length > 5000) return reject("That message is too long.");
  if (!CHANNELS.has(channel)) return reject("Unknown channel.");

  try {
    await getDb()
      .insert(contactMessages)
      .values({
        channel,
        name: str("name") || null,
        email,
        subject: str("subject") || null,
        message,
        sourcePath: "/contact",
        userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
      });
    return Response.json({ ok: true });
  } catch (error) {
    /* The database is optional for the site to function. Fail loudly enough
       to debug, but let the UI offer the email fallback instead. */
    console.error("[contact] insert failed:", error);
    return Response.json(
      { ok: false, error: "The message store is unavailable right now." },
      { status: 503 },
    );
  }
}
