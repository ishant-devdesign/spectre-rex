import type { Signal } from "@/data/content";
import { ListRow } from "@/components/sections/ListRow";
import { Chip, Redacted } from "@/components/ui/chrome";

/** A transmission, rendered with the shared list-row design. */
export function SignalRow({
  signal,
  showExcerpt = true,
}: {
  signal: Signal;
  showExcerpt?: boolean;
}) {
  return (
    <ListRow
      href={`/signals/${signal.slug}`}
      ariaLabel={`Signal ${signal.id} — ${signal.title}`}
      meta={
        <>
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
            <span className="font-pixel text-[11px] tracking-[0.3em] text-ink/50">
              SIGNAL {signal.id}
            </span>
            <span
              aria-hidden
              className="h-2.5 w-px bg-ink/20"
            />
            <span className="flex items-center font-pixel text-[11px] tracking-[0.14em] text-ink/40">
              {signal.dateRedacted ? (
                <>
                  <Redacted count={2} /> . <Redacted count={2} /> . 26
                </>
              ) : (
                signal.date
              )}
            </span>
          </div>
          <Chip tone={signal.classified ? "solid" : "ink"}>
            {signal.classified ? "CLASSIFIED" : "PUBLIC"}
          </Chip>
        </>
      }
      title={
        <>
          {signal.title}
          {signal.blocks ? (
            <>
              {" "}
              <Redacted count={signal.blocks} />
            </>
          ) : null}
        </>
      }
      description={showExcerpt ? signal.excerpt : undefined}
    />
  );
}
