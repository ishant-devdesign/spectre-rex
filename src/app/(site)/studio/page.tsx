import type { Metadata } from "next";
import Image from "next/image";
import { PROCESS, TEAM } from "@/data/content";
import { Clip, Parallax, Reveal, Words } from "@/components/motion/bits";
import { PixelTag, SectionHead } from "@/components/ui/chrome";
import { GameCard, type GameCardData } from "@/components/cards/GameCard";
import { PageHero } from "@/components/sections/PageHero";
import { ListRow } from "@/components/sections/ListRow";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "We’re Spectre Rex — an independent game studio building games, digital experiences, and the strange ideas between them.",
};

const TEAM_CARDS: GameCardData[] = TEAM.map((m) => ({
  index: m.initials,
  title: m.name,
  typeLine: `Type — ${m.role}`,
  description: m.description,
  stats: [
    { label: "DESIGN", value: m.stats.DESIGN },
    { label: "CODE", value: m.stats.CODE },
    { label: "DRAGON", value: m.stats.DRAGON },
  ],
  flavor: m.flavor,
  seed: m.seed,
  initials: m.initials,
}));

export default function StudioPage() {
  return (
    <>
      {/* ============================ HEADER =========================== */}
      <PageHero
        eyebrow="Studio — the den"
        lines={["A small studio building", "colossal worlds."]}
        accent={["colossal"]}
      >
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <Reveal delay={0.9} scroll={false}>
              <p className="max-w-xl text-base leading-relaxed text-paper/65 md:text-lg">
                We’re Spectre Rex — an independent game studio building games,
                digital experiences, and the strange ideas between them.
                Founded in 2026 and based in Gurugram, India, we’re a small
                team with a long attention span and a fondness for the strange.
              </p>
            </Reveal>
            <Reveal delay={1.05} scroll={false}>
              <div className="flex flex-wrap gap-x-10 gap-y-4 md:justify-end">
                <span className="font-pixel text-[10px] tracking-[0.3em] text-paper/40 uppercase">
                  Est. 2026
                </span>
                <span className="font-pixel text-[10px] tracking-[0.3em] text-paper/40 uppercase">
                  Gurugram, India
                </span>
                <span className="font-pixel text-[10px] tracking-[0.3em] text-spectre uppercase">
                  Independent
                </span>
              </div>
            </Reveal>
          </div>
      </PageHero>

      {/* ============================= STORY =========================== */}
      <section className="bg-paper text-ink">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 md:grid-cols-12 md:px-10 md:py-36">
          <div className="md:col-span-3">
            <Reveal>
              <PixelTag>The brief history / 01</PixelTag>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <Words
              lines={[
                "Small on purpose. Obsessed by default. The details most people never notice are the ones we lose sleep over.",
              ]}
              stagger={0.02}
              className="font-display text-[1.65rem] leading-[1.22] font-semibold tracking-[-0.02em] text-balance md:text-[2.4rem]"
            />
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <Reveal>
                <p className="text-[16px] leading-relaxed text-ink/60">
                  We’re a small indie studio with a fondness for strange ideas —
                  building games, interactive experiences, and the worlds
                  between them. Every project starts as a handful of pixels and
                  a question nobody asked.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="text-[16px] leading-relaxed text-ink/60">
                  The best worlds are assembled one deliberate pixel at a time.
                  No filler, no factory-line games — just tight design, sharp
                  craft, and a mascot that refuses to let you near the egg.
                </p>
              </Reveal>
            </div>
          </div>
        </div>

        {/* atmospheric image break */}
        <div className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10 md:pb-36">
          <Clip className="relative h-[46vh] md:h-[64vh]">
            <div className="absolute inset-0">
              <Parallax from={-9} to={9} className="absolute inset-[-10%]">
                <Image
                  src="/assets/img/studio.jpg"
                  alt="The studio at night — dark space, blue light"
                  fill
                  sizes="(min-width: 1440px) 1440px, 100vw"
                  className="object-cover"
                />
              </Parallax>
              <div className="absolute inset-0 bg-night/20" />
            </div>
            <span className="absolute bottom-4 left-5 z-10 font-pixel text-[10px] tracking-[0.3em] text-paper/70 uppercase">
              FIG. 01 — The den, after hours
            </span>
          </Clip>
        </div>
      </section>

      {/* ============================ PROCESS ========================== */}
      <section className="border-t border-ink/10 bg-paper text-ink">
        <div className="mx-auto max-w-[1440px] px-5 pt-24 md:px-10 md:pt-36">
          <SectionHead
            eyebrow="Operating principles / 02"
            lines={["How the work", "gets made."]}
            accent={["work"]}
            aside={
              <p className="font-pixel text-[10px] tracking-[0.3em] text-ink/45 uppercase">
                Four rules, no exceptions
              </p>
            }
          />
        </div>

        {/* Rows sit outside the padded container: ListRow supplies its own
            gutter, so nesting it inside one double-pads the content and
            knocks the meta column out of line with the heading. */}
        <div className="mt-16 border-b border-ink/10">
          {PROCESS.map((step, i) => (
            <Reveal key={step.index} delay={i * 0.06} y={30}>
              <ListRow
                meta={
                  <span className="font-pixel text-[11px] tracking-[0.3em] text-spectre">
                    RULE {step.index}
                  </span>
                }
                title={step.title}
                description={step.description}
              />
            </Reveal>
          ))}
        </div>
        <div className="pb-24 md:pb-36" />
      </section>

      {/* ============================= TEAM ============================ */}
      <section className="relative bg-night text-paper">
        <div className="bg-grid-night pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(80%_60%_at_50%_100%,black,transparent)]" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-36">
          <SectionHead
            tone="paper"
            eyebrow="The party / 03"
            lines={["Two humans.", "One dragon."]}
            accent={["dragon"]}
            aside={
              <p className="font-pixel text-[10px] tracking-[0.3em] text-paper/45 uppercase">
                ( Founding party — Gurugram )
              </p>
            }
          />
          <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-2">
            {TEAM_CARDS.map((card, i) => (
              <Reveal key={card.title} delay={i * 0.12} className="h-full">
                <GameCard data={card} theme="dark" className="h-full" />
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2} className="mt-12 text-center">
            <p className="text-[14px] text-paper/45">
              Stats are playful flavor — the craft is real.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
