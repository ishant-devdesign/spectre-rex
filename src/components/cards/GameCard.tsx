"use client";

import gsap from "gsap";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useCoarsePointer, useReducedMotion } from "@/lib/hooks";
import { DragonMark } from "@/components/svg/DragonMark";

/* ------------------------------------------------------------------ */
/* Seeded pixel glyph — a mirrored specimen unique per card            */
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

export function PixelGlyph({
  seed,
  className = "",
}: {
  seed: number;
  className?: string;
}) {
  const cells = useMemo(() => {
    const rand = mulberry32(seed);
    const out: { x: number; y: number; blue: boolean }[] = [];
    const GLYPH_COLS_HALF = 5;
    for (let y = 0; y < 9; y++) {
      const bits: boolean[] = [];
      for (let x = 0; x < GLYPH_COLS_HALF; x++) bits.push(rand() < 0.58);
      for (let x = 0; x < 9; x++) {
        const on = x < GLYPH_COLS_HALF ? bits[x] : bits[8 - x];
        if (on) out.push({ x, y, blue: rand() < 0.075 });
      }
    }
    return out;
  }, [seed]);

  return (
    <svg
      viewBox="0 0 9 9"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
    >
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x}
          y={c.y}
          width={1}
          height={1}
          fill={c.blue ? "#35AEE4" : "currentColor"}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Pixel stat bar                                                      */
/* ------------------------------------------------------------------ */

function StatBar({
  label,
  value,
  max = 5,
  highlight,
  dark,
}: {
  label: string;
  value: number;
  max?: number;
  highlight: boolean;
  dark: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`w-14 shrink-0 font-pixel text-[10px] tracking-[0.22em] ${
          dark ? "text-paper/45" : "text-ink/50"
        }`}
      >
        {label}
      </span>
      <span className="flex gap-[3px]">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 ${
              i < value
                ? highlight
                  ? "bg-spectre"
                  : dark
                    ? "bg-paper"
                    : "bg-ink"
                : dark
                  ? "bg-paper/10"
                  : "bg-ink/10"
            }`}
          />
        ))}
      </span>
      <span
        className={`ml-auto font-pixel text-[10px] ${
          dark ? "text-paper/35" : "text-ink/40"
        }`}
      >
        {value}/{max}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GameCard — trading-card frame: cost badge, specimen art, stat bars, */
/* flavor text, set mark. Hover: lift, tilt, holo shine.               */
/* ------------------------------------------------------------------ */

export interface GameCardData {
  index: string;
  title: string;
  typeLine: string;
  description: string;
  stats: { label: string; value: number }[];
  flavor: string;
  seed: number;
  initials?: string;
}

export function GameCard({
  data,
  theme = "light",
  className = "",
}: {
  data: GameCardData;
  theme?: "light" | "dark";
  className?: string;
}) {
  const dark = theme === "dark";
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();

  const pwr = data.stats.reduce((a, s) => a + s.value, 0);
  const maxStat = Math.max(...data.stats.map((s) => s.value));

  useEffect(() => {
    const card = cardRef.current;
    const wrap = wrapRef.current;
    if (!card || !wrap || reduced || coarse) return;

    gsap.set(card, { transformPerspective: 1200 });
    const rotateX = gsap.quickTo(card, "rotationX", {
      duration: 0.65,
      ease: "power3.out",
    });
    const rotateY = gsap.quickTo(card, "rotationY", {
      duration: 0.65,
      ease: "power3.out",
    });

    const move = (event: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rotateX(-py * 7);
      rotateY(px * 9);
      card.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
      card.style.setProperty("--my", `${(py + 0.5) * 100}%`);
    };
    const leave = () => {
      rotateX(0);
      rotateY(0);
    };

    wrap.addEventListener("mousemove", move);
    wrap.addEventListener("mouseleave", leave);
    return () => {
      wrap.removeEventListener("mousemove", move);
      wrap.removeEventListener("mouseleave", leave);
    };
  }, [reduced, coarse]);

  return (
    <div
      ref={wrapRef}
      className={`group transition-transform duration-500 ease-out hover:-translate-y-2 ${className}`}
    >
      <div
        ref={cardRef}
        className={`relative flex h-full flex-col border p-5 will-change-transform ${
          dark
            ? "border-paper/15 bg-[#10171c]"
            : "border-ink/15 bg-white shadow-[0_2px_0_0_rgba(36,36,36,0.9)]"
        } transition-shadow duration-500 group-hover:shadow-[0_32px_80px_-28px_rgba(53,174,228,0.5)]`}
        style={{ "--mx": "50%", "--my": "50%" } as CSSProperties}
      >
        {/* corner pixels — the rebel corner is always Spectre Blue */}
        <span aria-hidden className={`absolute -top-1 -left-1 h-2 w-2 ${dark ? "bg-paper" : "bg-ink"}`} />
        <span aria-hidden className="absolute -top-1 -right-1 h-2 w-2 bg-spectre" />
        <span aria-hidden className={`absolute -bottom-1 -left-1 h-2 w-2 ${dark ? "bg-paper" : "bg-ink"}`} />
        <span aria-hidden className={`absolute -right-1 -bottom-1 h-2 w-2 ${dark ? "bg-paper" : "bg-ink"}`} />

        {/* header strip + cost badge */}
        <div className="flex items-center justify-between">
          <span className={`font-pixel text-[11px] tracking-[0.3em] ${dark ? "text-paper/50" : "text-ink/50"}`}>
            N°{data.index}
          </span>
          <div className="relative mr-2 grid h-9 w-9 rotate-45 place-items-center border border-spectre/70">
            <span className="-rotate-45 font-pixel text-[11px] text-spectre">
              {pwr}
            </span>
          </div>
        </div>

        {/* specimen art area */}
        <div
          className={`relative mt-4 grid aspect-[10/8] place-items-center overflow-hidden border ${
            dark ? "border-paper/10 bg-white/[0.035]" : "border-ink/10 bg-ghost"
          }`}
        >
          <PixelGlyph
            seed={data.seed}
            className={`w-2/5 transition-transform duration-700 ease-out group-hover:scale-110 ${
              dark ? "text-paper/85" : "text-ink/80"
            }`}
          />
          {data.initials ? (
            <span
              className={`absolute font-pixel text-5xl tracking-[0.08em] md:text-6xl ${
                dark ? "text-paper" : "text-ink"
              }`}
            >
              {data.initials}
            </span>
          ) : null}
          <span
            className={`absolute bottom-2.5 left-3 font-pixel text-[9px] tracking-[0.28em] uppercase ${
              dark ? "text-paper/35" : "text-ink/40"
            }`}
          >
            Specimen / {data.index}
          </span>
          <span className="absolute top-2.5 right-3 h-1.5 w-1.5 bg-spectre" aria-hidden />
        </div>

        {/* title + type line */}
        <div className="mt-5 flex items-baseline justify-between gap-3">
          <h3 className={`font-display text-xl font-bold tracking-[-0.02em] ${dark ? "text-paper" : "text-ink"}`}>
            {data.title}
          </h3>
        </div>
        <p className={`mt-1.5 font-pixel text-[9px] tracking-[0.3em] uppercase ${dark ? "text-paper/40" : "text-ink/45"}`}>
          {data.typeLine}
        </p>

        {/* rules text */}
        <p className={`mt-3.5 flex-1 text-[13.5px] leading-relaxed ${dark ? "text-paper/60" : "text-ink/65"}`}>
          {data.description}
        </p>

        {/* stat bars */}
        <div className={`mt-5 space-y-2.5 border-t pt-4 ${dark ? "border-paper/12" : "border-ink/10"}`}>
          {data.stats.map((s) => (
            <StatBar
              key={s.label}
              label={s.label}
              value={s.value}
              highlight={s.value === maxStat}
              dark={dark}
            />
          ))}
        </div>

        {/* flavor + set mark */}
        <div className={`mt-5 border-t pt-3.5 ${dark ? "border-paper/12" : "border-ink/10"}`}>
          <p className={`text-[12.5px] italic ${dark ? "text-paper/45" : "text-ink/50"}`}>
            “{data.flavor}”
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className={`font-pixel text-[9px] tracking-[0.26em] ${dark ? "text-paper/35" : "text-ink/40"}`}>
              SRX-2026 · BASE SET
            </span>
            <DragonMark className="h-4 w-auto text-spectre" />
          </div>
        </div>

        {/* holo shine */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(420px circle at var(--mx) var(--my), rgba(53,174,228,${
              dark ? "0.18" : "0.14"
            }), transparent 62%)`,
          }}
        />
      </div>
    </div>
  );
}
