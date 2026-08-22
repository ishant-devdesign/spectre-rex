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
 * No Reply-To. Everything the site sends is one-way: the acknowledgement
 * already links to the site, and anyone wanting a conversation has the
 * form and the published addresses. Adding a reply path to an automated
 * receipt only creates a second, unmonitored way in.
 *
 * The one exception is the message relayed *to* the studio, which carries
 * the visitor in Reply-To -- that is how the team answers them.
 */
export async function sendContactAck(to: string): Promise<SendResult> {
  if (!resendConfigured()) {
    return { ok: false, error: "Email delivery is not configured." };
  }
  const { ok, json } = await call("/emails", {
    from: FROM,
    to: [to],
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
 * The audience a broadcast is sent to.
 *
 * Resend's create-broadcast reference lists only `from` and `subject` as
 * required, but the API rejects a payload without `audience_id` or
 * `segment_id` -- the documentation is incomplete, and this was found the
 * hard way.
 *
 * Resolution is deliberately strict:
 *
 *   RESEND_AUDIENCE_ID set   -> use it
 *   exactly one audience     -> use it, no configuration needed
 *   several audiences        -> refuse, and name them
 *
 * The last case is the point. Silently taking the first would work today
 * and quietly break the day a second list is added: audience order is not
 * guaranteed, and sending a devlog to the wrong list cannot be undone.
 * Refusing costs one env var; guessing costs an apology to a mailing list.
 *
 * Memoised per server instance, since the id does not change.
 */
let cachedAudienceId: string | null = null;

type AudienceLookup =
  | { ok: true; id: string }
  | { ok: false; error: string };

async function resolveAudienceId(): Promise<AudienceLookup> {
  const configured = process.env.RESEND_AUDIENCE_ID?.trim();
  if (configured) return { ok: true, id: configured };
  if (cachedAudienceId) return { ok: true, id: cachedAudienceId };

  const { ok, json } = await get("/audiences");
  if (!ok) {
    return {
      ok: false,
      error: errorFrom(json, "Could not list Resend audiences."),
    };
  }

  const list = (Array.isArray(json.data) ? json.data : []) as {
    id?: unknown;
    name?: unknown;
  }[];
  const audiences = list.filter(
    (a): a is { id: string; name: string } => typeof a.id === "string",
  );

  if (audiences.length === 0) {
    return {
      ok: false,
      error: "No Resend audience exists. Create one in Resend first.",
    };
  }

  if (audiences.length > 1) {
    const named = audiences
      .map((a) => `${a.name ?? "unnamed"} (${a.id})`)
      .join(", ");
    return {
      ok: false,
      error:
        `This account has ${audiences.length} audiences, so the target is ` +
        `ambiguous. Set RESEND_AUDIENCE_ID to one of: ${named}`,
    };
  }

  cachedAudienceId = audiences[0].id;
  return { ok: true, id: cachedAudienceId };
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

  /**
   * Target for the draft.
   *
   * A broadcast must carry `segment_id` or `audience_id`. Passing the
   * audience scopes the draft to it, which Resend's composer shows as the
   * segment named after that audience -- "General" by default, not "All
   * contacts". There is no documented value meaning "everyone", so a
   * segment is used when one is configured and the audience otherwise.
   *
   * Either way the draft's recipient can be changed in the composer before
   * sending, which is one of the reasons this creates a draft rather than
   * sending.
   */
  const segmentId = process.env.RESEND_SEGMENT_ID?.trim();
  let target: Record<string, string>;
  if (segmentId) {
    target = { segment_id: segmentId };
  } else {
    const audience = await resolveAudienceId();
    if (!audience.ok) return { ok: false, error: audience.error };
    target = { audience_id: audience.id };
  }

  /* No reply_to. Campaigns are one-way by decision: replies land on the
     unattended sending address and go nowhere, which is what "no-reply"
     means. The consequence is that the unsubscribe link is the reader's
     only exit, so it stays prominent in the footer rather than being
     shrunk to a legal formality. */
  const { ok, json } = await call(
    "/broadcasts",
    {
      ...target,
      from: FROM,
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
