import type { Metadata } from "next";
import { listPublished } from "@/lib/entries";
import { Reveal, Words } from "@/components/motion/bits";
import { PixelTag, Chip } from "@/components/ui/chrome";
import { ConceptCard } from "@/components/sections/ConceptCard";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { PixelEgg } from "@/components/ui/PixelEgg";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Game Projects & Concepts",
  description:
    "Spectre Rex game projects — abstract concept explorations and in-development games from our independent studio in Gurugram, India.",
  alternates: { canonical: "/projects" },
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const entries = await listPublished("project");

  return (
    <>
      <PageHero eyebrow="Work / Projects" lines={["Projects,", "from the lab."]}>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-10">
          <Reveal delay={0.9} scroll={false} className="max-w-xl">
            <p className="text-base leading-relaxed text-paper/65 md:text-lg">
              Concepts, prototypes and in-development games. Drafts stay hidden, published work
              appears here.
            </p>
          </Reveal>
          <Reveal delay={1.05} scroll={false}>
            <div className="flex gap-3">
              <Chip tone="paper">Projects — {String(entries.length).padStart(2, "0")}</Chip>
            </div>
          </Reveal>
        </div>
      </PageHero>

      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <PixelTag>Projects / 01</PixelTag>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-pixel text-[10px] tracking-[0.3em] text-ink/45 uppercase">
                Published work only
              </p>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {entries.map((entry, i) => (
              <Reveal key={entry.id} delay={i * 0.1}>
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
                    dark={false}
                  />
                </TransitionLink>
              </Reveal>
            ))}
            {entries.length === 0 ? (
              <p className="col-span-full border border-ink/10 bg-ink/[0.02] px-6 py-14 text-center text-[15px] text-ink/45">
                No projects published yet.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-night text-paper">
        <div className="bg-grid-night pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(75%_75%_at_50%_50%,black,transparent)]" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-5 py-20 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] md:gap-20 md:px-10 md:py-28">
          <Reveal className="flex justify-center">
            <div className="relative w-full max-w-[440px] px-6 py-10 md:px-10 md:py-14">
              <span aria-hidden className="absolute top-0 left-0 h-10 w-10 border-t-2 border-l-2 border-spectre/50" />
              <span aria-hidden className="absolute top-0 right-0 h-10 w-10 border-t-2 border-r-2 border-spectre/50" />
              <span aria-hidden className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-spectre/50" />
              <span aria-hidden className="absolute right-0 bottom-0 h-10 w-10 border-r-2 border-b-2 border-spectre/50" />
              <span aria-hidden className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-paper/15 to-transparent" />
              <span aria-hidden className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-paper/15 to-transparent" />

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
                One egg. No release date. It has survived three office moves, two power cuts and one
                very determined intern.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
