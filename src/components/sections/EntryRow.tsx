import { ListRow } from "@/components/sections/ListRow";
import { Chip } from "@/components/ui/chrome";
import type { PublicEntry } from "@/lib/entries";

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
      href={`/${entry.kind}s/${entry.slug}`}
      ariaLabel={`${label} ${entry.code} — ${entry.title}`}
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
          <Chip tone="ink">PUBLIC</Chip>
        </>
      }
      title={<span>{entry.title}</span>}
      description={showSummary ? entry.summary : undefined}
    />
  );
}
