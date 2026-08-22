import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedBySlug, listPublished, neighbours } from "@/lib/entries";
import { EntryArticle } from "@/components/content/EntryArticle";

/* Rendered per request: entries change from the admin panel, and a stale
   cached page would show a draft that was just unpublished. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getPublishedBySlug("project", slug);
  if (!entry) return {};
  return { title: entry.title, description: entry.summary || undefined };
}

export default async function ProjectArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  /* Null means one of: no such slug, still a draft, or classified. All three
     are a 404 on purpose -- any other response confirms something is hidden
     there. */
  const entry = await getPublishedBySlug("project", slug);
  if (!entry) notFound();

  const all = await listPublished("project");
  const { previous, next } = neighbours(all, slug);

  return <EntryArticle entry={entry} previous={previous} next={next} />;
}
