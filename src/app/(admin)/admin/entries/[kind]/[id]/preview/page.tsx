import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEntry, type EntryKind } from "../../../actions";
import { BlockRenderer } from "@/components/content/BlockRenderer";

export const dynamic = "force-dynamic";

/** Renders the entry with the same component the public site uses. */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (kind !== "signal" && kind !== "project") notFound();
  const entry = await getEntry(kind as EntryKind, id).catch(() => null);
  if (!entry) notFound();

  return (
    <div className="min-h-svh bg-paper text-ink">
      <div className="border-b border-ink/10 bg-night px-5 py-3 md:px-10">
        <Link
          href={`/admin/entries/${entry.kind}/${entry.id}`}
          className="inline-flex items-center gap-2 font-pixel text-[10px] tracking-[0.28em] text-paper/60 uppercase transition-colors hover:text-spectre"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to editor — previewing {entry.status}
        </Link>
      </div>

      <article className="mx-auto max-w-[760px] px-5 py-16 md:py-24">
        <p className="font-pixel text-[10px] tracking-[0.3em] text-ink/45 uppercase">
          {entry.kind} {entry.code}
        </p>
        <h1 className="mt-5 font-display text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] md:text-[3.4rem]">
          {entry.title}
        </h1>
        {entry.subtitle ? (
          <p className="mt-4 font-display text-[1.3rem] leading-snug font-semibold text-ink/60">
            {entry.subtitle}
          </p>
        ) : null}
        {entry.summary ? (
          <p className="mt-6 text-[17px] leading-relaxed text-ink/70">
            {entry.summary}
          </p>
        ) : null}

        <div className="mt-12">
          <BlockRenderer blocks={entry.blocks} />
        </div>
      </article>
    </div>
  );
}
