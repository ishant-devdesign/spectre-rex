import type { Metadata } from "next";
import { listPublished } from "@/lib/entries";
import { Reveal } from "@/components/motion/bits";
import { PixelTag, Chip } from "@/components/ui/chrome";
import { EntryRow } from "@/components/sections/EntryRow";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Signals",
  description:
    "Signals — transmissions from inside the studio. Irregular, honest, occasionally classified.",
};

export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const entries = await listPublished("signal");

  return (
    <>
      {/* ============================ HEADER =========================== */}
      <PageHero eyebrow="Transmissions" lines={["Signals."]}>
          <Reveal delay={0.9} scroll={false} className="mt-10">
            <p className="max-w-xl text-base leading-relaxed text-paper/65 md:text-lg">
              From inside the studio. Irregular, honest, occasionally
              classified.
            </p>
          </Reveal>
      </PageHero>

      {/* ============================= LIST ============================ */}
      <section className="bg-paper">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 pt-14 pb-10 md:px-10">
          <Reveal>
            <PixelTag>Archive — {entries.length} entries</PixelTag>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex gap-3">
              <Chip tone="ink">Public</Chip>
              <Chip tone="solid">Classified</Chip>
            </div>
          </Reveal>
        </div>
        <div className="border-b border-ink/10">
          {entries.map((entry, i) => (
            <Reveal key={entry.id} delay={i * 0.08} y={24}>
              <EntryRow entry={entry} />
            </Reveal>
          ))}
        </div>
        <div className="pb-24 md:pb-36" />
      </section>
    </>
  );
}
