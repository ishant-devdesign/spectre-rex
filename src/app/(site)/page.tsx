import Image from "next/image";
import {
  DISCIPLINES,
  IDENTITY,
  TICKER_ITEMS,
} from "@/data/content";
import { listPublished } from "@/lib/entries";
import { Clip, Parallax, Reveal, Words } from "@/components/motion/bits";
import { Marquee } from "@/components/ui/Marquee";
import { Button } from "@/components/ui/Button";
import { PixelTag, SectionHead } from "@/components/ui/chrome";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { GameCard, type GameCardData } from "@/components/cards/GameCard";
import { EntryRow } from "@/components/sections/EntryRow";
import { ConceptCard } from "@/components/sections/ConceptCard";
import { DragonMark } from "@/components/svg/DragonMark";
import { ArrowRight } from "lucide-react";

const DISCIPLINE_CARDS: GameCardData[] = DISCIPLINES.map((d) => ({
  index: d.index,
  title: d.title,
  typeLine: "Type — Discipline",
  description: d.description,
  stats: [
    { label: "ART", value: d.stats.ART },
    { label: "CODE", value: d.stats.CODE },
    { label: "PIXEL", value: d.stats.PIXEL },
  ],
  flavor: d.flavor,
  seed: d.seed,
}));

export const dynamic = "force-dynamic";

