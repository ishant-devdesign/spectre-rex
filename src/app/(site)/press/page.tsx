import type { Metadata } from "next";
import Image from "next/image";
import { Download, Mail } from "lucide-react";
import { CONTACTS, STUDIO_META, TEAM } from "@/data/content";
import { Reveal, Words } from "@/components/motion/bits";
import { PixelTag, SectionHead, Chip } from "@/components/ui/chrome";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/svg/LogoMark";
import { DragonMark } from "@/components/svg/DragonMark";

export const metadata: Metadata = {
  title: "Press Kit",
  description:
    "Press kit for Spectre Rex Studios — an independent game development studio in Gurugram, India. Logos, key art, and boilerplate for press and media.",
  alternates: { canonical: "/press" },
};

/* ------------------------------------------------------------------ */
/* Downloadable brand assets. Files live in /public so they are served
   at stable URLs; the `download` attribute saves them under a clean
   name rather than the hashed public path.                             */
/* ------------------------------------------------------------------ */

const LOGO_ASSETS = [
  {
    name: "Primary logo",
    file: "/assets/Logo.svg",
    filename: "spectre-rex-logo.svg",
    meta: "SVG · vector",
    kind: "logo" as const,
    bg: "light" as const,
  },
  {
    name: "Wordmark — light",
    file: "/assets/email/logo-paper.png",
    filename: "spectre-rex-logo-light.png",
    meta: "PNG · dark backgrounds",
    kind: "raster" as const,
    bg: "dark" as const,
  },
  {
    name: "Wordmark — dark",
    file: "/assets/email/logo-ink.png",
    filename: "spectre-rex-logo-dark.png",
    meta: "PNG · light backgrounds",
    kind: "raster" as const,
    bg: "light" as const,
  },
  {
    name: "Dragon mark",
    file: "/assets/Dragon.svg",
    filename: "spectre-rex-dragon.svg",
    meta: "SVG · vector",
    kind: "dragon" as const,
    bg: "light" as const,
  },
  {
    name: "Dragon mark — blue",
    file: "/assets/email/dragon.png",
    filename: "spectre-rex-dragon.png",
    meta: "PNG · 216×200",
    kind: "dragon-raster" as const,
    bg: "dark" as const,
  },
];

const KEY_ART = [
  {
    name: "Hero — pixel world",
    file: "/assets/img/hero.jpg",
    meta: "1376×768 · JPG",
  },
  {
    name: "Concept study 01",
    file: "/assets/img/concept-1.jpg",
    meta: "1408×768 · JPG",
  },
  {
    name: "Concept study 02",
    file: "/assets/img/concept-2.jpg",
    meta: "1408×768 · JPG",
  },
  {
    name: "Concept study 03",
    file: "/assets/img/concept-3.jpg",
    meta: "1408×768 · JPG",
  },
  {
    name: "The den — studio",
    file: "/assets/img/studio.jpg",
    meta: "1408×768 · JPG",
  },
];

const PRESS_EMAIL = CONTACTS.find((c) => c.label === "PRESS")?.email ?? "";

const FACTS: { k: string; v: string }[] = [
  { k: "Founded", v: "2026" },
  { k: "Status", v: "Independent" },
  { k: "Based", v: "Gurugram, Haryana, India" },
  { k: "CIN", v: "U58203HR2026PTC147441" },
  { k: "Team", v: TEAM.map((m) => m.name).join(" · ") },
  { k: "Press", v: PRESS_EMAIL },
];

/* ------------------------------------------------------------------ */
/* Brand palette + type, kept in step with globals.css @theme.          */
/* ------------------------------------------------------------------ */

const COLORS: {
  name: string;
  hex: string;
  value: string;
  role: string;
  light: boolean;
}[] = [
  {
    name: "Night",
    hex: "#0B1014",
    value: "0B1014",
    role: "Dark sections & backgrounds",
    light: false,
  },
  {
    name: "Paper",
    hex: "#F2F0EA",
    value: "F2F0EA",
    role: "Light sections & surfaces",
    light: true,
  },
  {
    name: "Ink",
    hex: "#242424",
    value: "242424",
    role: "Body copy & light-section text",
    light: false,
  },
  {
    name: "Spectre",
    hex: "#35AEE4",
    value: "35AEE4",
    role: "Brand accent — the blue",
    light: false,
  },
  {
    name: "Ghost",
    hex: "#E5F4FC",
    value: "E5F4FC",
    role: "Blue tint, hover states",
    light: true,
  },
];

