import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEntry, type EntryKind } from "../../../actions";
import { EntryArticle } from "@/components/content/EntryArticle";
import { toPublicEntry } from "@/lib/entries";

export const dynamic = "force-dynamic";

/**
 * Preview renders the exact component the public detail page renders, fed
 * through the exact redaction the public read layer applies.
 *
 * Previously this was a separate 760px article layout, so an author was
 * shown something no reader would ever see. Two consequences of doing it
 * properly: a classified entry previews as scrambled, because that is what
 * the public gets; and a draft previews as it will look once published,
 * because status affects visibility rather than rendering.
 */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (kind !== "signal" && kind !== "project") notFound();
  const entry = await getEntry(kind as EntryKind, id).catch(() => null);
  if (!entry) notFound();

  const preview = toPublicEntry({
    id: entry.id,
    kind: entry.kind,
    code: entry.code,
    slug: entry.slug,
    title: entry.title,
    subtitle: entry.subtitle,
    summary: entry.summary,
    heroImage: entry.heroImage || null,
    blocks: entry.blocks,
    classified: entry.classified,
    dateLabel: "",
    updatedAt: entry.updatedAt,
  });

  return (
    <div className="min-h-svh bg-paper">
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 border-b border-paper/12 bg-night px-5 py-3 md:px-10">
        <Link
          href={`/admin/entries/${entry.kind}/${entry.id}`}
          className="inline-flex items-center gap-2 font-pixel text-[10px] tracking-[0.28em] text-paper/60 uppercase transition-colors hover:text-spectre"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to editor
        </Link>
        <span className="font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase">
          {entry.status}
          {entry.classified ? " · classified · slug returns 404" : ""}
        </span>
      </div>

      {/* chrome={false} drops the site back-link and prev/next, which would
          navigate out of the admin frame into the public site. */}
      <EntryArticle entry={preview} chrome={false} />
    </div>
  );
}
