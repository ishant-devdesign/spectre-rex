import { listPublished } from "@/lib/entries";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

export async function GET() {
  const staticRoutes = [
    { loc: `${SITE_URL}/`, changefreq: "weekly", priority: "1.0", lastmod: new Date().toISOString() },
    { loc: `${SITE_URL}/studio`, changefreq: "monthly", priority: "0.8" },
    { loc: `${SITE_URL}/projects`, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE_URL}/signals`, changefreq: "weekly", priority: "0.9" },
    { loc: `${SITE_URL}/contact`, changefreq: "yearly", priority: "0.7" },
    { loc: `${SITE_URL}/press`, changefreq: "monthly", priority: "0.5" },
  ];

  const [projects, signals] = await Promise.all([
    listPublished("project"),
    listPublished("signal"),
  ]);

  const dynamicRoutes = [...projects, ...signals].map((entry) => ({
    loc: `${SITE_URL}/${entry.kind === "project" ? "projects" : "signals"}/${entry.slug}`,
    lastmod: entry.updatedAt ? new Date(entry.updatedAt).toISOString() : undefined,
    changefreq: "monthly",
    priority: "0.6",
  }));

  const all = [...staticRoutes, ...dynamicRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ""}    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
