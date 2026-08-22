import type { PublicEntry } from "@/lib/entries";

/**
 * Campaign email for one entry.
 *
 * This is a teaser, not a reproduction. The first version rendered every
 * block, which meant the reader finished the piece in their inbox and had
 * no reason to visit -- the opposite of what a campaign is for. It now
 * carries a hero, a short pull, one primary call to action, and cards for
 * other work, so the email exists to move people to the site.
 *
 * Three inbox constraints shape the markup and none are negotiable:
 *
 *   - Every rule is an inline style attribute. Gmail strips <head> on some
 *     clients, so a <style> block cannot be relied on.
 *   - Layout is nested tables with explicit widths. Outlook renders with
 *     Word, which supports neither flexbox nor grid.
 *   - Every colour is a solid hex. Gmail drops values it cannot parse and a
 *     dropped `color` falls back to black, which is invisible on a dark
 *     band. rgba() caused exactly that bug once already.
 */

const PAPER = "#f2f0ea";
const INK = "#242424";
const NIGHT = "#0b1014";
const SPECTRE = "#35aee4";

/* Pre-blended against their backgrounds -- see the note above on rgba. */
const INK_SOFT = "#494948";
const INK_FAINT = "#8b8a87";
const PAPER_SOFT = "#9a9b99";
const PAPER_FAINT = "#636565";
const HAIRLINE = "#d9d8d2";
const NIGHT_HAIRLINE = "#272b2e";

const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

const esc = (v: string): string =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Strips the inline tag vocabulary; a teaser is plain prose. */
const plain = (v: string): string =>
  v.replace(/<\/?(b|i|u|code|reveal)>/gi, "");

function clamp(value: string, max: number): string {
  const text = plain(value).trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = cut.lastIndexOf(" ");
  return `${cut.slice(0, stop > max * 0.6 ? stop : max).trimEnd()}...`;
}

function absolute(src: string, siteUrl: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return `${siteUrl.replace(/\/$/, "")}${src.startsWith("/") ? "" : "/"}${src}`;
}

const entryUrl = (entry: PublicEntry, siteUrl: string) =>
  `${siteUrl}/${entry.kind}s/${entry.slug}`;

/**
 * The first sentence or two, taken from whichever field has content.
 *
 * Summary is written as a standing introduction so it is the natural pull.
 * Falling back to the opening paragraph avoids an empty hero on entries
 * where the author skipped the summary field.
 */
function pull(entry: PublicEntry): string {
  if (entry.summary) return clamp(entry.summary, 190);
  const first = entry.blocks.find(
    (b) => b.type === "paragraph" && b.text.trim(),
  );
  return first && "text" in first ? clamp(first.text, 190) : "";
}

