import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { SIGNALS } from "@/data/content";
import { Reveal, Words } from "@/components/motion/bits";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Chip, Redacted } from "@/components/ui/chrome";
import { Marquee } from "@/components/ui/Marquee";
import { DragonMark } from "@/components/svg/DragonMark";
import { PageHero, PAGE_HERO_TITLE } from "@/components/sections/PageHero";

export function generateStaticParams() {
  return SIGNALS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const signal = SIGNALS.find((s) => s.slug === slug);
  if (!signal) return {};
  return {
    title: signal.classified
      ? `Signal ${signal.id} — Classified`
      : `Signal ${signal.id} — ${signal.title}`,
    description: signal.excerpt,
  };
}

export default async function SignalArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const signal = SIGNALS.find((s) => s.slug === slug);
  if (!signal) notFound();

  const index = SIGNALS.findIndex((s) => s.slug === slug);
  const newer = index > 0 ? SIGNALS[index - 1] : null;
  const older = index < SIGNALS.length - 1 ? SIGNALS[index + 1] : null;

  return (
    <>
      {/* ============================ HEADER =========================== */}
      <PageHero
        above={
          <Reveal delay={0.3} y={16} scroll={false}>
            <TransitionLink
              href="/signals"
              className="group inline-flex items-center gap-2 font-pixel text-[11px] tracking-[0.3em] text-paper/50 uppercase transition-colors hover:text-spectre"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              All signals
            </TransitionLink>
          </Reveal>
        }
        titleNode={
          <>
            <Reveal delay={0.4} y={16} scroll={false} className="mt-12">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <span className="font-pixel text-[11px] tracking-[0.3em] text-paper/50 uppercase">
                  SIGNAL {signal.id}
                </span>
                <span className="flex items-center font-pixel text-[11px] tracking-[0.18em] text-paper/40">
                  {signal.dateRedacted ? (
                    <>
                      <Redacted count={2} /> . <Redacted count={2} /> . 26
                    </>
                  ) : (
                    signal.date
                  )}
                </span>
                <Chip tone={signal.classified ? "spectre" : "paper"}>
                  {signal.classified ? "CLASSIFIED" : "PUBLIC"}
                </Chip>
              </div>
            </Reveal>

            <Words
              as="h1"
              scroll={false}
              delay={0.5}
              lines={[signal.title]}
              className={`${PAGE_HERO_TITLE} max-w-4xl`}
            />
          </>
        }
      >
        {signal.blocks ? (
          <Reveal delay={0.9} scroll={false} className="mt-6">
            <Redacted
              count={signal.blocks}
              className="text-[2.2rem] md:text-[3.2rem]"
              tone="spectre"
            />
          </Reveal>
        ) : null}
      </PageHero>

      {/* classified band */}
      {signal.classified && (
        <div className="border-y border-night/20 bg-spectre py-3 text-night">
          <Marquee
            items={["Access denied", "Classified", "Clearance: dragon only"]}
            duration={22}
            className="font-pixel text-[11px] tracking-[0.34em] uppercase [&_span]:mx-8"
          />
        </div>
      )}

      {/* ============================= BODY ============================ */}
      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-[760px] px-5 py-20 md:py-28">
          {signal.body.map((para, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p
                className={
                  i === 0
                    ? "font-display text-[1.55rem] leading-[1.3] font-semibold tracking-[-0.015em] md:text-[2rem]"
                    : signal.classified && i === signal.body.length - 1
                      ? "mt-12 font-pixel text-xl tracking-[0.3em] text-spectre uppercase md:text-2xl"
                      : "mt-8 text-[16.5px] leading-relaxed text-ink/65"
                }
              >
                {para}
              </p>
              {signal.classified && i === 1 && (
                <div
                  aria-hidden
                  className="mt-8 space-y-2.5 border-y border-ink/10 py-6 select-none"
                >
                  <Redacted count={34} className="text-[14px] text-ink/25" />
                  <Redacted count={22} className="text-[14px] text-ink/25" />
                  <Redacted count={29} className="text-[14px] text-ink/25" />
                </div>
              )}
            </Reveal>
          ))}

          <Reveal delay={0.1} className="mt-16">
            <div className="flex items-center gap-4 border-t border-ink/10 pt-8">
              <DragonMark className="h-6 w-auto text-ink" />
              <span className="font-pixel text-[10px] tracking-[0.34em] text-ink/45 uppercase">
                End of transmission — Spectre Rex Studios
              </span>
            </div>
          </Reveal>
        </div>

        {/* prev / next */}
        <div className="border-t border-ink/10">
          <div className="mx-auto grid max-w-[1440px] md:grid-cols-2">
            {older ? (
              <TransitionLink
                href={`/signals/${older.slug}`}
                className="group flex items-center justify-between gap-6 border-b border-ink/10 px-5 py-10 transition-colors hover:bg-ghost/70 md:border-r md:border-b-0 md:px-10"
              >
                <div>
                  <p className="font-pixel text-[10px] tracking-[0.3em] text-ink/40 uppercase">
                    ← Older — SIGNAL {older.id}
                  </p>
                  <p className="mt-3 flex items-center font-display text-xl font-bold tracking-[-0.02em] md:text-2xl">
                    {older.title}
                    {older.blocks ? (
                      <>
                        {" "}
                        <Redacted count={older.blocks} />
                      </>
                    ) : null}
                  </p>
                </div>
              </TransitionLink>
            ) : (
              <div className="hidden md:block" />
            )}
            {newer ? (
              <TransitionLink
                href={`/signals/${newer.slug}`}
                className="group flex items-center justify-between gap-6 px-5 py-10 text-right transition-colors hover:bg-ghost/70 md:px-10"
              >
                <div className="ml-auto">
                  <p className="flex items-center justify-end gap-2 font-pixel text-[10px] tracking-[0.3em] text-ink/40 uppercase">
                    Newer — SIGNAL {newer.id}
                    <ArrowUpRight className="h-3 w-3" />
                  </p>
                  <p className="mt-3 flex items-center justify-end font-display text-xl font-bold tracking-[-0.02em] md:text-2xl">
                    {newer.title}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
              </TransitionLink>
            ) : (
              <TransitionLink
                href="/signals"
                className="group flex items-center justify-between gap-6 px-5 py-10 text-right transition-colors hover:bg-ghost/70 md:px-10"
              >
                <div className="ml-auto">
                  <p className="font-pixel text-[10px] tracking-[0.3em] text-ink/40 uppercase">
                    Archive
                  </p>
                  <p className="mt-3 font-display text-xl font-bold tracking-[-0.02em] md:text-2xl">
                    Back to all signals
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
              </TransitionLink>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
