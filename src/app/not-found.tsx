import { Reveal } from "@/components/motion/bits";
import { Button } from "@/components/ui/Button";
import { PixelTag } from "@/components/ui/chrome";
import { DragonMark } from "@/components/svg/DragonMark";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-night px-5 text-center text-paper">
      <div className="bg-grid-night absolute inset-0 opacity-30" />

      <Reveal y={0}>
        <div className="relative">
          <DragonMark className="animate-float mx-auto h-36 w-auto text-paper/90 md:h-48" />
          <span
            aria-hidden
            className="animate-soft-pulse absolute top-6 -right-8 h-3 w-3 bg-spectre"
          />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-12 flex justify-center">
          <PixelTag tone="paper">Error 404 — out of bounds</PixelTag>
        </div>
      </Reveal>

      <Reveal delay={0.25}>
        <h1 className="mt-7 font-display text-4xl font-extrabold tracking-[-0.03em] text-balance md:text-6xl">
          The dragon lost <span className="text-spectre">this page.</span>
        </h1>
      </Reveal>

      <Reveal delay={0.35}>
        <p className="mx-auto mt-6 max-w-md text-[15.5px] leading-relaxed text-paper/55">
          It happens. It hoards pixels, not URLs. The page you’re looking for
          was never in the grid.
        </p>
      </Reveal>

      <Reveal delay={0.45} className="mt-12">
        <Button href="/" variant="light" arrow={false}>
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to safety
        </Button>
      </Reveal>
    </section>
  );
}
