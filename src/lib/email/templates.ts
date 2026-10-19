/**
 * Central email template library — same aesthetic across all emails.
 * Dark night #0B1014, paper #F2F0EA, spectre #35AEE4, ink #242424
 * All tables, inline styles, no external CSS — Gmail safe.
 * Campaign redesigned to be premium.
 */

const NIGHT = "#0b1014";
const PAPER = "#f2f0ea";
const INK = "#242424";
const SPECTRE = "#35aee4";
const GHOST = "#e5f4fc";
const PAPER_SOFT = "#9a9b99";
const PAPER_FAINT = "#636565";
const INK_SOFT = "#494948";
const INK_FAINT = "#8b8a87";
const HAIRLINE = "#d9d8d2";
const NIGHT_HAIRLINE = "#272b2e";

const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface EmailTemplateOptions {
  siteUrl?: string;
  logoUrl?: string;
  includeLatestProjects?: boolean;
  includeLatestSignals?: boolean;
  latestCount?: number;
  customFooter?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

const DEFAULTS: Required<EmailTemplateOptions> = {
  siteUrl: "https://spectrerex.com",
  logoUrl: "https://spectrerex.com/assets/email/logo-paper.png",
  includeLatestProjects: true,
  includeLatestSignals: true,
  latestCount: 3,
  customFooter: "",
  ctaLabel: "Visit the studio",
  ctaUrl: "https://spectrerex.com",
};

function wrapHtml(title: string, preheader: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${esc(title)}</title></head><body style="margin:0;padding:0;background:${NIGHT}"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>${body}</body></html>`;
}

function header(logoUrl: string): string {
  return `
  <tr><td bgcolor="${NIGHT}" style="background:${NIGHT};padding:0 0 26px">
    <img src="${logoUrl}" alt="Spectre Rex" width="200" height="50" style="display:block;width:200px;height:auto;border:0" />
  </td></tr>
  <tr><td bgcolor="${SPECTRE}" style="background:${SPECTRE};height:3px;line-height:0;font-size:0">&nbsp;</td></tr>`;
}

function footer(siteUrl: string, customFooter?: string): string {
  return `
  <tr><td bgcolor="${NIGHT}" style="background:${NIGHT};padding:24px 0 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#636565">End of transmission</td>
      <td align="right" style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#4c4f50">Automated</td>
    </tr></table>
    <div style="border-top:1px solid ${NIGHT_HAIRLINE};margin-top:16px;padding-top:16px;font-family:${SANS};font-size:12px;line-height:1.7;color:#5a5c5d">
      Spectre Rex Studios &middot; Gurugram, India<br />
      <a href="${siteUrl}" style="color:#8a8b8a;text-decoration:none;border-bottom:1px solid #246f91">spectrerex.com</a>
      ${customFooter ? `<br />${customFooter}` : ""}
      <br /><br />
      <span style="font-family:${MONO};font-size:9px;letter-spacing:0.2em;color:#4c4f50">You are receiving this because you subscribed or contacted the studio. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#8a8b8a">Unsubscribe</a></span>
    </div>
  </td></tr>`;
}

// Auth templates
export function magicLinkEmail(supabaseLink: string, opts: EmailTemplateOptions = {}) {
  const o = { ...DEFAULTS, ...opts };
  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NIGHT}" style="background:${NIGHT};margin:0;padding:0">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:100%">
${header(o.logoUrl)}
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:38px 36px 8px">
  <div style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#959491">Studio access</div>
  <h1 style="margin:16px 0 0;font-family:${SANS};font-size:32px;line-height:1.05;font-weight:800;letter-spacing:-0.035em;color:${INK}">Your magic link<br />is ready.</h1>
</td></tr>
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:0 36px 34px">
  <p style="margin:26px 0 0;font-family:${SANS};font-size:17px;line-height:1.62;color:${INK_SOFT}">Click below to sign in to the Spectre Rex admin panel. Link expires in 1 hour and works once.</p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px"><tr>
    <td bgcolor="${SPECTRE}" style="background:${SPECTRE}">
      <a href="${supabaseLink}" style="display:inline-block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${NIGHT};padding:14px 24px;text-decoration:none">Open admin panel</a>
    </td>
  </tr></table>
  <p style="margin:20px 0 0;font-family:${MONO};font-size:11px;line-height:1.5;color:${INK_FAINT}">If button fails, copy: <span style="word-break:break-all;color:${INK_SOFT}">${esc(supabaseLink)}</span></p>
</td></tr>
${footer(o.siteUrl)}
</table>
</td></tr>
</table>`;

  return {
    subject: "Your Spectre Rex admin link",
    html: wrapHtml("Magic link", "Sign in to Spectre Rex admin", html),
    text: `Sign in to Spectre Rex admin\n\n${supabaseLink}\n\nExpires in 1 hour, one-time use.`,
  };
}

export function contactAckEmail(opts: EmailTemplateOptions = {}) {
  const o = { ...DEFAULTS, ...opts };
  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NIGHT}" style="background:${NIGHT};margin:0;padding:0">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:100%">
${header(o.logoUrl)}
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:38px 36px 8px">
  <div style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#959491">Transmission received</div>
  <h1 style="margin:16px 0 0;font-family:${SANS};font-size:34px;line-height:1.05;font-weight:800;letter-spacing:-0.035em;color:${INK}">The dragon<br />is reading.</h1>
</td></tr>
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:0 36px 34px">
  <p style="margin:26px 0 0;font-family:${SANS};font-size:17px;line-height:1.62;color:${INK_SOFT}">Your message reached the studio. It is in the pile, and the pile is guarded.</p>
  <p style="margin:16px 0 0;font-family:${SANS};font-size:17px;line-height:1.62;color:${INK_SOFT}">A human replies to every line, usually within two working days. Occasionally the dragon naps.</p>
  <table style="margin-top:30px"><tr><td bgcolor="${SPECTRE}"><a href="${o.siteUrl}" style="display:inline-block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${NIGHT};padding:14px 24px;text-decoration:none">Visit the studio</a></td></tr></table>
</td></tr>
${footer(o.siteUrl)}
</table>
</td></tr>
</table>`;

  return {
    subject: "Received. The dragon is reading.",
    html: wrapHtml("Received", "A human replies within two working days", html),
    text: `The dragon is reading.\n\nYour message reached the studio.\n\n${o.siteUrl}`,
  };
}

// ------------------------------------------------------------------
// Campaign — PREMIUM redesign
// ------------------------------------------------------------------

export interface CampaignRenderOptions extends EmailTemplateOptions {
  entry: {
    code: string;
    slug: string;
    title: string;
    subtitle?: string;
    summary?: string;
    heroImage?: string | null;
    dateLabel?: string;
    kind: "project" | "signal";
    url: string;
  };
  latestProjects?: { code: string; slug: string; title: string; summary?: string; heroImage?: string | null }[];
  latestSignals?: { code: string; slug: string; title: string; summary?: string; heroImage?: string | null }[];
}

export function campaignEmail(opts: CampaignRenderOptions) {
  const o = { ...DEFAULTS, ...opts } as Required<EmailTemplateOptions> & CampaignRenderOptions;
  const e = o.entry;
  const label = e.kind === "signal" ? "SIGNAL" : "PROJECT";

  const hero = e.heroImage
    ? `
    <tr><td style="padding:0;background:${NIGHT}">
      <a href="${e.url}" style="text-decoration:none">
        <div style="position:relative">
          <img src="${esc(e.heroImage)}" alt="${esc(e.title)}" width="600" style="display:block;width:100%;height:auto;border:0;opacity:0.9" />
        </div>
      </a>
    </td></tr>
    <tr><td bgcolor="${NIGHT}" style="background:${NIGHT};padding:0 0 0"><div style="height:3px;background:${SPECTRE};line-height:0;font-size:0">&nbsp;</div></td></tr>
    `
    : `<tr><td bgcolor="${SPECTRE}" style="background:${SPECTRE};height:3px;line-height:0;font-size:0">&nbsp;</td></tr>`;

  const latestProjects =
    o.includeLatestProjects && o.latestProjects?.length
      ? `
    <tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:32px 36px 12px">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${INK_FAINT}">More from the lab</td>
        <td align="right" style="font-family:${MONO};font-size:9px;letter-spacing:0.2em;color:${INK_FAINT}">${o.latestProjects!.length} projects</td>
      </tr></table>
    </td></tr>
    ${o.latestProjects!
      .slice(0, o.latestCount)
      .map(
        (p) => `
    <tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:0 36px 14px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background:#ffffff;border:1px solid ${HAIRLINE};border-left:3px solid ${SPECTRE}">
        <tr>
          <td width="104" valign="top" style="width:104px;background:${NIGHT}">
            <a href="${o.siteUrl}/projects/${p.slug}"><img src="${esc(p.heroImage ?? `${o.siteUrl}/assets/img/concept-1.jpg`)}" alt="${esc(p.title)}" width="104" height="78" style="display:block;width:104px;height:78px;object-fit:cover;border:0;opacity:0.85" /></a>
          </td>
          <td valign="top" style="padding:14px 18px">
            <div style="font-family:${MONO};font-size:9px;letter-spacing:0.26em;text-transform:uppercase;color:${INK_FAINT}">PROJECT ${esc(p.code)}</div>
            <a href="${o.siteUrl}/projects/${p.slug}" style="display:block;margin-top:6px;font-family:${SANS};font-size:17px;font-weight:800;letter-spacing:-0.02em;color:${INK};text-decoration:none;line-height:1.15">${esc(p.title)}</a>
            <div style="margin-top:6px;font-family:${SANS};font-size:13.5px;line-height:1.5;color:${INK_SOFT}">${esc((p.summary || "").slice(0, 90))}</div>
          </td>
        </tr>
      </table>
    </td></tr>`,
      )
      .join("")}
    `
      : "";

  const latestSignals =
    o.includeLatestSignals && o.latestSignals?.length
      ? `
    <tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:12px 36px 12px">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${INK_FAINT}">From the archive</td>
        <td align="right" style="font-family:${MONO};font-size:9px;letter-spacing:0.2em;color:${INK_FAINT}">${o.latestSignals!.length} signals</td>
      </tr></table>
    </td></tr>
    ${o.latestSignals!
      .slice(0, o.latestCount)
      .map(
        (s) => `
    <tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:0 36px 14px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${GHOST}" style="background:${GHOST};border:1px solid ${HAIRLINE}">
        <tr>
          <td style="padding:16px 18px">
            <div style="font-family:${MONO};font-size:9px;letter-spacing:0.26em;text-transform:uppercase;color:${INK_FAINT}">SIGNAL ${esc(s.code)} ${s ? "" : ""}</div>
            <a href="${o.siteUrl}/signals/${s.slug}" style="display:block;margin-top:6px;font-family:${SANS};font-size:17px;font-weight:800;letter-spacing:-0.02em;color:${INK};text-decoration:none;line-height:1.2">${esc(s.title)}</a>
            <div style="margin-top:6px;font-family:${SANS};font-size:13.5px;line-height:1.5;color:${INK_SOFT}">${esc((s.summary || "").slice(0, 100))}</div>
          </td>
          <td width="40" valign="top" align="center" style="padding:16px 8px 0 0">
            <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border:1px solid ${INK_FAINT};font-family:${MONO};font-size:10px;color:${INK_FAINT}">→</span>
          </td>
        </tr>
      </table>
    </td></tr>`,
      )
      .join("")}
    `
      : "";

  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NIGHT}" style="background:${NIGHT};margin:0;padding:0">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;border:1px solid ${NIGHT_HAIRLINE}">
<tr><td bgcolor="${NIGHT}" style="background:${NIGHT};padding:20px 28px 18px">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td><img src="${o.logoUrl}" alt="Spectre Rex" width="160" height="40" style="display:block;width:160px;height:auto;border:0" /></td>
    <td align="right" style="font-family:${MONO};font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:${PAPER_FAINT}">EST 2026 · GGN</td>
  </tr></table>
</td></tr>
${hero}
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:36px 36px 8px">
  <table cellpadding="0" cellspacing="0" border="0"><tr>
    <td style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${INK_FAINT};border:1px solid ${HAIRLINE};padding:6px 10px">${label}</td>
    <td style="padding-left:10px;font-family:${MONO};font-size:10px;letter-spacing:0.2em;color:${INK_FAINT}">${esc(e.code)}${e.dateLabel ? ` · ${esc(e.dateLabel)}` : ""}</td>
  </tr></table>
  <h1 style="margin:18px 0 0;font-family:${SANS};font-size:38px;line-height:0.98;font-weight:800;letter-spacing:-0.04em;color:${INK}">${esc(e.title)}</h1>
  ${e.subtitle ? `<p style="margin:12px 0 0;font-family:${SANS};font-size:18px;line-height:1.35;font-weight:600;color:${INK_FAINT}">${esc(e.subtitle)}</p>` : ""}
</td></tr>
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:18px 36px 0">
  <div style="width:32px;height:3px;background:${SPECTRE}"></div>
  <p style="margin:18px 0 0;font-family:${SANS};font-size:17px;line-height:1.7;color:${INK_SOFT}">${esc(e.summary ?? "")}</p>
</td></tr>
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:28px 36px 36px">
  <table cellpadding="0" cellspacing="0" border="0"><tr>
    <td bgcolor="${INK}" style="background:${INK};border:1px solid ${INK}">
      <a href="${e.url}" style="display:inline-block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${PAPER};padding:15px 28px;text-decoration:none;border:1px solid ${SPECTRE}">${esc(o.ctaLabel)} →</a>
    </td>
    <td style="padding-left:12px;font-family:${MONO};font-size:9px;letter-spacing:0.15em;color:${INK_FAINT};line-height:1.4">Secure link<br />${esc(new URL(e.url).hostname)}</td>
  </tr></table>
</td></tr>
${latestProjects}
${latestSignals}
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:8px 36px 36px">
  <div style="border-top:1px solid ${HAIRLINE};padding-top:22px">
    <p style="margin:0;font-family:${MONO};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${INK_FAINT}">Why you got this</p>
    <p style="margin:8px 0 0;font-family:${SANS};font-size:13.5px;line-height:1.6;color:${INK_FAINT}">You subscribed to Spectre Rex transmissions. One egg, one dragon, no spam. Unsubscribe anytime — the dragon won't be offended, just slightly disappointed.</p>
  </div>
</td></tr>
${footer(o.siteUrl, o.customFooter)}
</table>
</td></tr>
</table>`;

  return {
    subject: e.title,
    html: wrapHtml(e.title, e.summary ?? "", html),
    text: `${label} ${e.code} — ${e.title}\n\n${e.summary}\n\nRead: ${e.url}\n\nUnsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`,
  };
}

