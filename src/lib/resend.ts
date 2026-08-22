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

import {
  contactAckHtml,
  CONTACT_ACK_SUBJECT,
  CONTACT_ACK_TEXT,
} from "@/lib/email/contactAck";

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

/**
 * Key for anything that is not sending an email.
 *
 * Resend has exactly two permission levels: sending access, and full
 * access. A sending key answers "This API key is restricted to only send
 * emails" for every other operation -- and **creating a contact counts as
 * another operation**, not as sending. That is subtle enough to have cost a
 * bug: signups wrote to Postgres, the Resend call was rejected, and because
 * the sync is intentionally non-fatal the visitor saw success while the
 * contact never appeared.
 *
 * So this covers both reads (listing broadcasts) and contact writes. It
 * falls back to RESEND_API_KEY, which is correct when that key is itself
 * full access.
 */
const manageKey = (): string | undefined =>
  process.env.RESEND_ADMIN_API_KEY || process.env.RESEND_API_KEY;

async function get(
  path: string,
): Promise<{ ok: boolean; json: Record<string, unknown> }> {
  const response = await fetch(`${API}${path}`, {
    headers: { authorization: `Bearer ${manageKey()}` },
    /* Campaign state changes outside this app, so a cached response would
       show a campaign as unsent after it had gone out. */
    cache: "no-store",
  });
  const json = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  return { ok: response.ok, json };
}

async function call(
  path: string,
  body: unknown,
  key: string | undefined = process.env.RESEND_API_KEY,
): Promise<{ ok: boolean; status: number; json: Record<string, unknown> }> {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
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

/**
 * Acknowledges a contact form submission to the person who sent it.
 *
 * Sent after the studio copy, and its failure is not fatal: the enquiry has
 * already reached the team, and turning a delivered message into a visible
 * error because a courtesy receipt bounced would be the wrong trade.
 *
 * Reply-To points at the studio group so a reply to the acknowledgement
 * reaches a human rather than the unattended sending address.
 */
export async function sendContactAck(to: string): Promise<SendResult> {
  if (!resendConfigured()) {
    return { ok: false, error: "Email delivery is not configured." };
  }
  const { ok, json } = await call("/emails", {
    from: FROM,
    to: [to],
    reply_to: CONTACT_TO,
    subject: CONTACT_ACK_SUBJECT,
    html: contactAckHtml(),
    text: CONTACT_ACK_TEXT,
    /* Marks this as machine-generated so a recipient's own out-of-office
       does not answer it and start a loop. */
    headers: { "Auto-Submitted": "auto-replied" },
  });
  return ok
    ? { ok: true }
    : { ok: false, error: errorFrom(json, "Resend rejected the message.") };
}

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
 * Adds an address to the contact list.
 *
 * Resend moved contacts to the account level: the endpoint is POST
 * /contacts with no audience in the path. The older
 * /audiences/{id}/contacts shape this used to call is gone, which failed
 * silently -- the sync is deliberately non-fatal, so a 404 from Resend
 * looked identical to a successful signup from the visitor's side.
 *
 * No segment is passed. Contacts land in the single account-level list,
 * which is the right shape for one newsletter; segments only earn their
 * keep once the list needs splitting, and an unused parameter here would be
 * a config knob nobody sets and everybody has to reason about.
 *
 * Still non-fatal by design: Postgres is the record of who subscribed and
 * Resend is a cache of it, so an outage there must not turn a successful
 * signup into a visible error.
 */
export async function addContact(email: string): Promise<SendResult> {
  const key = manageKey();
  if (!key) return { ok: false, error: "Contact sync is not configured." };

  const { ok, json } = await call(
    "/contacts",
    { email, unsubscribed: false },
    key,
  );

  if (ok) return { ok: true };
  const message = errorFrom(json, "Resend rejected the contact.");
  return {
    ok: false,
    error: /restricted|only send/i.test(message)
      ? "Sending-only API key cannot create contacts. Set RESEND_ADMIN_API_KEY to a full-access key."
      : message,
  };
}

/**
 * Creates a broadcast in Resend as a DRAFT.
 *
 * `send` is deliberately never set. Publishing is not the same decision as
 * mailing several hundred people, and a send cannot be recalled -- so a
 * re-publish after a typo fix, or a stray click in the editor, must not be
 * able to reach the list. A draft appears in Resend ready to review, test
 * and send by hand.
 *
 * Requires the management key: creating a broadcast is not sending, so a
 * sending-access key is rejected.
 */
export async function createBroadcastDraft(input: {
  name: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const key = manageKey();
  if (!key) return { ok: false, error: "Resend is not configured." };

  const { ok, json } = await call(
    "/broadcasts",
    {
      from: FROM,
      reply_to: CONTACT_TO,
      name: input.name,
      subject: input.subject,
      html: input.html,
      text: input.text,
    },
    key,
  );

  if (!ok) {
    const message = errorFrom(json, "Resend rejected the broadcast.");
    return {
      ok: false,
      error: /restricted|only send/i.test(message)
        ? "Sending-only API key cannot create broadcasts. Set RESEND_ADMIN_API_KEY to a full-access key."
        : message,
    };
  }
  const id = typeof json.id === "string" ? json.id : "";
  return id ? { ok: true, id } : { ok: false, error: "No broadcast id returned." };
}

/** Sentinel for "the key works, but is not allowed to read". */
export const RESTRICTED = "restricted-key";

export interface Broadcast {
  id: string;
  name: string | null;
  subject: string | null;
  status: string;
  created_at: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
}

/**
 * Campaigns, newest first.
 *
 * Read-only: the admin panel lists what Resend already knows about rather
 * than duplicating its composer. Errors are returned rather than thrown so
 * the page can say why it is empty instead of collapsing into an error
 * boundary.
 */
export async function listBroadcasts(): Promise<{
  broadcasts: Broadcast[];
  error: string | null;
}> {
  if (!manageKey()) {
    return { broadcasts: [], error: "RESEND_API_KEY is not set." };
  }
  try {
    const { ok, json } = await get("/broadcasts");
    if (!ok) {
      const message = errorFrom(json, "Resend rejected the request.");
      /* Distinguish the one failure that is a configuration choice rather
         than a fault, so the page can explain it instead of showing a raw
         API string that reads like a bug. */
      const restricted = /restricted|only send/i.test(message);
      return { broadcasts: [], error: restricted ? RESTRICTED : message };
    }
    const raw = Array.isArray(json.data) ? (json.data as Broadcast[]) : [];
    const rank = (b: Broadcast) =>
      Date.parse(b.sent_at ?? b.scheduled_at ?? b.created_at ?? "") || 0;
    return { broadcasts: [...raw].sort((a, b) => rank(b) - rank(a)), error: null };
  } catch (error) {
    return {
      broadcasts: [],
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
