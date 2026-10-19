import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEntry, type EntryKind } from "../../../actions";
import { EntryArticle } from "@/components/content/EntryArticle";
import { PreviewFrame } from "@/components/admin/PreviewFrame";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (kind !== "signal" && kind !== "project") notFound();
  const entry = await getEntry(kind as EntryKind, id).catch(() => null);
  if (!entry) notFound();

  const previewEntry = {
    id: entry.id,
    kind: entry.kind,
    code: entry.code,
    slug: entry.slug,
    title: entry.title,
    subtitle: entry.subtitle,
    summary: entry.summary,
    heroImage: entry.heroImage || null,
    blocks: entry.blocks,
    dateLabel: "",
    featured: (entry as any).featured ?? false,
    updatedAt: entry.updatedAt,
  };

  return (
    <div className="min-h-svh bg-night">
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-paper/12 bg-night px-5 py-3 md:px-10">
        <Link
          href={`/admin/entries/${entry.kind}/${entry.id}`}
          className="inline-flex items-center gap-2 font-pixel text-[10px] tracking-[0.28em] text-paper/60 uppercase transition-colors hover:text-spectre"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to editor
        </Link>
        <span className="font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase">
          {entry.status} · {entry.code} · preview
        </span>
      </div>

      <PreviewFrame>
        <EntryArticle entry={previewEntry} chrome={false} />
      </PreviewFrame>
    </div>
  );
}
