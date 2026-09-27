/**
 * Canonical site identity, shared by metadata, robots, sitemap and
 * structured data so they can never drift apart.
 *
 * Apex is the canonical host: www 308-redirects to it (via next.config.ts
 * and Vercel domain settings), so every absolute URL the site emits must
 * point at the apex or crawlers will chase the redirect and dilute signals.
 */
export const SITE_URL = "https://spectrerex.com";
export const SITE_NAME = "Spectre Rex Studios";
export const SITE_DESCRIPTION =
  "Spectre Rex Studios is an independent game studio in Gurugram, India — crafting memorable games and digital experiences, bold ideas built pixel by pixel.";
export const SITE_LOCALE = "en_IN";
export const SITE_EMAIL = "hello@spectrerex.com";

/** Absolute URL for a path (or an already-absolute URL, passed through). */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
