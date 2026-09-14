import type { MetadataRoute } from "next";
import { listPublished } from "@/lib/entries";
import { SITE_URL } from "@/lib/seo";

/* Rebuilt hourly rather than force-dynamic: entries are edited from the
   admin panel, but a sitemap does not need sub-second freshness. Serving it
   from the CDN cache keeps Googlebot's fetches instant (no DB round-trip,
   no cold start) and removes any chance of a fetch timing out. */
export const revalidate = 3600;

/**
 * Static routes plus every published, non-classified entry.
 *
 * Classified entries are deliberately absent: their slugs 404 by design
 * (server-side redaction), so advertising them here would hand crawlers a
 * list of URLs that return nothing. Drafts are absent for the same reason.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/studio`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/signals`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE_URL}/press`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const [projects, signals] = await Promise.all([
    listPublished("project"),
    listPublished("signal"),
  ]);

  const entries: MetadataRoute.Sitemap = [...projects, ...signals]
    .filter((entry) => !entry.classified)
    .map((entry) => ({
      url: `${SITE_URL}/${entry.kind === "project" ? "projects" : "signals"}/${entry.slug}`,
      lastModified: entry.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...statics, ...entries];
}
