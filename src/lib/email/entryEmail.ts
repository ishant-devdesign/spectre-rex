import type { Block } from "@/lib/blocks";
import type { PublicEntry } from "@/lib/entries";

/**
 * Renders an entry as email HTML in the site's own theme.
 *
 * Email is not the web. Three constraints shape everything below and none
 * of them are negotiable:
 *
 *   - No external stylesheet, no <style> block that can be relied on.
 *     Gmail strips <head> entirely on some clients, so every rule is an
 *     inline style attribute.
 *   - Layout is nested tables with explicit widths. Flexbox and grid are
 *     unsupported in Outlook's Word rendering engine, which is still the
 *     desktop client with the largest share of business inboxes.
 *   - Web fonts do not load. The pixel display face the site uses cannot
 *     travel, so the email falls back to a system stack and leans on
 *     colour, rule weight and letter-spacing to stay recognisable.
 *
 * The output is a complete document intended for Resend's "Upload HTML",
 * with {{{RESEND_UNSUBSCRIBE_URL}}} left in place for Resend to substitute.
 */

const PAPER = "#f2f0ea";
const INK = "#242424";
const NIGHT = "#0b1014";
const SPECTRE = "#35aee4";

const SANS =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

const esc = (v: string): string =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Inline markup, translated to email-safe HTML.
 *
 * The same five tags the site supports. `<reveal>` cannot be interactive in
 * an inbox -- no JavaScript -- so it renders as a redacted block that
 * invites the click through to the site, which is the behaviour that
 * actually serves a newsletter.
 */
function inline(text: string): string {
  return esc(text)
    .replace(
      /&lt;b&gt;(.*?)&lt;\/b&gt;/gi,
      `<strong style="font-weight:700;color:${INK}">$1</strong>`,
    )
    .replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gi, "<em>$1</em>")
    .replace(
      /&lt;u&gt;(.*?)&lt;\/u&gt;/gi,
      '<span style="text-decoration:underline">$1</span>',
    )
    .replace(
      /&lt;code&gt;(.*?)&lt;\/code&gt;/gi,
      `<span style="font-family:${MONO};font-size:14px;background:rgba(36,36,36,0.07);padding:1px 5px">$1</span>`,
    )
    .replace(
      /&lt;reveal&gt;(.*?)&lt;\/reveal&gt;/gi,
      `<span style="background:${INK};color:${INK};padding:1px 6px">$1</span>`,
    );
}

const row = (content: string, pad = "0 32px 20px"): string =>
  `<tr><td style="padding:${pad}">${content}</td></tr>`;

function blockHtml(block: Block, siteUrl: string): string {
  switch (block.type) {
    case "title":
      return row(
        `<h2 style="margin:24px 0 0;font-family:${SANS};font-size:26px;line-height:1.2;font-weight:800;letter-spacing:-0.02em;color:${INK}">${inline(block.text)}</h2>`,
      );
    case "subtitle":
      return row(
        `<h3 style="margin:16px 0 0;font-family:${SANS};font-size:19px;line-height:1.3;font-weight:700;color:${INK}">${inline(block.text)}</h3>`,
      );
    case "paragraph": {
      const size = { sm: 14, base: 16, lg: 18, lead: 21 }[block.size ?? "base"];
      return row(
        `<p style="margin:0;font-family:${SANS};font-size:${size}px;line-height:1.65;color:rgba(36,36,36,0.82)">${inline(block.text)}</p>`,
      );
    }
    case "list":
      return row(
        `<ul style="margin:0;padding-left:20px;font-family:${SANS};font-size:16px;line-height:1.7;color:rgba(36,36,36,0.82)">${block.items
          .map((item) => `<li>${inline(item)}</li>`)
          .join("")}</ul>`,
      );
    case "quote":
      return row(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
           <td width="3" style="background:${SPECTRE}"></td>
           <td style="padding-left:18px;font-family:${SANS};font-size:19px;line-height:1.45;font-weight:600;color:${INK}">
             &ldquo;${inline(block.text)}&rdquo;
             ${block.attribution ? `<div style="margin-top:10px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(36,36,36,0.45)">&mdash; ${esc(block.attribution)}</div>` : ""}
           </td></tr></table>`,
      );
    case "code":
      return row(
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(36,36,36,0.12)"><tr>
           <td style="padding:16px 18px;font-family:${MONO};font-size:13px;line-height:1.6;color:${INK};white-space:pre-wrap">${esc(block.text)}</td>
         </tr></table>`,
      );
    case "image":
      return block.src
        ? row(
            `<img src="${esc(absolute(block.src, siteUrl))}" alt="${esc(block.alt)}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0" />
             ${block.caption ? `<div style="margin-top:8px;font-family:${SANS};font-size:12px;color:rgba(36,36,36,0.5)">${esc(block.caption)}</div>` : ""}`,
          )
        : "";
    case "imageGroup":
      return row(
        block.images
          .filter((i) => i.src)
          .map(
            (i) =>
              `<img src="${esc(absolute(i.src, siteUrl))}" alt="${esc(i.alt)}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;margin-bottom:8px" />`,
          )
          .join(""),
      );
    case "video":
      /* No inline video in email. A link out is the only thing that works
         in every client, so it is styled as a deliberate call to action
         rather than a broken player. */
      return block.url
        ? row(
            `<a href="${esc(block.url)}" style="display:inline-block;font-family:${SANS};font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${NIGHT};background:${SPECTRE};padding:12px 20px;text-decoration:none">Watch the video</a>`,
          )
        : "";
    case "classified":
      return row(
        `<p style="margin:0;font-family:${SANS};font-size:16px;color:rgba(36,36,36,0.82)">${esc(block.text)} <span style="background:${INK};color:${INK}">${"\u2588".repeat(Math.max(3, block.blocks))}</span></p>`,
      );
    case "reveal":
      return row(
        `<p style="margin:0;font-family:${SANS};font-size:16px;color:rgba(36,36,36,0.82)">${esc(block.label)}: <span style="background:${INK};color:${INK}">${esc(block.text)}</span></p>`,
      );
    default:
      return "";
  }
}

