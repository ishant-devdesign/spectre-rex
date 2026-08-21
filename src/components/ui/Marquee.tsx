import { Fragment, type CSSProperties } from "react";

/** Infinite keyword ticker — pauses on hover. */
export function Marquee({
  items,
  className = "",
  duration = 30,
}: {
  items: readonly string[];
  className?: string;
  duration?: number;
}) {
  const Row = ({ hidden = false }: { hidden?: boolean }) => (
    <div aria-hidden={hidden} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <Fragment key={i}>
          <span className="mx-8 text-[13px] font-semibold tracking-[0.28em] whitespace-nowrap uppercase md:mx-10">
            {item}
          </span>
          <span className="h-2 w-2 shrink-0 bg-spectre" aria-hidden="true" />
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className={`marquee-paused overflow-hidden ${className}`}>
      <div
        className="animate-marquee flex w-max"
        style={{ "--marquee-dur": `${duration}s` } as CSSProperties}
      >
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
