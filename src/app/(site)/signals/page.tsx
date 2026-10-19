import type { Metadata } from "next";
import { Star } from "lucide-react";
import { listPublished } from "@/lib/entries";
import { Reveal } from "@/components/motion/bits";
import { PixelTag } from "@/components/ui/chrome";
import { PageHero } from "@/components/sections/PageHero";
import { TransitionLink } from "@/components/transition/TransitionLink";

export const metadata: Metadata = {
  title: "Signals — Indie Game Devlog",
  description:
    "Signals is the Spectre Rex indie game devlog — irregular, honest transmissions from inside our Gurugram studio.",
  alternates: { canonical: "/signals" },
};

export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const entries = await listPublished("signal");
  const featured = entries.find((e) => e.featured) ?? null;
  const rest = entries.filter((e) => !e.featured);

  return (
    <>
      <PageHero eyebrow="Transmissions" lines={["Signals from", "the studio."]}>
        <Reveal delay={0.9} scroll={false} className="mt-10">
          <p className="max-w-xl text-base leading-relaxed text-paper/65 md:text-lg">
            From inside the studio. Irregular, honest transmissions.
          </p>
        </Reveal>
      </PageHero>

      {featured ? (
        <section className="border-b border-ink/10 bg-ghost">
          <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
            <Reveal>
              <PixelTag>Featured signal</PixelTag>
            </Reveal>
            <TransitionLink href={`/signals/${featured.slug}`} className="group mt-8 block border border-ink/10 bg-paper p-6 md:p-8">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 border border-amber-300 bg-amber-400 px-2 py-1 font-pixel text-[9px] tracking-[0.24em] text-night uppercase">
                  <Star className="h-3 w-3 fill-night" /> Featured
                </span>
                <span className="font-pixel text-[11px] tracking-[0.3em] text-ink/50 uppercase">
                  SIGNAL {featured.code} · {featured.dateLabel}
                </span>
              </div>
              <h2 className="mt-4 font-display text-[2rem] font-extrabold leading-tight tracking-[-0.02em] md:text-[2.8rem]">
                {featured.title}
              </h2>
              {featured.subtitle ? (
                <p className="mt-2 text-[17px] font-semibold leading-snug text-ink/60">{featured.subtitle}</p>
              ) : null}
              <p className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-ink/60">{featured.summary}</p>
            </TransitionLink>
          </div>
        </section>
      ) : null}

      <section className="bg-paper">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 pt-14 pb-10 md:px-10">
          <Reveal>
            <PixelTag>{featured ? "More signals / 02" : "Archive — " + entries.length + " entries"}</PixelTag>
          </Reveal>
        </div>
        <div className="border-b border-ink/10">
          {rest.map((entry, i) => (
            <Reveal key={entry.id} delay={i * 0.08} y={24}>
              <TransitionLink
                href={`/signals/${entry.slug}`}
                className="group flex flex-col gap-4 border-t border-ink/10 px-5 py-8 transition-colors hover:bg-ink/[0.02] md:flex-row md:items-start md:gap-10 md:px-10 md:py-10"
              >
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-pixel text-[11px] tracking-[0.3em] text-ink/50">SIGNAL {entry.code}</span>
                  {entry.dateLabel ? (
                    <>
                      <span className="h-2.5 w-px bg-ink/20" />
                      <span className="font-pixel text-[11px] tracking-[0.14em] text-ink/40">{entry.dateLabel}</span>
                    </>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-[1.45rem] leading-tight font-bold tracking-[-0.02em] text-ink md:text-[2rem] group-hover:text-spectre">
                    {entry.title}
                  </h3>
                  <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-ink/60">{entry.summary}</p>
                </div>
              </TransitionLink>
            </Reveal>
          ))}
        </div>
        <div className="pb-24 md:pb-36" />
      </section>
    </>
  );
}
