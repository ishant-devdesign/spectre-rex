/**
 * Auth configuration.
 *
 * Magic links let anyone with an inbox request a sign-in email, so the
 * allowlist is the actual access control — Supabase will happily create a
 * user for any address otherwise. It is checked when the link is
 * requested AND again on every admin request, because the first check is
 * only a courtesy and the second is the one that matters.
 */
export const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/** True when the Supabase environment is wired up at all. */
export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Absolute origin for auth redirects. Behind a reverse proxy the request
 * URL carries the upstream host, which would send users to an internal
 * address, so forwarded headers win when present.
 */
export function siteOrigin(request: {
  headers: Headers;
  nextUrl: { origin: string };
}): string {
  const host = request.headers.get("x-forwarded-host");
  if (!host) return request.nextUrl.origin;
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