export default async function HomePage() {
  /* Same source as /projects and /signals. The home page used to render a
     hardcoded copy, so an entry edited in the panel changed on the archive
     pages and not here. */
  const [concepts, signals] = await Promise.all([
    listPublished("project"),
    listPublished("signal"),
  ]);
  const featuredConcepts = concepts.slice(0, 3);
  const featuredSignals = signals.slice(0, 3);

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative flex min-h-svh flex-col overflow-hidden bg-night text-paper">
        <div className="absolute inset-0">
          <div className="animate-hero-zoom absolute inset-0">
            <Image
              src="/assets/img/hero.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-80"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-night/75 via-night/20 to-night" />
          <div className="absolute inset-0 bg-gradient-to-r from-night/55 to-transparent" />
          <div className="bg-grid-night absolute inset-0 opacity-35" />
        </div>

        <DragonMark
          aria-hidden
          className="animate-float pointer-events-none absolute top-[14%] -right-[5%] w-[36vw] max-w-[540px] text-paper opacity-[0.06]"
        />

        {/* corner marginalia */}
        <div className="pointer-events-none absolute top-28 right-5 hidden text-right md:right-10 lg:block">
          <Reveal delay={1.5} scroll={false}>
            <p className="font-pixel text-[10px] leading-relaxed tracking-[0.3em] text-paper/40 uppercase">
              28.4595° N / 77.0266° E
              <br />
              Grid online
            </p>
          </Reveal>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-5 pt-36 pb-14 md:px-10 md:pb-20">
          <Reveal delay={0.5} y={20} scroll={false}>
            <PixelTag tone="paper">
              Independent Game Studio · Gurugram, India
            </PixelTag>
          </Reveal>

          <Words
            as="h1"
            scroll={false}
            delay={0.62}
            lines={["We build worlds", "out of pixels."]}
            accent={["pixels"]}
            className="mt-8 font-display text-[clamp(3.1rem,9.6vw,9rem)] leading-[0.94] font-extrabold tracking-[-0.04em]"
          />

          <div className="mt-12 flex flex-wrap items-end justify-between gap-x-16 gap-y-10">
            <Reveal delay={1.15} scroll={false} className="max-w-xl">
              <p className="text-base leading-relaxed text-paper/65 md:text-lg">
                Spectre Rex Studios is an independent game studio crafting
                memorable games and digital experiences — bold ideas, built
                pixel by pixel.
              </p>
            </Reveal>
            <Reveal delay={1.3} scroll={false}>
              <div className="flex flex-wrap gap-4">
                <Button href="/studio" variant="light">
                  Explore the studio
                </Button>
                <Button href="/projects" variant="outline-dark">
                  See our work
                </Button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-14 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex">
          <Reveal delay={1.9} y={10} scroll={false}>
            <span className="flex flex-col items-center gap-1.5">
              <span className="animate-cue h-1.5 w-1.5 bg-spectre" />
              <span
                className="animate-cue h-1.5 w-1.5 bg-paper/60"
                style={{ animationDelay: "0.18s" }}
              />
              <span className="mt-2 font-pixel text-[9px] tracking-[0.4em] text-paper/40 uppercase">
                Scroll
              </span>
            </span>
          </Reveal>
        </div>
      </section>

      {/* =========================== TICKER =========================== */}
      <section className="border-y border-paper/10 bg-night py-5 text-paper">
        <Marquee items={TICKER_ITEMS} duration={34} />
      </section>

      {/* ============================ INTRO =========================== */}
      <section className="relative bg-paper text-ink">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 md:grid-cols-12 md:px-10 md:py-40">
          <div className="md:col-span-3">
            <Reveal>
              <PixelTag>The studio / 01</PixelTag>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <Words
              lines={[
                "We’re a small indie studio with a fondness for strange ideas — building games, interactive experiences, and the worlds between them.",
              ]}
              stagger={0.018}
              className="font-display text-[1.65rem] leading-[1.22] font-semibold tracking-[-0.02em] text-balance md:text-[2.45rem]"
            />
            <Reveal delay={0.15} className="mt-12 max-w-2xl">
              <p className="text-[16.5px] leading-relaxed text-ink/60">
                Spectre Rex is built on a simple belief: the best worlds are
                assembled one deliberate pixel at a time. No filler, no
                factory-line games — just tight design, sharp craft, and an
                obsession with the details most people never notice.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========================= DISCIPLINES ======================== */}
      <section className="relative border-t border-ink/10 bg-paper">
        <div className="bg-grid-paper pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(90%_70%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-36">
          <SectionHead
            eyebrow="Disciplines / 02"
            lines={["Four crafts,", "dealt face-up."]}
            accent={["dealt"]}
            aside={
              <p className="font-pixel text-[10px] tracking-[0.3em] text-ink/45 uppercase">
                ( Hover a card to inspect )
              </p>
            }
          />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {DISCIPLINE_CARDS.map((card, i) => (
              <Reveal key={card.index} delay={i * 0.09} className="h-full">
                <GameCard data={card} theme="light" className="h-full" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= WORK =========================== */}
      <section className="relative bg-night text-paper">
        <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-36">
          <SectionHead
            tone="paper"
            eyebrow="Work / 03"
            lines={["Concepts in development."]}
            aside={
              <Button href="/projects" variant="outline-dark">
                Enter the lab
              </Button>
            }
          />
          <Reveal delay={0.1} className="mt-8 max-w-xl">
            <p className="text-[15.5px] leading-relaxed text-paper/55">
              Abstract concept explorations — the real projects stay under
              wraps.
            </p>
          </Reveal>
          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {featuredConcepts.map((entry, i) => (
              <Reveal key={entry.id} delay={i * 0.1}>
                {entry.classified ? (
                  /* No link: a classified slug 404s by design. */
                  <ConceptCard
                    index={entry.code}
                    image="/assets/img/concept-1.jpg"
                    title={entry.title}
                    caption="Clearance: dragon only"
                    dark
                  />
                ) : (
                  <TransitionLink
                    href={`/projects/${entry.slug}`}
                    aria-label={entry.title || `Project ${entry.code}`}
                    className="group block"
                  >
                    <ConceptCard
                      index={entry.code}
                      image={entry.heroImage ?? "/assets/img/concept-1.jpg"}
                      title={entry.title || `Project ${entry.code}`}
                      caption={entry.subtitle || "Concept exploration"}
                      dark
                    />
                  </TransitionLink>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= IDENTITY ============================ */}
      {/* A specimen sheet rather than a pale strip of facts: dark plate,
          numbered cells, and the live status pulled out as its own chip
          so "Independent" and "Building" stop colliding. */}
      <section className="relative overflow-hidden bg-night text-paper">
        <div
          aria-hidden
          className="bg-grid-night pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(90%_70%_at_50%_50%,black,transparent)]"
        />
        <div className="relative mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <PixelTag tone="paper">Identity / 04</PixelTag>
            <span className="font-pixel text-[9px] tracking-[0.34em] text-paper/30 uppercase">
              Specimen sheet — rev. 01
            </span>
          </div>

          <dl className="mt-10 grid grid-cols-1 gap-px border border-paper/12 bg-paper/12 sm:grid-cols-2 lg:grid-cols-4">
            {IDENTITY.map((cell, i) => (
              <div
                key={cell.label}
                className="group relative bg-night px-6 py-8 transition-colors duration-500 hover:bg-white/[0.03] md:px-7 md:py-10"
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-0 h-[2px] w-0 bg-spectre transition-all duration-500 group-hover:w-full"
                />
                <Reveal delay={i * 0.07} y={16}>
                  <div className="flex items-center gap-2.5">
                    <span className="font-pixel text-[10px] text-spectre">
                      {cell.index}
                    </span>
                    <dt className="font-pixel text-[9.5px] tracking-[0.34em] text-paper/40 uppercase">
                      {cell.label}
                    </dt>
                  </div>

                  <dd className="mt-4 font-display text-[1.55rem] leading-none font-extrabold tracking-[-0.025em] text-paper md:text-[1.8rem]">
                    {cell.value}
                  </dd>

                  {"live" in cell ? (
                    <span className="mt-4 inline-flex items-center gap-2 border border-spectre/40 px-2.5 py-1 font-pixel text-[9px] tracking-[0.3em] text-spectre uppercase">
                      <span
                        aria-hidden
                        className="animate-soft-pulse h-1.5 w-1.5 bg-spectre"
                      />
                      {cell.live}
                    </span>
                  ) : (
                    <span className="mt-4 block font-pixel text-[9px] tracking-[0.3em] text-paper/30 uppercase">
                      {cell.note}
                    </span>
                  )}
                </Reveal>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* =========================== SIGNALS =========================== */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1440px] px-5 pt-24 pb-14 md:px-10 md:pt-36">
          <SectionHead
            eyebrow="Signals / 04"
            lines={["Transmissions", "from inside."]}
            aside={
              <TransitionLink
                href="/signals"
                className="group inline-flex items-center gap-2 text-[15px] font-semibold text-ink transition-colors hover:text-spectre"
              >
                All signals
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </TransitionLink>
            }
          />
        </div>
        <div className="border-b border-ink/10 pb-0">
          {featuredSignals.map((entry) => (
            <Reveal key={entry.id} y={24}>
              <EntryRow entry={entry} showSummary={false} />
            </Reveal>
          ))}
        </div>
        <div className="pb-24 md:pb-36" />
      </section>

      {/* ============ image break into footer ============ */}
      <section aria-hidden className="relative bg-night">
        <Clip className="relative h-[42vh] md:h-[58vh]">
          <div className="absolute inset-0">
            <Parallax from={-8} to={8} className="absolute inset-[-10%]">
              <Image
                src="/assets/img/studio.jpg"
                alt=""
                fill
                sizes="100vw"
                className="object-cover opacity-70"
              />
            </Parallax>
            <div className="absolute inset-0 bg-gradient-to-b from-night via-transparent to-night" />
          </div>
        </Clip>
      </section>
    </>
  );
}
