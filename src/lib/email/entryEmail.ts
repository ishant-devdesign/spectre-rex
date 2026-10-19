import type { PublicEntry } from "@/lib/entries";
import { campaignEmail } from "./templates";

export interface EntryEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

export function renderEntryEmail(
  entry: PublicEntry,
  more: PublicEntry[] = [],
  siteUrl = "https://spectrerex.com",
): EntryEmail {
  const url = `${siteUrl}/${entry.kind}s/${entry.slug}`;
  const latestProjects = more.filter((m) => m.kind === "project");
  const latestSignals = more.filter((m) => m.kind === "signal");

  const rendered = campaignEmail({
    siteUrl,
    logoUrl: `${siteUrl}/assets/email/logo-paper.png`,
    includeLatestProjects: latestProjects.length > 0,
    includeLatestSignals: latestSignals.length > 0,
    latestCount: 3,
    ctaLabel: "Read the full transmission",
    ctaUrl: url,
    entry: {
      code: entry.code,
      slug: entry.slug,
      title: entry.title,
      subtitle: entry.subtitle,
      summary: entry.summary,
      heroImage: entry.heroImage ? (entry.heroImage.startsWith("http") ? entry.heroImage : `${siteUrl}${entry.heroImage}`) : null,
      dateLabel: entry.dateLabel,
      kind: entry.kind,
      url,
    },
    latestProjects: latestProjects.map((p) => ({
      code: p.code,
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      heroImage: p.heroImage,
    })),
    latestSignals: latestSignals.map((s) => ({
      code: s.code,
      slug: s.slug,
      title: s.title,
      summary: s.summary,
      heroImage: s.heroImage,
    })),
  });

  return {
    subject: rendered.subject,
    preheader: entry.summary || entry.subtitle || "New from Spectre Rex",
    html: rendered.html,
    text: rendered.text,
  };
}
