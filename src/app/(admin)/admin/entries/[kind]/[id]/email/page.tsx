import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEntry, type EntryKind } from "../../../actions";
import { listPublished, toPublicEntry } from "@/lib/entries";
import { renderEntryEmail } from "@/lib/email/entryEmail";
import { CopyField } from "@/components/admin/CopyField";

export const dynamic = "force-dynamic";

/**
 * Campaign template for one entry.
 *
 * Resend's composer accepts pasted HTML, so the fastest honest path from
 * "published" to "sent" is to generate the email here, in the site's theme,
 * and hand it over. No second editor to maintain, and the campaign cannot
 * drift from the entry it announces.
 *
 * Redaction runs first: a classified entry produces a scrambled email, the
 * same as its public page, rather than leaking a codename to the list.
 */
export default async function EntryEmailPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (kind !== "signal" && kind !== "project") notFound();
  const entry = await getEntry(kind as EntryKind, id).catch(() => null);
  if (!entry) notFound();

  /* Cards for other work. Pulled from both kinds and interleaved so a
     signal campaign can surface a project and vice versa -- the point of
     the email is traffic, and the reader may care about the other one. */
  const [signals, projects] = await Promise.all([
    listPublished("signal"),
    listPublished("project"),
  ]);
  const more = [...projects, ...signals].filter((m) => m.id !== entry.id);

  const email = renderEntryEmail(
    toPublicEntry({
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
    }),
    more,
  );

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-10 md:px-10 md:py-14">
      <Link
        href={`/admin/entries/${entry.kind}/${entry.id}`}
        className="inline-flex items-center gap-2 font-pixel text-[10px] tracking-[0.28em] text-paper/55 uppercase transition-colors hover:text-spectre"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to editor
      </Link>

      <h1 className="mt-8 font-display text-[1.8rem] font-extrabold tracking-[-0.03em]">
        Campaign template
      </h1>
      <p className="mt-2 max-w-[70ch] text-[14.5px] leading-relaxed text-paper/50">
        Paste the HTML into Resend &rarr; Broadcasts &rarr; Upload HTML. The
        unsubscribe placeholder is already in the footer; Resend substitutes it
        on send.
      </p>
      <p className="mt-2 max-w-[70ch] text-[14.5px] leading-relaxed text-paper/50">
        It is a teaser, not the whole piece: hero, a short pull, one call to
        action, then cards for other work. A campaign that reproduces the
        article gives nobody a reason to visit the site.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)] lg:items-start">
        <div className="grid gap-5">
          <CopyField label="Subject" value={email.subject} />
          <CopyField label="Preview text" value={email.preheader} />
          <CopyField label="HTML" value={email.html} multiline />
          <CopyField label="Plain text" value={email.text} multiline />
        </div>

        <div>
          <p className="mb-2.5 font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase">
            Preview
          </p>
          {/* Sandboxed: the template is generated from author content, and an
              iframe with no allow-* runs nothing from it. */}
          <iframe
            title="Email preview"
            sandbox=""
            srcDoc={email.html}
            className="h-[760px] w-full border border-paper/12 bg-white"
          />
        </div>
      </div>
    </main>
  );
}
