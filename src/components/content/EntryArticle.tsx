import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Reveal } from "@/components/motion/bits";
import { PageHero } from "@/components/sections/PageHero";
import { BlockRenderer } from "@/components/content/BlockRenderer";
import type { PublicEntry } from "@/lib/entries";

/**
 * The entry detail page, for signals and projects alike.
 *
 * This exists because preview and the public page had drifted into two
 * different designs -- preview was a bare 760px article with an <h1>, the
 * public page was a PageHero with a dragon, a meta row and prev/next. An
 * author previewing a draft was being shown something the reader would
 * never see, which makes the preview close to useless.
 *
 * Both now render this. `chrome={false}` drops the site-level navigation
 * affordances that make no sense inside the admin frame, and nothing else
 * differs.
 */
export function EntryArticle({
  entry,
  previous,
  next,
  chrome = true,
}: {
  entry: PublicEntry;
  previous?: PublicEntry | null;
  next?: PublicEntry | null;
  chrome?: boolean;
}) {
  const label = entry.kind === "signal" ? "SIGNAL" : "PROJECT";
  const indexHref = entry.kind === "signal" ? "/signals" : "/projects";

  return (
    <>
      <PageHero
        above={
          chrome ? (
            <Reveal delay={0.3} y={16} scroll={false}>
              <TransitionLink
                href={indexHref}
                className="group inline-flex items-center gap-2 font-pixel text-[11px] tracking-[0.3em] text-paper/50 uppercase transition-colors hover:text-spectre"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                All {entry.kind}s
              </TransitionLink>
            </Reveal>
          ) : null
        }
        titleNode={
          <>
            <Reveal delay={0.4} y={16} scroll={false} className="mt-12">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <span className="font-pixel text-[11px] tracking-[0.3em] text-paper/50 uppercase">
                  {label} {entry.code}
                </span>
                {entry.dateLabel ? (
                  <span className="font-pixel text-[11px] tracking-[0.18em] text-paper/40">
                    {entry.dateLabel}
                  </span>
                ) : null}
                {entry.classified ? (
                  <span className="border border-spectre/60 px-2 py-1 font-pixel text-[9px] tracking-[0.24em] text-spectre uppercase">
                    Classified
                  </span>
                ) : null}
              </div>
            </Reveal>
            <Reveal delay={0.5} y={20} scroll={false}>
              <h1
                className={`mt-7 font-display text-[clamp(2.4rem,6.4vw,5.4rem)] leading-[0.98] font-extrabold tracking-[-0.04em] ${
                  entry.classified ? "text-paper/45 select-none" : ""
                }`}
              >
                {entry.title}
              </h1>
            </Reveal>
            {entry.subtitle ? (
              <Reveal delay={0.58} y={18} scroll={false}>
                <p className="mt-6 max-w-[46ch] font-display text-[1.25rem] leading-snug font-semibold text-paper/60 md:text-[1.5rem]">
                  {entry.subtitle}
                </p>
              </Reveal>
            ) : null}
          </>
        }
      >
        {entry.summary ? (
          <Reveal delay={0.66} y={18} scroll={false}>
            <p className="mt-8 max-w-[62ch] text-[15.5px] leading-relaxed text-paper/55 md:text-[17px]">
              {entry.summary}
            </p>
          </Reveal>
        ) : null}
      </PageHero>

      {entry.heroImage ? (
        <section className="bg-paper">
          <div className="mx-auto max-w-[1440px] px-5 pt-16 md:px-10 md:pt-24">
            <Reveal y={28}>
              <div className="relative aspect-[16/9] overflow-hidden bg-night">
                {/* Unoptimised for remote Storage URLs is deliberate: the
                    loader would need every future bucket host declared at
                    build time, and these are already sized on upload. */}
                <Image
                  src={entry.heroImage}
                  alt={entry.title}
                  fill
                  priority
                  sizes="(min-width: 1440px) 1360px, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-[820px] px-5 py-20 md:px-10 md:py-28">
          {entry.blocks.length > 0 ? (
            <BlockRenderer blocks={entry.blocks} />
          ) : (
            <p className="border border-ink/10 bg-ink/[0.02] px-6 py-14 text-center text-[15px] text-ink/45">
              {entry.classified
                ? "Contents withheld. Clearance insufficient."
                : "Nothing written here yet."}
            </p>
          )}
        </div>
      </section>

      {chrome && (previous || next) ? (
        <section className="border-t border-ink/10 bg-paper text-ink">
          <div className="mx-auto grid max-w-[1440px] gap-px bg-ink/10 px-0 md:grid-cols-2">
            {[
              { entry: previous, dir: "Previous" as const },
              { entry: next, dir: "Next" as const },
            ].map(({ entry: item, dir }) =>
              item ? (
                <TransitionLink
                  key={dir}
                  href={`/${item.kind}s/${item.slug}`}
                  className="group bg-paper px-5 py-10 transition-colors duration-300 hover:bg-ink hover:text-paper md:px-10 md:py-14"
                >
                  <span className="flex items-center gap-2 font-pixel text-[10px] tracking-[0.3em] text-ink/40 uppercase group-hover:text-paper/50">
                    {dir === "Previous" ? (
                      <ArrowLeft className="h-3.5 w-3.5" />
                    ) : null}
                    {dir}
                    {dir === "Next" ? (
                      <ArrowRight className="h-3.5 w-3.5" />
                    ) : null}
                  </span>
                  <p className="mt-4 font-display text-[1.4rem] leading-tight font-bold tracking-[-0.02em] md:text-[1.7rem]">
                    {item.title}
                  </p>
                </TransitionLink>
              ) : (
                <span key={dir} className="bg-paper px-5 py-10 md:px-10" />
              ),
            )}
          </div>
        </section>
      ) : null}
    </>
  );
}
