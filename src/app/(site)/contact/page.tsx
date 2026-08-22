import type { Metadata } from "next";
import { CONTACTS, STUDIO_META } from "@/data/content";
import { Reveal, Words } from "@/components/motion/bits";
import { Button } from "@/components/ui/Button";
import { ListRow } from "@/components/sections/ListRow";
import { PixelTag } from "@/components/ui/chrome";
import { PageHero } from "@/components/sections/PageHero";
import { Clock, FileText, MapPin, Phone, type LucideIcon } from "lucide-react";
import { ContactForm } from "@/components/sections/ContactForm";
import { SubscribeForm } from "@/components/sections/SubscribeForm";
import { DragonMark } from "@/components/svg/DragonMark";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Have a project, an idea, or just want to talk games? The dragon reads every line.",
};

const DEN_ICONS: Record<string, LucideIcon> = {
  STUDIO: MapPin,
  PHONE: Phone,
  CIN: FileText,
  TIMEZONE: Clock,
};

export default function ContactPage() {
  return (
    <>
      {/* ============================ HEADER =========================== */}
      <PageHero eyebrow="Contact" lines={["Let’s talk."]}>
          <div className="mt-14 grid gap-12 md:grid-cols-2 md:items-end">
            <Reveal delay={0.9} scroll={false}>
              <p className="font-display text-[1.5rem] leading-snug font-semibold tracking-[-0.02em] md:text-[1.9rem]">
                Have something worth saying?
              </p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-paper/60 md:text-lg">
                Have a project, an idea, or just want to talk games? The
                dragon reads every line.
              </p>
            </Reveal>
            <Reveal delay={1.05} scroll={false}>
              <div className="md:flex md:justify-end">
                <Button href="mailto:hello@spectrerex.com" variant="light">
                  Talk to the dragon
                </Button>
              </div>
            </Reveal>
          </div>
      </PageHero>

      {/* ========================== CHANNELS =========================== */}
      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <PixelTag>Channels / 01</PixelTag>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-pixel text-[10px] tracking-[0.3em] text-ink/45 uppercase">
                Avg. response: one dragon nap
              </p>
            </Reveal>
          </div>

        </div>

        {/* Channels sit outside the padded container so the row hover can
            run the full width, matching the signal archive. */}
        <div className="mt-14 border-b border-ink/10">
          {CONTACTS.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.07} y={26}>
              <ListRow
                href={`mailto:${c.email}`}
                external
                ariaLabel={`Email ${c.label.toLowerCase()} — ${c.email}`}
                breakTitle
                meta={
                  <span className="font-pixel text-[11px] tracking-[0.3em] text-ink/50 uppercase">
                    {c.label}
                  </span>
                }
                title={c.email}
                description={c.note}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ FORM ============================= */}
      <section className="relative overflow-hidden bg-night text-paper">
        <div
          aria-hidden
          className="bg-grid-night pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(85%_70%_at_50%_40%,black,transparent)]"
        />
        <DragonMark
          aria-hidden
          className="animate-float pointer-events-none absolute -bottom-[12%] -left-[8%] w-[38vw] max-w-[460px] text-paper opacity-[0.04]"
        />
        <div className="relative mx-auto grid max-w-[1440px] gap-14 px-5 py-24 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-20 md:px-10 md:py-32">
          <div>
            <Reveal>
              <PixelTag tone="paper">Send a transmission / 02</PixelTag>
            </Reveal>
            <Words
              as="h2"
              lines={["Write to", "the studio."]}
              accent={["studio."]}
              className="mt-6 font-display text-[2.6rem] leading-[0.98] font-extrabold tracking-[-0.035em] md:text-[3.6rem]"
            />
            <Reveal delay={0.12}>
              <p className="mt-7 max-w-[42ch] text-[15px] leading-relaxed text-paper/55">
                Pitches, press, partnerships, or a question nobody asked. Every
                message lands in the same inbox and a human reads it.
              </p>
            </Reveal>
            <Reveal delay={0.2} className="mt-10">
              <dl className="grid gap-5 border-t border-paper/12 pt-8">
                {[
                  { k: "Typical reply", v: "Under 2 working days" },
                  { k: "Best for", v: "Anything with a deadline" },
                  { k: "Prefer email?", v: CONTACTS[0].email },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="flex flex-wrap items-baseline justify-between gap-3"
                  >
                    <dt className="font-pixel text-[10px] tracking-[0.3em] text-paper/35 uppercase">
                      {row.k}
                    </dt>
                    <dd className="font-pixel text-[11px] tracking-[0.18em] text-paper/70">
                      {row.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.1} y={30}>
            <ContactForm />

            {/* Subscribe sits under the form rather than in its own section:
                someone who just wrote to the studio is the most likely person
                to want the devlog, and a separate band would repeat the same
                dark treatment twice on one page. */}
            <div className="mt-12 border-t border-paper/12 pt-10">
              <SubscribeForm />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ THE DEN ========================== */}
      <section className="border-t border-ink/10 bg-paper text-ink">
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <Reveal>
              <PixelTag>The den / 03</PixelTag>
            </Reveal>
            <Reveal delay={0.08}>
              <span className="font-pixel text-[9px] tracking-[0.34em] text-ink/35 uppercase">
                28.4595° N / 77.0266° E
              </span>
            </Reveal>
          </div>

          <dl className="mt-12 grid gap-px border border-ink/12 bg-ink/12 sm:grid-cols-2 lg:grid-cols-4">
            {STUDIO_META.map((cell, i) => {
              const Icon = DEN_ICONS[cell.label] ?? MapPin;
              return (
                <div
                  key={cell.label}
                  className="group relative bg-paper px-6 py-8 transition-colors duration-500 hover:bg-ghost/60 md:px-7 md:py-10"
                >
                  <span
                    aria-hidden
                    className="absolute top-0 left-0 h-[2px] w-0 bg-spectre transition-all duration-500 group-hover:w-full"
                  />
                  <Reveal delay={i * 0.07} y={16}>
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-3.5 w-3.5 text-spectre" />
                      <dt className="font-pixel text-[9.5px] tracking-[0.34em] text-ink/40 uppercase">
                        {cell.label}
                      </dt>
                    </div>
                    <dd className="mt-4 space-y-1">
                      {cell.value.map((line) => (
                        <p
                          key={line}
                          className="font-display text-[15.5px] leading-snug font-bold tracking-[-0.01em] break-words md:text-base"
                        >
                          {line}
                        </p>
                      ))}
                    </dd>
                  </Reveal>
                </div>
              );
            })}
          </dl>

          <Reveal delay={0.2} className="mt-10">
            <p className="flex items-center gap-3 font-pixel text-[10px] tracking-[0.26em] text-ink/40 uppercase">
              <span aria-hidden className="h-px w-8 bg-ink/20" />
              Spectre Rex Studios Private Limited · Registered in Haryana, India
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
