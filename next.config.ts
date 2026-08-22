import type { NextConfig } from "next";

/**
 * next/image refuses any remote host that is not declared here, so uploaded
 * images would throw "hostname is not configured" at render time without
 * this. The host is read from the environment rather than hardcoded, so a
 * new Supabase project needs no code change -- but the literal is kept as a
 * fallback because NEXT_PUBLIC_SUPABASE_URL has to be present at BUILD time
 * for the env path to work, and a missing build-time var would otherwise
 * break every uploaded image with no obvious cause.
 */
const FALLBACK_SUPABASE_HOST = "twfoqaulrwruoniuvhmx.supabase.co";

function supabaseHost(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return FALLBACK_SUPABASE_HOST;
  try {
    return new URL(url).hostname;
  } catch {
    return FALLBACK_SUPABASE_HOST;
  }
}

const hosts = Array.from(
  new Set([supabaseHost(), FALLBACK_SUPABASE_HOST].filter(Boolean)),
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: hosts.map((hostname) => ({
      protocol: "https" as const,
      hostname,
      pathname: "/storage/v1/object/public/**",
    })),
  },
};

export default nextConfig;
