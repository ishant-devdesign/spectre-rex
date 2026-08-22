import { ListRow } from "@/components/sections/ListRow";
import { Chip } from "@/components/ui/chrome";
import type { PublicEntry } from "@/lib/entries";

/**
 * One entry in an archive list.
 *
 * Classified entries render the same row without a link: their slug returns
 * 404 by design, so a clickable row would be a dead end. The title is
 * already ciphertext by the time it reaches here -- redaction happens in the
 * read layer, not in this component, so the plaintext never reaches the
 * browser to be un-hidden.
 */
export function EntryRow({
  entry,
  showSummary = true,
}: {
  entry: PublicEntry;
  showSummary?: boolean;
}) {
  const label = entry.kind === "signal" ? "SIGNAL" : "PROJECT";

  return (
    <ListRow
      href={entry.classified ? undefined : `/${entry.kind}s/${entry.slug}`}
      ariaLabel={
        entry.classified
          ? `${label} ${entry.code} — classified`
          : `${label} ${entry.code} — ${entry.title}`
      }
      meta={
        <>
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
            <span className="font-pixel text-[11px] tracking-[0.3em] text-ink/50">
              {label} {entry.code}
            </span>
            {entry.dateLabel ? (
              <>
                <span aria-hidden className="h-2.5 w-px bg-ink/20" />
                <span className="font-pixel text-[11px] tracking-[0.14em] text-ink/40">
                  {entry.dateLabel}
                </span>
              </>
            ) : null}
          </div>
          <Chip tone={entry.classified ? "solid" : "ink"}>
            {entry.classified ? "CLASSIFIED" : "PUBLIC"}
          </Chip>
        </>
      }
      title={
        <span className={entry.classified ? "text-ink/45 select-none" : ""}>
          {entry.title}
        </span>
      }
      description={showSummary ? entry.summary : undefined}
    />
  );
}
