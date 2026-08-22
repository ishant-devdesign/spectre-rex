import { sendContactAck, sendContactEmail } from "@/lib/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHANNELS = new Set(["general", "press", "business"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const reject = (error: string, status = 400) =>
  Response.json({ ok: false, error }, { status });

/**
 * Relays the contact form to the studio inbox.
 *
 * Nothing is stored. Submissions used to land in a `contact_messages` table
 * read by an admin inbox; both are gone, because an inbox nobody opens is
 * worse than no inbox -- mail arrives where the team already works.
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

  const result = await sendContactEmail({
    channel,
    name: str("name"),
    email,
    subject: str("subject"),
    message,
  });

  if (!result.ok) {
    /* Logged for diagnosis, but the visitor is told only that it failed --
       the UI then offers the mailto fallback, which always works. */
    console.error("[contact] send failed:", result.error);
    return Response.json(
      { ok: false, error: "We could not send that just now." },
      { status: 503 },
    );
  }

  /* Acknowledge to the sender. Zoho's group auto-responder cannot do this:
     the relay above is From no-reply@, so Zoho would reply to an address
     with no inbox rather than to the person who filled in the form.
     Best-effort -- the enquiry is already delivered. */
  const ack = await sendContactAck(email);
  if (!ack.ok) console.warn("[contact] acknowledgement:", ack.error);

  return Response.json({ ok: true });
}
