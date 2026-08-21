import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Words } from "@/components/motion/bits";

/* ------------------------------------------------------------------ */
/* PixelTag — tiny pixel-font label with a blue square bullet          */
/* ------------------------------------------------------------------ */

export function PixelTag({
  children,
  tone = "ink",
  className = "",
}: {
  children: ReactNode;
  tone?: "ink" | "paper";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-pixel text-[11px] uppercase tracking-[0.34em] ${
        tone === "ink" ? "text-ink/55" : "text-paper/55"
      } ${className}`}
    >
      <span className="h-2 w-2 shrink-0 bg-spectre" aria-hidden="true" />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Chip — bordered pixel-font tag                                      */
/* ------------------------------------------------------------------ */

export function Chip({
  children,
  tone = "ink",
  className = "",
}: {
  children: ReactNode;
  tone?: "ink" | "paper" | "spectre" | "solid";
  className?: string;
}) {
  const tones: Record<string, string> = {
    ink: "border-ink/25 text-ink/65",
    paper: "border-paper/30 text-paper/70",
    spectre: "border-spectre text-spectre",
    solid: "border-ink bg-ink text-paper",
  };
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 font-pixel text-[10px] uppercase tracking-[0.24em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Redacted — a row of solid blocks, codename style                    */
/* ------------------------------------------------------------------ */

export function Redacted({
  count,
  className = "",
  tone = "current",
}: {
  count: number;
  className?: string;
  tone?: "current" | "spectre";
}) {
  return (
    <span
      aria-label="redacted"
      className={`mx-[0.08em] inline-flex translate-y-[-0.06em] items-center gap-[0.14em] align-baseline ${
        tone === "spectre" ? "text-spectre" : ""
      } ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="inline-block h-[0.78em] w-[0.78em] bg-current"
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* ArrowSquare — bordered arrow tile used on interactive rows          */
/* ------------------------------------------------------------------ */

export function ArrowSquare({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-11 w-11 shrink-0 place-items-center border transition-colors duration-300 group-hover:border-spectre group-hover:bg-spectre group-hover:text-night ${
        tone === "ink" ? "border-ink/20 text-ink" : "border-paper/25 text-paper"
      }`}
    >
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* SectionHead — eyebrow + word-staggered title + optional aside       */
/* ------------------------------------------------------------------ */

export function SectionHead({
  eyebrow,
  lines,
  accent,
  tone = "ink",
  aside,
  className = "",
}: {
  eyebrow: string;
  lines: string[];
  accent?: string[];
  tone?: "ink" | "paper";
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-x-10 gap-y-8 ${className}`}
    >
      <div>
        <Reveal>
          <PixelTag tone={tone}>{eyebrow}</PixelTag>
        </Reveal>
        <Words
          as="h2"
          lines={lines}
          accent={accent}
          className={`mt-6 font-display text-[2.4rem] leading-[1.02] font-bold tracking-[-0.03em] text-balance md:text-6xl ${
            tone === "ink" ? "text-ink" : "text-paper"
          }`}
        />
      </div>
      {aside ? <Reveal delay={0.2}>{aside}</Reveal> : null}
    </div>
  );
}