export function welcomeEmail(opts: EmailTemplateOptions = {}) {
  const o = { ...DEFAULTS, ...opts };
  const html = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NIGHT}" style="background:${NIGHT}"><tr><td align="center" style="padding:32px 12px">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:100%;border:1px solid ${NIGHT_HAIRLINE}">
<tr><td bgcolor="${NIGHT}" style="padding:20px 28px"><img src="${o.logoUrl}" alt="Spectre Rex" width="160" height="40" style="display:block" /></td></tr>
<tr><td bgcolor="${SPECTRE}" style="height:3px">&nbsp;</td></tr>
<tr><td bgcolor="${PAPER}" style="padding:36px">
  <div style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#959491">Welcome to the grid</div>
  <h1 style="margin:14px 0 0;font-family:${SANS};font-size:36px;font-weight:800;letter-spacing:-0.03em;color:${INK}">You are on the list.</h1>
  <p style="margin:18px 0 0;font-family:${SANS};font-size:17px;line-height:1.62;color:${INK_SOFT}">Transmissions from inside the studio — devlogs, project reveals, and the occasional dragon update. No spam, one-click unsubscribe.</p>
  <table style="margin-top:28px"><tr><td bgcolor="${INK}" style="border:1px solid ${SPECTRE}"><a href="${o.siteUrl}/signals" style="display:inline-block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${PAPER};padding:14px 24px;text-decoration:none">Read signals →</a></td></tr></table>
</td></tr>
${footer(o.siteUrl)}
</table>
</td></tr></table>`;

  return {
    subject: "Welcome to Spectre Rex transmissions",
    html: wrapHtml("Welcome", "You are on the list", html),
    text: `Welcome to Spectre Rex\n\nYou are on the list.\n\n${o.siteUrl}/signals`,
  };
}