/** Email clients need absolute URLs; the site stores some paths as roots. */
function absolute(src: string, siteUrl: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return `${siteUrl.replace(/\/$/, "")}${src.startsWith("/") ? "" : "/"}${src}`;
}

export interface EntryEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

export function renderEntryEmail(
  entry: PublicEntry,
  siteUrl = "https://www.spectrerex.com",
): EntryEmail {
  const label = entry.kind === "signal" ? "SIGNAL" : "PROJECT";
  const url = `${siteUrl}/${entry.kind}s/${entry.slug}`;
  const subject = entry.title || `${label} ${entry.code}`;
  const preheader = entry.summary || entry.subtitle || `New from Spectre Rex`;

  const body = entry.blocks.map((b) => blockHtml(b, siteUrl)).join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${PAPER}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER}">
<tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff">

    <tr><td style="background:${NIGHT};padding:28px 32px">
      <!-- Hosted PNG, not the site's inline SVG: Gmail, Outlook and Yahoo
           all strip or fail to render SVG in email. -->
      <img src="${siteUrl}/assets/email/logo-paper.png" alt="Spectre Rex" width="180" height="45"
           style="display:block;width:180px;height:auto;border:0;outline:none;text-decoration:none" />
      <div style="font-family:${MONO};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(242,240,234,0.45);padding-top:20px">${label} ${esc(entry.code)}${entry.dateLabel ? ` &middot; ${esc(entry.dateLabel)}` : ""}</div>
      <h1 style="margin:12px 0 0;font-family:${SANS};font-size:32px;line-height:1.08;font-weight:800;letter-spacing:-0.03em;color:${PAPER}">${esc(entry.title)}</h1>
      ${entry.subtitle ? `<p style="margin:14px 0 0;font-family:${SANS};font-size:17px;line-height:1.4;font-weight:600;color:rgba(242,240,234,0.62)">${esc(entry.subtitle)}</p>` : ""}
    </td></tr>

    ${
      entry.heroImage
        ? `<tr><td style="padding:0"><img src="${esc(absolute(entry.heroImage, siteUrl))}" alt="${esc(entry.title)}" width="600" style="display:block;width:100%;height:auto;border:0" /></td></tr>`
        : ""
    }

    ${
      entry.summary
        ? `<tr><td style="padding:32px 32px 4px">
             <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
               <td width="3" style="background:${SPECTRE}"></td>
               <td style="padding-left:18px;font-family:${SANS};font-size:19px;line-height:1.55;color:rgba(36,36,36,0.85)">${esc(entry.summary)}</td>
             </tr></table>
           </td></tr>`
        : ""
    }

    <tr><td style="height:20px;line-height:20px">&nbsp;</td></tr>
    ${body}

    <tr><td style="padding:12px 32px 36px">
      <a href="${esc(url)}" style="display:inline-block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${NIGHT};background:${SPECTRE};padding:14px 24px;text-decoration:none">Read on the site</a>
    </td></tr>

    <tr><td style="background:${NIGHT};padding:26px 32px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(242,240,234,0.4)">End of transmission</td>
        <td align="right" style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(242,240,234,0.3)">${entry.kind === "signal" ? "SIG" : "PRJ"} ${esc(entry.code)}</td>
      </tr></table>
      <div style="font-family:${SANS};font-size:12px;line-height:1.6;color:rgba(242,240,234,0.38);padding-top:18px">
        Spectre Rex Studios &middot; Gurugram, India<br />
        <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:rgba(242,240,234,0.55);text-decoration:underline">Unsubscribe</a>
      </div>
    </td></tr>

  </table>
</td></tr></table>
</body></html>`;

  const text = [
    `${label} ${entry.code}`,
    entry.title,
    entry.subtitle,
    "",
    entry.summary,
    "",
    ...entry.blocks.map((b) =>
      "text" in b && typeof b.text === "string" ? b.text : "",
    ),
    "",
    `Read on the site: ${url}`,
    "",
    "Unsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}",
  ]
    .filter((line, i, all) => line !== "" || all[i - 1] !== "")
    .join("\n");

  return { subject, preheader, html, text };
}
