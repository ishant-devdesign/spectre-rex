import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { listPublished } from "@/lib/entries";
import { Reveal, Words } from "@/components/motion/bits";
import { PixelTag, Chip, Redacted } from "@/components/ui/chrome";
import { ConceptCard } from "@/components/sections/ConceptCard";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { PixelEgg } from "@/components/ui/PixelEgg";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Concepts, not reveals. Our real projects stay under wraps — these are abstract concept explorations.",
};

/* ------------------------------------------------------------------ */
/* Classified card — perma-static noise, lock, stamp. Pure decoration. */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ClassifiedCard({
  index,
  blocks,
  seed,
}: {
  index: string;
  blocks: number;
  seed: number;
}) {
  const rand = mulberry32(seed);
  const cells = Array.from({ length: 96 }).map((_, i) => ({
    key: i,
    on: rand() < 0.42,
    blue: rand() > 0.965,
    flicker: rand() < 0.12,
    delay: rand() * 2.4,
  }));

  return (
    <div className="group relative">
      <div className="relative aspect-[4/3] overflow-hidden bg-night">
        <div
          className="absolute inset-0 grid gap-px p-px opacity-80"
          style={{
            gridTemplateColumns: "repeat(12, 1fr)",
            gridAutoRows: "1fr",
          }}
          aria-hidden
        >
          {cells.map((c) => (
            <span
              key={c.key}
              className={`${
                c.blue ? "bg-spectre" : c.on ? "bg-paper/[0.13]" : "bg-transparent"
              } ${c.flicker ? "animate-flicker" : ""}`}
              style={c.flicker ? { animationDelay: `${c.delay}s` } : undefined}
            />
          ))}
        </div>

        <div className="absolute inset-0 grid place-items-center">
          <span className="grid h-12 w-12 place-items-center border border-paper/25 bg-night/50 text-paper/70 backdrop-blur-sm">
            <Lock className="h-4.5 w-4.5" />
          </span>
        </div>

        <span className="absolute top-3 left-3 border border-paper/25 bg-night/40 px-2 py-1 font-pixel text-[9px] tracking-[0.26em] text-paper/70 uppercase backdrop-blur-sm">
          File {index}
        </span>

        <span className="absolute right-4 bottom-4 -rotate-8 border-2 border-spectre/90 px-3 py-1.5 font-pixel text-[10px] tracking-[0.3em] text-spectre uppercase">
          ACCESS: DENIED
        </span>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4 border-t border-ink/10 pt-4">
        <div>
          <div className="flex items-center font-display text-lg font-bold tracking-[-0.01em] text-ink">
            PROJECT <Redacted count={blocks} />
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
            <Chip tone="solid">Classified</Chip>
            <span className="font-pixel text-[9px] tracking-[0.24em] text-ink/40 uppercase">
              Clearance: dragon only
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  /* Published only. Classified rows are still listed -- their existence is
     the point -- but arrive already scrambled and stripped of imagery, and
     they are not wrapped in a link because their slug 404s by design. */
  const entries = await listPublished("project");
  const visible = entries.filter((entry) => !entry.classified);
  const classified = entries.filter((entry) => entry.classified);

  return (
    <>
      {/* ============================ HEADER =========================== */}
      <PageHero eyebrow="Work / Projects" lines={["From the lab."]}>
          <div className="mt-12 flex flex-wrap items-end justify-between gap-10">
            <Reveal delay={0.9} scroll={false} className="max-w-xl">
              <p className="text-base leading-relaxed text-paper/65 md:text-lg">
                Concepts, not reveals. Our real projects stay under wraps.
                These are abstract concept explorations.
              </p>
            </Reveal>
            <Reveal delay={1.05} scroll={false}>
              <div className="flex gap-3">
                <Chip tone="paper">
                  Concepts — {String(visible.length).padStart(2, "0")}
                </Chip>
                <Chip tone="spectre">
                  Classified — {String(classified.length).padStart(2, "0")}
                </Chip>
              </div>
            </Reveal>
          </div>
      </PageHero>

      {/* =========================== CONCEPTS ========================== */}
      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <PixelTag>Visible concepts / 01</PixelTag>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-pixel text-[10px] tracking-[0.3em] text-ink/45 uppercase">
                Atmosphere studies only
              </p>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {visible.map((entry, i) => (
              <Reveal key={entry.id} delay={i * 0.1}>
                <TransitionLink
                  href={`/projects/${entry.slug}`}
                  aria-label={entry.title || `Project ${entry.code}`}
                  className="group block"
                >
                  <ConceptCard
                    index={entry.code}
                    image={entry.heroImage ?? "/assets/img/concept-1.jpg"}
                    blocks={0}
                    dark={false}
                  />
                  <p className="mt-4 font-display text-[1.15rem] font-bold tracking-[-0.015em] transition-colors group-hover:text-spectre">
                    {entry.title}
                  </p>
                  {entry.summary ? (
                    <p className="mt-1.5 text-[14px] leading-relaxed text-ink/50">
                      {entry.summary}
                    </p>
                  ) : null}
                </TransitionLink>
              </Reveal>
            ))}
            {visible.length === 0 ? (
              <p className="col-span-full border border-ink/10 bg-ink/[0.02] px-6 py-14 text-center text-[15px] text-ink/45">
                Nothing declassified yet.
              </p>
            ) : null}
          </div>

          <div className="mt-24 flex flex-wrap items-end justify-between gap-6 md:mt-32">
            <Reveal>
              <PixelTag>Classified / 02</PixelTag>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-pixel text-[10px] tracking-[0.3em] text-ink/45 uppercase">
                Clearance level: dragon
              </p>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {classified.map((entry, i) => (
              <Reveal key={entry.id} delay={i * 0.1}>
                {/* Not a link: the slug returns 404 for classified entries,
                    and offering a click that dead-ends is worse than none. */}
                <ClassifiedCard
                  index={entry.code}
                  blocks={Math.max(6, entry.title.length)}
                  seed={Number.parseInt(entry.code, 10) || i + 1}
                />
                <p className="mt-4 truncate font-display text-[1.15rem] font-bold tracking-[-0.015em] text-ink/40 select-none">
                  {entry.title}
                </p>
              </Reveal>
            ))}
            {classified.length === 0 ? (
              <p className="col-span-full border border-ink/10 bg-ink/[0.02] px-6 py-14 text-center text-[15px] text-ink/45">
                No classified entries.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* ========================== INCUBATOR ========================== */}
      <section className="relative overflow-hidden bg-night text-paper">
        <div className="bg-grid-night pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(75%_75%_at_50%_50%,black,transparent)]" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-5 py-20 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] md:gap-20 md:px-10 md:py-28">
          <Reveal className="flex justify-center">
            {/* Containment cell: corner brackets, rule marks and a caption
                give the egg somewhere to be, instead of floating in the
                middle of an empty column. */}
            <div className="relative w-full max-w-[440px] px-6 py-10 md:px-10 md:py-14">
              <span
                aria-hidden
                className="absolute top-0 left-0 h-10 w-10 border-t-2 border-l-2 border-spectre/50"
              />
              <span
                aria-hidden
                className="absolute top-0 right-0 h-10 w-10 border-t-2 border-r-2 border-spectre/50"
              />
              <span
                aria-hidden
                className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-spectre/50"
              />
              <span
                aria-hidden
                className="absolute right-0 bottom-0 h-10 w-10 border-r-2 border-b-2 border-spectre/50"
              />
              <span
                aria-hidden
                className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-paper/15 to-transparent"
              />
              <span
                aria-hidden
                className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-paper/15 to-transparent"
              />

              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-night px-3 font-pixel text-[9px] tracking-[0.34em] text-paper/45 uppercase">
                Containment 01
              </span>

              <PixelEgg />

              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-night px-3 font-pixel text-[9px] tracking-[0.34em] text-paper/35 uppercase">
                Do not poke
              </span>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <PixelTag tone="paper">The incubator</PixelTag>
            </Reveal>
            <Words
              as="h2"
              lines={["Something is hatching."]}
              accent={["hatching"]}
              className="mt-6 font-display text-[2.6rem] leading-[0.98] font-extrabold tracking-[-0.035em] md:text-[4.4rem]"
            />
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-[46ch] text-[15px] leading-relaxed text-paper/55">
                One egg. No release date. It has survived three office moves,
                two power cuts and one very determined intern.
              </p>
            </Reveal>
            <Reveal delay={0.15} className="mt-9">
              <div className="relative border border-paper/15 bg-white/[0.03] p-7 md:p-9">
                <span className="absolute -top-3 right-6 rotate-3 border-2 border-spectre/90 bg-night px-2.5 py-1 font-pixel text-[9px] tracking-[0.3em] text-spectre uppercase">
                  Access denied
                </span>
                <dl className="space-y-5">
                  {[
                    {
                      k: "PROJECT",
                      v: <Redacted count={12} tone="spectre" />,
                    },
                    {
                      k: "STATUS",
                      v: (
                        <span className="inline-flex items-center gap-2.5 text-paper">
                          <span className="animate-soft-pulse h-2 w-2 bg-spectre" />
                          IN DEVELOPMENT
                        </span>
                      ),
                    },
                    {
                      k: "RELEASE",
                      v: <span className="text-paper">WHEN IT’S READY</span>,
                    },
                    {
                      k: "ACCESS",
                      v: <span className="text-spectre">DENIED</span>,
                    },
                  ].map((row) => (
                    <div
                      key={row.k}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-paper/10 pb-5 last:border-0 last:pb-0"
                    >
                      <dt className="font-pixel text-[10px] tracking-[0.34em] text-paper/40 uppercase">
                        {row.k}
                      </dt>
                      <dd className="font-pixel text-[12px] tracking-[0.22em]">
                        {row.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mt-7 flex items-center gap-3 font-pixel text-[10px] tracking-[0.3em] text-paper/35 uppercase">
                <span aria-hidden className="h-px w-8 bg-paper/25" />
                The egg does not respond to poking. We have tried.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
