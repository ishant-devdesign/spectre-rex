/**
 * Central email template library — same aesthetic across all emails.
 * Dark night #0B1014, paper #F2F0EA, spectre #35AEE4, ink #242424
 * All tables, inline styles, no external CSS — Gmail safe.
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

// ------------------------------------------------------------------
// Auth templates — for Supabase Dashboard (paste HTML)
// ------------------------------------------------------------------

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
  <p style="margin:20px 0 0;font-family:${SANS};font-size:14px;line-height:1.5;color:${INK_FAINT}">Didn't request this? Ignore — no account will be created.</p>
</td></tr>
${footer(o.siteUrl)}
</table>
</td></tr>
</table>`;

  return {
    subject: "Your Spectre Rex admin link",
    html: wrapHtml("Magic link", "Sign in to Spectre Rex admin", html),
    text: `Sign in to Spectre Rex admin\n\n${supabaseLink}\n\nExpires in 1 hour, one-time use.\n\nIf you didn't request this, ignore.`,
  };
}

export function confirmSignupEmail(supabaseLink: string, opts: EmailTemplateOptions = {}) {
  const o = { ...DEFAULTS, ...opts };
  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NIGHT}" style="background:${NIGHT};padding:0"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:100%">
${header(o.logoUrl)}
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:38px 36px 34px">
  <div style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#959491">Confirm email</div>
  <h1 style="margin:16px 0 0;font-family:${SANS};font-size:32px;font-weight:800;color:${INK}">Confirm your email</h1>
  <p style="margin:20px 0 0;font-family:${SANS};font-size:17px;line-height:1.62;color:${INK_SOFT}">Click to confirm your email for Spectre Rex Studios.</p>
  <table style="margin-top:24px"><tr><td bgcolor="${SPECTRE}"><a href="${supabaseLink}" style="display:inline-block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${NIGHT};padding:14px 24px;text-decoration:none">Confirm email</a></td></tr></table>
</td></tr>
${footer(o.siteUrl)}
</table>
</td></tr></table>`;

  return {
    subject: "Confirm your email — Spectre Rex",
    html: wrapHtml("Confirm email", "Confirm your email", html),
    text: `Confirm your email\n${supabaseLink}`,
  };
}

// ------------------------------------------------------------------
// Contact ack — updated, same aesthetic
// ------------------------------------------------------------------

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
  <p style="margin:16px 0 0;font-family:${SANS};font-size:17px;line-height:1.62;color:${INK_SOFT}">A human replies to every line, usually within two working days. Occasionally the dragon naps. It has been a long century.</p>
  <table style="margin-top:30px"><tr><td bgcolor="${SPECTRE}"><a href="${o.siteUrl}" style="display:inline-block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${NIGHT};padding:14px 24px;text-decoration:none">Visit the studio</a></td></tr></table>
</td></tr>
${footer(o.siteUrl)}
</table>
</td></tr>
</table>`;

  return {
    subject: "Received. The dragon is reading.",
    html: wrapHtml("Received", "A human replies within two working days", html),
    text: `The dragon is reading.\n\nYour message reached the studio. A human replies within two working days.\n\n${o.siteUrl}`,
  };
}

// ------------------------------------------------------------------
// Campaign — completely redesigned, editable options
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
    ? `<tr><td style="padding:0"><a href="${e.url}"><img src="${esc(e.heroImage)}" alt="${esc(e.title)}" width="600" style="display:block;width:100%;height:auto;border:0" /></a></td></tr>`
    : "";

  const latestProjects = o.includeLatestProjects && o.latestProjects?.length
    ? `
    <tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:0 36px 8px">
      <div style="border-top:1px solid ${HAIRLINE};padding-top:24px;font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${INK_FAINT}">Latest projects</div>
    </td></tr>
    ${o.latestProjects!
      .slice(0, o.latestCount)
      .map(
        (p) => `
    <tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:0 36px 12px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fff" style="border:1px solid ${HAIRLINE}"><tr>
        <td width="88" valign="top"><img src="${esc(p.heroImage ?? "")}" alt="" width="88" height="66" style="display:block;width:88px;height:66px;object-fit:cover" /></td>
        <td style="padding:10px 14px"><div style="font-family:${MONO};font-size:9px;letter-spacing:0.2em;color:${INK_FAINT}">PROJECT ${esc(p.code)}</div><a href="${o.siteUrl}/projects/${p.slug}" style="font-family:${SANS};font-size:15px;font-weight:700;color:${INK};text-decoration:none">${esc(p.title)}</a><div style="font-family:${SANS};font-size:13px;color:${INK_SOFT}">${esc(p.summary ?? "")}</div></td>
      </tr></table>
    </td></tr>`,
      )
      .join("")}
    `
    : "";

  const latestSignals = o.includeLatestSignals && o.latestSignals?.length
    ? `
    <tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:0 36px 8px">
      <div style="border-top:1px solid ${HAIRLINE};padding-top:24px;font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${INK_FAINT}">Latest signals</div>
    </td></tr>
    ${o.latestSignals!
      .slice(0, o.latestCount)
      .map(
        (s) => `
    <tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:0 36px 12px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fff" style="border:1px solid ${HAIRLINE}"><tr>
        <td style="padding:12px 16px"><div style="font-family:${MONO};font-size:9px;letter-spacing:0.2em;color:${INK_FAINT}">SIGNAL ${esc(s.code)}${s ? "" : ""}</div><a href="${o.siteUrl}/signals/${s.slug}" style="font-family:${SANS};font-size:16px;font-weight:700;color:${INK};text-decoration:none">${esc(s.title)}</a><div style="margin-top:4px;font-family:${SANS};font-size:13px;color:${INK_SOFT}">${esc(s.summary ?? "")}</div></td>
      </tr></table>
    </td></tr>`,
      )
      .join("")}
    `
    : "";

  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NIGHT}" style="background:${NIGHT};margin:0;padding:0">
<tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%">
${header(o.logoUrl)}
${hero}
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:34px 36px 0">
  <div style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${INK_FAINT}">${label} ${esc(e.code)}${e.dateLabel ? ` · ${esc(e.dateLabel)}` : ""}</div>
  <h1 style="margin:12px 0 0;font-family:${SANS};font-size:36px;line-height:1.02;font-weight:800;letter-spacing:-0.03em;color:${INK}">${esc(e.title)}</h1>
  ${e.subtitle ? `<p style="margin:10px 0 0;font-family:${SANS};font-size:17px;font-weight:600;line-height:1.4;color:${INK_FAINT}">${esc(e.subtitle)}</p>` : ""}
</td></tr>
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:18px 36px 0">
  <p style="margin:0;font-family:${SANS};font-size:17px;line-height:1.62;color:${INK_SOFT}">${esc(e.summary ?? "")}</p>
</td></tr>
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:24px 36px 32px">
  <table><tr><td bgcolor="${SPECTRE}"><a href="${e.url}" style="display:inline-block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${NIGHT};padding:14px 26px;text-decoration:none">${esc(o.ctaLabel)}</a></td></tr></table>
</td></tr>
${latestProjects}
${latestSignals}
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:0 36px 32px">
  <div style="border-top:1px solid ${HAIRLINE};padding-top:20px">
    <p style="margin:0;font-family:${SANS};font-size:14px;line-height:1.6;color:${INK_FAINT}">You are receiving this because you subscribed to Spectre Rex transmissions. The dragon guards the list as well as the egg.</p>
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

// ------------------------------------------------------------------
// Additional templates
// ------------------------------------------------------------------

export function welcomeEmail(opts: EmailTemplateOptions = {}) {
  const o = { ...DEFAULTS, ...opts };
  const html = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NIGHT}" style="background:${NIGHT}"><tr><td align="center" style="padding:32px 12px">
<table width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:100%">
${header(o.logoUrl)}
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:36px">
  <div style="font-family:${MONO};font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#959491">Welcome to the grid</div>
  <h1 style="margin:14px 0 0;font-family:${SANS};font-size:32px;font-weight:800;color:${INK}">You are on the list.</h1>
  <p style="margin:18px 0 0;font-family:${SANS};font-size:17px;line-height:1.62;color:${INK_SOFT}">Transmissions from inside the studio — devlogs, project reveals, and the occasional dragon update. No spam, one-click unsubscribe.</p>
  <table style="margin-top:24px"><tr><td bgcolor="${SPECTRE}"><a href="${o.siteUrl}/signals" style="display:inline-block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${NIGHT};padding:14px 24px;text-decoration:none">Read signals</a></td></tr></table>
</td></tr>
${footer(o.siteUrl)}
</table>
</td></tr></table>`;

  return {
    subject: "Welcome to Spectre Rex transmissions",
    html: wrapHtml("Welcome", "You are on the list", html),
    text: `Welcome to Spectre Rex\n\nYou are on the list. Read signals at ${o.siteUrl}/signals\n\nUnsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`,
  };
}

export function newsletterEmail(
  title: string,
  bodyHtml: string,
  opts: EmailTemplateOptions & { preheader?: string } = {},
) {
  const o = { ...DEFAULTS, ...opts };
  const html = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${NIGHT}" style="background:${NIGHT}"><tr><td align="center" style="padding:28px 12px">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%">
${header(o.logoUrl)}
<tr><td bgcolor="${PAPER}" style="background:${PAPER};padding:32px 36px">
  <h1 style="margin:0;font-family:${SANS};font-size:32px;font-weight:800;color:${INK}">${esc(title)}</h1>
  <div style="margin-top:18px;font-family:${SANS};font-size:16px;line-height:1.62;color:${INK_SOFT}">${bodyHtml}</div>
  ${o.ctaUrl ? `<table style="margin-top:24px"><tr><td bgcolor="${SPECTRE}"><a href="${o.ctaUrl}" style="display:inline-block;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:${NIGHT};padding:14px 24px;text-decoration:none">${esc(o.ctaLabel)}</a></td></tr></table>` : ""}
</td></tr>
${footer(o.siteUrl, o.customFooter)}
</table>
</td></tr></table>`;

  return {
    subject: title,
    html: wrapHtml(title, opts.preheader ?? "", html),
    text: `${title}\n\n${bodyHtml.replace(/<[^>]*>/g, "")}\n\n${o.siteUrl}`,
  };
}