const TYPEFACES: {
  name: string;
  role: string;
  sample: string;
  className: string;
  note: string;
}[] = [
  {
    name: "Sora",
    role: "Display — headlines & titles",
    sample: "Spectre Rex Studios",
    className:
      "font-display font-extrabold tracking-[-0.02em] text-[2rem] md:text-[2.6rem] leading-tight",
    note: "600 · 700 · 800",
  },
  {
    name: "Inter",
    role: "Body — copy & UI text",
    sample: "Independent game development studio, Gurugram.",
    className: "font-body text-[1.1rem] md:text-[1.25rem] leading-relaxed",
    note: "400 · 500 · 600",
  },
  {
    name: "Pixelify Sans",
    role: "Pixel — labels, meta & accents",
    sample: "CLEARANCE: DRAGON ONLY",
    className:
      "font-pixel text-[1.1rem] md:text-[1.3rem] tracking-[0.22em] uppercase",
    note: "400 · 500 · 600 · 700",
  },
];

const BOILERPLATE_SHORT =
  "Spectre Rex Studios is an independent game development studio in Gurugram, India, crafting original games, game art, and digital experiences — bold ideas, built pixel by pixel.";

const BOILERPLATE_LONG = [
  "Spectre Rex Studios is an independent game development studio based in Gurugram, India. Founded in 2026, the studio builds original games, game art, and the strange digital experiences between them — from tight systems and sharp craft to the details most people never notice.",
  "The studio works two ways: as an independent outfit shipping its own worlds, and as a boutique team taking on game development, art direction, and web experience work. Every project starts as a handful of pixels and a question nobody asked.",
  "Its mascot — a pixel dragon of unknown temperament — guards an egg of unspecified contents.",
];