/** One row in the "more from the studio" list. */
function card(entry: PublicEntry, siteUrl: string): string {
  const label = entry.kind === "signal" ? "SIGNAL" : "PROJECT";
  const url = entryUrl(entry, siteUrl);
  const title = esc(entry.title || `${label} ${entry.code}`);

  /* Classified entries carry no imagery by the time they reach here, so the
     tile is a flat accent block rather than a broken image frame. */
  const thumb = entry.heroImage
    ? `<img src="${esc(absolute(entry.heroImage, siteUrl))}" alt="" width="104" height="78"
           style="display:block;width:104px;height:78px;border:0;outline:none;object-fit:cover" />`
    : `<table role="presentation" width="104" cellpadding="0" cellspacing="0" border="0" bgcolor="${NIGHT}" style="width:104px;background:${NIGHT}">
         <tr><td height="78" align="center" style="height:78px;font-family:${MONO};font-size:9px;letter-spacing:0.2em;color:${SPECTRE}">CLASSIFIED</td></tr>
       </table>`;

  const body = entry.classified
    ? `<span style="font-family:${SANS};font-size:13.5px;line-height:1.5;color:${INK_FAINT}">Clearance required.</span>`
    : `<a href="${url}" style="font-family:${SANS};font-size:13.5px;line-height:1.5;color:${INK_SOFT};text-decoration:none">${esc(clamp(entry.summary || "", 92))}</a>`;

  const heading = entry.classified
    ? `<span style="font-family:${SANS};font-size:16px;font-weight:700;letter-spacing:-0.01em;color:${INK_FAINT}">${title}</span>`
    : `<a href="${url}" style="font-family:${SANS};font-size:16px;font-weight:700;letter-spacing:-0.01em;color:${INK};text-decoration:none">${title}</a>`;

  return `<tr>
    <td style="padding:0 0 14px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;background:#ffffff;border:1px solid ${HAIRLINE}">
        <tr>
          <td width="104" valign="top" style="width:104px">${thumb}</td>
          <td valign="top" style="padding:12px 16px">
            <div style="font-family:${MONO};font-size:9px;letter-spacing:0.26em;text-transform:uppercase;color:${INK_FAINT};padding-bottom:6px">${label} ${esc(entry.code)}</div>
            ${heading}
            <div style="padding-top:5px">${body}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export interface EntryEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

export function renderEntryEmail(
  entry: PublicEntry,
  more: PublicEntry[] = [],
  siteUrl = "https://www.spectrerex.com",
): EntryEmail {
  const label = entry.kind === "signal" ? "SIGNAL" : "PROJECT";
  const url = entryUrl(entry, siteUrl);
  const subject = entry.title || `${label} ${entry.code}`;
  const lead = pull(entry);
  const preheader = lead || entry.subtitle || "New from Spectre Rex";

  /* Three is the point where the list still scans; beyond that it reads as
     a directory and the primary call to action loses its weight. */
  const cards = more
    .filter((m) => m.id !== entry.id)
    .slice(0, 3)
    .map((m) => card(m, siteUrl))
    .join("");

  const hero = entry.heroImage
    ? `<tr><td style="padding:0">
         <a href="${url}"><img src="${esc(absolute(entry.heroImage, siteUrl))}" alt="${esc(entry.title)}" width="600"
              style="display:block;width:100%;height:auto;border:0;outline:none" /></a>
       </td></tr>`
    : "";

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${NIGHT}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NIGHT}" style="background:${NIGHT}">
<tr><td align="center" style="padding:30px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%">

    <tr><td style="padding:0 0 24px">
      <img src="${siteUrl}/assets/email/logo-paper.png" alt="Spectre Rex" width="180" height="45"
           style="display:block;width:180px;height:auto;border:0;outline:none" />
    </td></tr>

    <tr><td bgcolor="${SPECTRE}" style="background:${SPECTRE};font-size:0;line-height:0;height:3px">&nbsp;</td></tr>

    ${hero}

    <tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:34px 36px 0">
      <div style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${INK_FAINT}">
        ${label} ${esc(entry.code)}${entry.dateLabel ? ` &middot; ${esc(entry.dateLabel)}` : ""}
      </div>
      <h1 style="margin:14px 0 0;font-family:${SANS};font-size:34px;line-height:1.06;font-weight:800;letter-spacing:-0.035em;color:${INK}">${esc(entry.title)}</h1>
      ${entry.subtitle ? `<p style="margin:12px 0 0;font-family:${SANS};font-size:17px;line-height:1.4;font-weight:600;color:${INK_FAINT}">${esc(entry.subtitle)}</p>` : ""}
    </td></tr>

    ${
      lead
        ? `<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:20px 36px 0">
             <p style="margin:0;font-family:${SANS};font-size:17px;line-height:1.62;color:${INK_SOFT}">${esc(lead)}</p>
           </td></tr>`
        : ""
    }

    <tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:26px 36px 36px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td bgcolor="${SPECTRE}" style="background:${SPECTRE}">
          <a href="${url}" style="display:inline-block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${NIGHT};padding:15px 26px;text-decoration:none">Read the full transmission</a>
        </td>
      </tr></table>
    </td></tr>

    ${
      cards
        ? `<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:0 36px 8px">
             <div style="border-top:1px solid ${HAIRLINE};padding-top:24px;font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${INK_FAINT}">Also from the studio</div>
           </td></tr>
           <tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:16px 36px 34px">
             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${cards}</table>
           </td></tr>`
        : ""
    }

    <tr><td style="padding:24px 0 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${PAPER_FAINT}">End of transmission</td>
        <td align="right" style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${PAPER_FAINT}">${entry.kind === "signal" ? "SIG" : "PRJ"} ${esc(entry.code)}</td>
      </tr></table>
      <div style="border-top:1px solid ${NIGHT_HAIRLINE};margin-top:16px;padding-top:16px;font-family:${SANS};font-size:12px;line-height:1.7;color:${PAPER_FAINT}">
        Spectre Rex Studios &middot; Gurugram, India<br />
        <a href="${siteUrl}" style="color:${PAPER_SOFT};text-decoration:none">spectrerex.com</a>
        &nbsp;&middot;&nbsp;
        <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${PAPER_SOFT};text-decoration:underline">Unsubscribe</a>
      </div>
    </td></tr>

  </table>
</td></tr></table>
</body></html>`;

  const text = [
    `${label} ${entry.code} -- ${entry.title}`,
    entry.subtitle,
    "",
    lead,
    "",
    `Read the full transmission: ${url}`,
    ...(more.length
      ? [
          "",
          "Also from the studio:",
          ...more
            .filter((m) => m.id !== entry.id)
            .slice(0, 3)
            .map((m) =>
              m.classified
                ? `  ${m.title} (classified)`
                : `  ${m.title} -- ${entryUrl(m, siteUrl)}`,
            ),
        ]
      : []),
    "",
    "Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}",
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");

  return { subject, preheader, html, text };
}
