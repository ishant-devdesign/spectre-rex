import { ArrowUpRight } from "lucide-react";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { Reveal, Words } from "@/components/motion/bits";
import { Button } from "@/components/ui/Button";
import { PixelTag } from "@/components/ui/chrome";
import { LogoMark } from "@/components/svg/LogoMark";
import { DragonMark } from "@/components/svg/DragonMark";
import { CONTACTS } from "@/data/content";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "STUDIO",
    links: [
      { label: "About", href: "/studio" },
      { label: "Team", href: "/studio" },
      { label: "Process", href: "/studio" },
    ],
  },
  {
    title: "WORK",
    links: [
      { label: "Projects", href: "/projects" },
      { label: "Signals", href: "/signals" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "CONNECT",
    // Derived from CONTACTS so the footer cannot drift out of step with the
    // contact page, which is what happened when both lists were hand-written.
    links: CONTACTS.map((c) => ({
      label: c.label.charAt(0) + c.label.slice(1).toLowerCase(),
      href: `mailto:${c.email}`,
    })),
  },
];

const SOCIALS = [
  { label: "IG", name: "Instagram" },
  { label: "YT", name: "YouTube" },
  { label: "X", name: "X" },
  { label: "in", name: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night text-paper">
      <div className="bg-grid-night pointer-events-none absolute inset-0 opacity-45" />
      <DragonMark
        aria-hidden
        className="animate-float pointer-events-none absolute -right-[7%] -bottom-[12%] w-[54vw] max-w-[640px] text-paper opacity-[0.05]"
      />

      <div className="relative">
        {/* ------------ CTA band ------------ */}
        <div className="mx-auto max-w-[1440px] px-5 pt-24 pb-16 md:px-10 md:pt-32 md:pb-24">
          <Reveal>
            <PixelTag tone="paper">NEXT QUEST</PixelTag>
          </Reveal>
          <Words
            as="h2"
            lines={["Let’s build something", "worth playing."]}
            accent={["playing"]}
            className="mt-7 font-display text-[clamp(2.6rem,7.2vw,6.2rem)] leading-[1.0] font-extrabold tracking-[-0.035em]"
          />
          <Reveal delay={0.25} className="mt-12">
            <Button href="/contact" variant="light">
              Talk to the dragon
            </Button>
          </Reveal>
        </div>

        {/* ------------ columns ------------ */}
        <div className="border-t border-paper/10">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-12 md:px-10 md:py-20">
            <div className="md:col-span-5">
              <LogoMark className="h-[34px] w-auto md:h-[42px]" />
              <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-paper/55">
                An independent game studio crafting memorable games and digital
                experiences — bold ideas, built pixel by pixel.
              </p>
              <div className="mt-8 flex gap-2.5">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={`${s.name} — coming soon`}
                    title="Coming soon"
                    className="grid h-10 w-10 place-items-center border border-paper/20 font-pixel text-[11px] tracking-[0.08em] text-paper/70 transition-colors duration-300 hover:border-spectre hover:bg-spectre hover:text-night"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {COLUMNS.map((col) => (
              <div key={col.title} className="md:col-span-2">
                <h3 className="flex items-center gap-2 font-pixel text-[10px] tracking-[0.34em] text-paper/40 uppercase">
                  <span className="h-1.5 w-1.5 bg-spectre" aria-hidden />
                  {col.title}
                </h3>
                <ul className="mt-6 space-y-3.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <TransitionLink
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-[14.5px] font-medium text-paper/60 transition-colors duration-300 hover:text-paper"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </TransitionLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="md:col-span-1" />
          </div>
        </div>

        {/* ------------ bottom bar ------------ */}
        <div className="border-t border-paper/10">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-6 md:px-10">
            <p className="font-pixel text-[10px] tracking-[0.22em] text-paper/40 uppercase">
              © 2026 Spectre Rex Studios Private Limited
            </p>
            <p className="font-pixel text-[10px] tracking-[0.22em] text-paper/40 uppercase">
              Gurugram, India · CIN U58203HR2026PTC147441
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
