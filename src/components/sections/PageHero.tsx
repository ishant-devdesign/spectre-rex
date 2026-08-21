import type { ReactNode } from "react";
import { Reveal, Words } from "@/components/motion/bits";
import { PixelTag } from "@/components/ui/chrome";
import { DragonMark } from "@/components/svg/DragonMark";

/**
 * The hero every page except home uses.
 *
 * These were five hand-rolled variants that had drifted apart — heights
 * from 62svh to 92svh, headline clamps from 7.4rem to 9.4rem, three
 * different dragon positions, one page missing the dragon entirely and
 * two where it did not float. Everything below is now fixed in one
 * place; pages supply content, never spacing.
 */

/* Single source of truth for the frame. */
const SECTION =
  "relative flex min-h-[78svh] flex-col justify-end overflow-hidden bg-night text-paper";
const CONTAINER =
  "relative mx-auto w-full max-w-[1440px] px-5 pt-40 pb-16 md:px-10 md:pb-24";
const TITLE =
  "mt-8 font-display text-[clamp(3rem,8.4vw,8rem)] leading-[0.96] font-extrabold tracking-[-0.04em]";

export function PageHero({
  eyebrow,
  lines,
  accent,
  titleNode,
  above,
  children,
}: {
  /** small pixel label above the headline */
  eyebrow?: ReactNode;
  /** headline copy, one entry per line */
  lines?: string[];
  /** words within `lines` to render in the accent colour */
  accent?: string[];
  /** replaces the headline entirely, for pages with composed titles */
  titleNode?: ReactNode;
  /** content above the headline, e.g. a back link or meta row */
  above?: ReactNode;
  /** content below the headline */
  children?: ReactNode;
}) {
  return (
    <section className={SECTION}>
      <div aria-hidden className="bg-grid-night absolute inset-0 opacity-30" />
      <DragonMark
        aria-hidden
        className="animate-float pointer-events-none absolute top-[9%] -right-[7%] w-[42vw] max-w-[560px] text-paper opacity-[0.055]"
      />

      <div className={CONTAINER}>
        {above}

        {eyebrow ? (
          <Reveal delay={0.35} y={20} scroll={false}>
            <PixelTag tone="paper">{eyebrow}</PixelTag>
          </Reveal>
        ) : null}

        {titleNode ?? (
          <Words
            as="h1"
            scroll={false}
            delay={0.45}
            lines={lines ?? []}
            accent={accent}
            className={TITLE}
          />
        )}

        {children}
      </div>
    </section>
  );
}

/** Shared headline styling, for pages composing their own title node. */
export const PAGE_HERO_TITLE = TITLE;