export default function PressPage() {
  return (
    <>
      {/* ============================ HEADER ============================ */}
      <PageHero eyebrow="Press / Media" lines={["The press kit."]}>
        <div className="mt-12 flex flex-wrap items-end justify-between gap-10">
          <Reveal delay={0.9} scroll={false} className="max-w-xl">
            <p className="text-base leading-relaxed text-paper/65 md:text-lg">
              Everything you need to write about the studio — logo files, key
              art, boilerplate, and the facts. Download them, use them, credit
              the dragon.
            </p>
          </Reveal>
          <Reveal delay={1.05} scroll={false}>
            <Button href={`mailto:${PRESS_EMAIL}`} variant="light" external>
              <Mail className="h-4 w-4" />
              {PRESS_EMAIL}
            </Button>
          </Reveal>
        </div>
      </PageHero>

      {/* ========================= BOILERPLATE ========================= */}
      <section className="bg-paper text-ink">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 md:grid-cols-12 md:px-10 md:py-32">
          <div className="md:col-span-3">
            <Reveal>
              <PixelTag>Boilerplate / 01</PixelTag>
            </Reveal>
          </div>
          <div className="md:col-span-9">
            <Reveal>
              <p className="font-display text-[1.6rem] leading-snug font-semibold tracking-[-0.02em] text-balance md:text-[2.1rem]">
                {BOILERPLATE_SHORT}
              </p>
            </Reveal>
            <div className="mt-10 space-y-6">
              {BOILERPLATE_LONG.map((para, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <p className="max-w-3xl text-[16px] leading-relaxed text-ink/65">
                    {para}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================== FACT SHEET ========================== */}
      <section className="border-t border-ink/10 bg-paper">
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
          <Reveal>
            <PixelTag>Fact sheet / 02</PixelTag>
          </Reveal>
          <dl className="mt-12 grid gap-px border border-ink/12 bg-ink/12 sm:grid-cols-2 lg:grid-cols-3">
            {FACTS.map((cell) => (
              <div key={cell.k} className="bg-paper px-6 py-8 md:px-7 md:py-10">
                <dt className="font-pixel text-[9.5px] tracking-[0.34em] text-ink/40 uppercase">
                  {cell.k}
                </dt>
                <dd className="mt-4 font-display text-[15.5px] leading-snug font-bold tracking-[-0.01em] break-words">
                  {cell.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* =========================== LOGOS =========================== */}
      <section className="relative bg-night text-paper">
        <div className="bg-grid-night pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
          <SectionHead
            tone="paper"
            eyebrow="Logos / 03"
            lines={["Marks and", "wordmarks."]}
            accent={["wordmarks."]}
            aside={
              <p className="max-w-xs font-pixel text-[10px] tracking-[0.3em] text-paper/45 uppercase">
                Clear space: keep the mark pixel-crisp, never stretched
              </p>
            }
          />

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LOGO_ASSETS.map((asset, i) => (
              <Reveal key={asset.filename} delay={i * 0.07}>
                <a
                  href={asset.file}
                  download={asset.filename}
                  className="group flex h-full flex-col border border-paper/12 bg-white/[0.02] transition-colors duration-300 hover:border-spectre/50 hover:bg-white/[0.04]"
                >
                  <div
                    className={`flex min-h-[160px] flex-1 items-center justify-center p-8 ${
                      asset.bg === "light" ? "bg-paper" : ""
                    }`}
                  >
                    {asset.kind === "logo" ? (
                      <LogoMark
                        className={`h-auto w-[220px] ${
                          asset.bg === "light" ? "text-ink" : "text-paper"
                        }`}
                      />
                    ) : asset.kind === "dragon" ? (
                      <DragonMark
                        className={`h-20 w-auto ${
                          asset.bg === "light" ? "text-ink" : "text-paper"
                        }`}
                      />
                    ) : asset.kind === "dragon-raster" ? (
                      <Image
                        src={asset.file}
                        alt={asset.name}
                        width={216}
                        height={200}
                        className="h-20 w-auto"
                        unoptimized
                      />
                    ) : (
                      <Image
                        src={asset.file}
                        alt={asset.name}
                        width={220}
                        height={56}
                        className="h-auto w-[220px]"
                        unoptimized
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-paper/10 px-5 py-4">
                    <div>
                      <p className="text-[14px] font-semibold">{asset.name}</p>
                      <p className="mt-0.5 font-pixel text-[9px] tracking-[0.24em] text-paper/40 uppercase">
                        {asset.meta}
                      </p>
                    </div>
                    <Download className="h-4 w-4 text-paper/50 transition-colors group-hover:text-spectre" />
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== COLORS =========================== */}
      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
          <SectionHead eyebrow="Brand colours / 04" lines={["The palette."]} />
          <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-5">
            {COLORS.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.06}>
                <div className="border border-ink/10">
                  <div
                    className="flex aspect-square items-end justify-between p-4"
                    style={{ backgroundColor: c.hex }}
                    aria-label={`${c.name} ${c.hex}`}
                  >
                    <span
                      className={`font-pixel text-[10px] tracking-[0.2em] uppercase ${
                        c.light ? "text-ink/70" : "text-paper/80"
                      }`}
                    >
                      {c.value}
                    </span>
                  </div>
                  <div className="border-t border-ink/10 px-4 py-3.5">
                    <p className="text-[14px] font-semibold">{c.name}</p>
                    <p className="mt-1 font-pixel text-[9px] tracking-[0.2em] text-ink/45 uppercase">
                      {c.role}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== TYPOGRAPHY ========================== */}
      <section className="relative border-t border-ink/10 bg-night text-paper">
        <div className="bg-grid-night pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
          <SectionHead
            tone="paper"
            eyebrow="Typography / 05"
            lines={["The type."]}
          />
          <div className="mt-16 grid gap-6">
            {TYPEFACES.map((f, i) => (
              <Reveal key={f.name} delay={i * 0.08}>
                <div className="grid gap-6 border border-paper/12 bg-white/[0.02] p-8 md:grid-cols-12 md:p-10">
                  <div className="md:col-span-4">
                    <p className="text-[16px] font-semibold">{f.name}</p>
                    <p className="mt-1.5 text-[13.5px] text-paper/50">
                      {f.role}
                    </p>
                    <p className="mt-4 font-pixel text-[10px] tracking-[0.24em] text-spectre uppercase">
                      {f.note}
                    </p>
                  </div>
                  <div className="flex items-center md:col-span-8">
                    <p className={f.className}>{f.sample}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== KEY ART =========================== */}
      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
          <SectionHead
            eyebrow="Key art / 06"
            lines={["Images for", "the record."]}
            accent={["record."]}
          />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {KEY_ART.map((art, i) => (
              <Reveal key={art.file} delay={i * 0.06}>
                <a
                  href={art.file}
                  download={art.file.split("/").pop()}
                  className="group block border border-ink/10 bg-ink/[0.02]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={art.file}
                      alt={art.name}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="text-[14px] font-semibold">{art.name}</p>
                      <p className="mt-0.5 font-pixel text-[9px] tracking-[0.24em] text-ink/40 uppercase">
                        {art.meta}
                      </p>
                    </div>
                    <Download className="h-4 w-4 text-ink/50 transition-colors group-hover:text-spectre" />
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ CONTACT =========================== */}
      <section className="relative overflow-hidden border-t border-ink/10 bg-night text-paper">
        <DragonMark
          aria-hidden
          className="animate-float pointer-events-none absolute -bottom-[14%] -right-[8%] w-[40vw] max-w-[480px] text-paper opacity-[0.05]"
        />
        <div className="relative mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32">
          <SectionHead
            tone="paper"
            eyebrow="Media contact / 07"
            lines={["Questions?", "Ask the dragon."]}
            accent={["dragon."]}
          />
          <Reveal delay={0.1} className="mt-12">
            <p className="max-w-xl text-base leading-relaxed text-paper/60">
              For interviews, review builds, or anything that isn&apos;t
              answered by the kit — write to {PRESS_EMAIL}. We read every line,
              usually after one dragon nap.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-4">
            <Button href={`mailto:${PRESS_EMAIL}`} variant="light" external>
              Email the studio
            </Button>
            <Button href="/contact" variant="outline-dark">
              All contact channels
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
