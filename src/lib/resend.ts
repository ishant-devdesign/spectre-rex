/**
 * Resend transport.
 *
 * Deliberately talks to the REST API with fetch rather than pulling in the
 * `resend` SDK: two endpoints are used, both trivial, and the dependency
 * would ship a package into every serverless bundle for no gain.
 *
 * Everything here degrades rather than throws when RESEND_API_KEY is absent,
 * so the site runs unconfigured -- the contact form reports honestly that
 * mail is down and offers the mailto fallback, and subscribers are still
 * recorded in Postgres even if the audience sync cannot run.
 */

const API = "https://api.resend.com";

export const resendConfigured = (): boolean =>
  Boolean(process.env.RESEND_API_KEY);

/**
 * From address for everything the site sends.
 *
 * Must live on the domain verified in Resend, which is the sending
 * subdomain -- send.spectrerex.com -- not the root. The root carries Zoho's
 * MX and its own reputation; keeping campaign and form traffic on the
 * subdomain means a spam complaint cannot damage the team's day-to-day mail.
 */
const FROM =
  process.env.RESEND_FROM ?? "Spectre Rex <no-reply@send.spectrerex.com>";

/** Where contact form submissions land. A Zoho group, not a mailbox. */
const CONTACT_TO = process.env.CONTACT_TO ?? "hello@spectrerex.com";

type SendResult = { ok: true } | { ok: false; error: string };

async function call(
  path: string,
  body: unknown,
): Promise<{ ok: boolean; status: number; json: Record<string, unknown> }> {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  return { ok: response.ok, status: response.status, json };
}

const errorFrom = (json: Record<string, unknown>, fallback: string): string =>
  typeof json.message === "string" ? json.message : fallback;

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export interface ContactPayload {
  channel: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Relays a contact form submission to the studio inbox.
 *
 * The visitor's address goes in Reply-To, never in From: sending as an
 * arbitrary third party fails DKIM alignment and is exactly the pattern spam
 * filters penalise. Hitting reply in Zoho still reaches the sender.
 */
export async function sendContactEmail(
  payload: ContactPayload,
): Promise<SendResult> {
  if (!resendConfigured()) {
    return { ok: false, error: "Email delivery is not configured." };
  }

  const who = payload.name || payload.email;
  const subject = payload.subject
    ? `[${payload.channel}] ${payload.subject}`
    : `[${payload.channel}] Message from ${who}`;

  const rows: [string, string][] = [
    ["Channel", payload.channel],
    ["Name", payload.name || "(not given)"],
    ["Email", payload.email],
    ["Subject", payload.subject || "(none)"],
  ];

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:15px;line-height:1.6;color:#16161a">
      <table style="border-collapse:collapse;margin-bottom:20px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:2px 14px 2px 0;color:#6b6b76">${k}</td><td style="padding:2px 0"><strong>${escapeHtml(v)}</strong></td></tr>`,
          )
          .join("")}
      </table>
      <div style="white-space:pre-wrap;border-left:3px solid #16161a;padding-left:14px">${escapeHtml(payload.message)}</div>
    </div>`;

  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    payload.message,
  ].join("\n");

  const { ok, json } = await call("/emails", {
    from: FROM,
    to: [CONTACT_TO],
    reply_to: payload.email,
    subject,
    html,
    text,
  });

  return ok
    ? { ok: true }
    : { ok: false, error: errorFrom(json, "Resend rejected the message.") };
}

/**
 * Adds an address to the broadcast audience.
 *
 * Called after the row is committed to Postgres, and its failure is not
 * fatal: the database is the record of who subscribed, and the audience is a
 * cache of it. A missing audience id, an expired key or a Resend outage
 * should not turn a successful signup into an error for the visitor.
 */
export async function addToAudience(email: string): Promise<SendResult> {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!resendConfigured() || !audienceId) {
    return { ok: false, error: "Audience sync is not configured." };
  }

  const { ok, json } = await call(`/audiences/${audienceId}/contacts`, {
    email,
    unsubscribed: false,
  });

  return ok
    ? { ok: true }
    : { ok: false, error: errorFrom(json, "Resend rejected the contact.") };
}
