"use client";

import gsap from "gsap";
import { useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

const COLS = 19;
const ROWS = 25;
const MESSAGES = ["DENIED", "STILL DENIED", "NICE TRY", "IT IS UNAMUSED"];

type Kind = "shell" | "shade" | "speck" | "crack" | "glow";

interface Cell {
  key: string;
  row: number;
  col: number;
  kind: Kind;
  /** how many pokes are needed before this crack cell opens */
  stage: number;
  delay: number;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Egg silhouette rather than a plain ellipse: the top tapers, the base
 * stays full, which is the difference between reading as "egg" and
 * reading as "a blob of squares".
 */
function halfWidth(rowNorm: number) {
  const base = Math.sqrt(Math.max(0, 1 - rowNorm * rowNorm));
  const taper = rowNorm < 0 ? 1 - 0.3 * Math.pow(-rowNorm, 1.35) : 1;
  return base * taper * (COLS / 2);
}

/** Jagged fissure down the shell, opened progressively by poking. */
function crackColumns() {
  const rand = mulberry32(9312);
  const map = new Map<number, number[]>();
  let col = Math.floor(COLS / 2) + 1;
  for (let row = 8; row <= 19; row += 1) {
    const drift = rand();
    if (drift < 0.34) col -= 1;
    else if (drift > 0.72) col += 1;
    const cols = [col];
    if (rand() > 0.66) cols.push(col + 1);
    map.set(row, cols);
  }
  return map;
}

export function PixelEgg() {
  const [pokes, setPokes] = useState(0);
  const eggRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const cells = useMemo(() => {
    const rand = mulberry32(26);
    const cracks = crackColumns();
    const out: Cell[] = [];

    for (let row = 0; row < ROWS; row += 1) {
      const y = ((row + 0.5) / ROWS) * 2 - 1;
      const half = halfWidth(y);
      for (let col = 0; col < COLS; col += 1) {
        const dx = col + 0.5 - COLS / 2;
        if (Math.abs(dx) > half) continue;

        const crackCols = cracks.get(row);
        const isCrack = crackCols?.includes(col) ?? false;
        const nextToCrack =
          crackCols?.some((c) => Math.abs(c - col) === 1) ?? false;
        /* Glow belongs to the segment it sits beside, so an unopened part
           of the fissure stays a hairline instead of a blue smear. */
        const glowStage = nextToCrack
          ? Math.min(3, Math.floor(Math.abs(row - 13) / 2))
          : 0;

        /* Light falls from the upper left, so the lower right rim reads
           as shadow — that is what gives the shape volume. */
        const shade = dx / Math.max(half, 1) + y * 0.55;
        const roll = rand();

        let kind: Kind = "shell";
        if (isCrack) kind = "crack";
        else if (nextToCrack) kind = "glow";
        else if (roll < 0.055) kind = "speck";
        else if (shade > 0.72) kind = "shade";

        out.push({
          key: `${row}-${col}`,
          row,
          col,
          kind,
          /* The fissure opens from the middle outwards as it is poked. */
          stage: isCrack
            ? Math.min(3, Math.floor(Math.abs(row - 13) / 2))
            : glowStage,
          delay: rand() * 2.2,
        });
      }
    }
    return out;
  }, []);

  const poke = () => {
    setPokes((value) => value + 1);
    const element = eggRef.current;
    if (!element || reduced) return;
    gsap.fromTo(
      element,
      { x: -3, rotation: -3.5 },
      { x: 0, rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.26)" },
    );
  };

  const message = pokes === 0 ? null : MESSAGES[(pokes - 1) % MESSAGES.length];
  const opened = Math.min(3, pokes);

  return (
    <div className="relative flex select-none flex-col items-center">
      {/* containment glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(53,174,228,0.22) 0%, rgba(53,174,228,0.06) 45%, transparent 70%)",
        }}
      />

      <div className="relative flex h-9 items-center">
        {message && (
          <span
            key={pokes}
            className="animate-mark-pop border border-spectre px-3 py-1.5 font-pixel text-[10px] tracking-[0.3em] text-spectre"
          >
            {message}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={poke}
        aria-label="A pixel egg. It does not respond to poking."
        className="group relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-spectre/60"
      >
        <div
          ref={eggRef}
          className="animate-egg grid [--egg-cell:8px] md:[--egg-cell:11px]"
          style={{
            gridTemplateColumns: `repeat(${COLS}, var(--egg-cell))`,
            gridAutoRows: "var(--egg-cell)",
          }}
        >
          {cells.map((cell) => {
            const open = cell.kind === "crack" && cell.stage <= opened;
            const litGlow = cell.kind === "glow" && cell.stage <= opened;
            const lit = litGlow || open;
            return (
              <span
                key={cell.key}
                style={{
                  gridColumn: cell.col + 1,
                  gridRow: cell.row + 1,
                  animationDelay: lit ? `${cell.delay}s` : undefined,
                }}
                className={
                  open
                    ? "bg-spectre shadow-[0_0_9px_2px_rgba(53,174,228,0.6)]"
                    : cell.kind === "crack"
                      ? /* sealed seam: a shadow hairline, not a hole */
                        "bg-[#6d7c85]"
                      : litGlow
                        ? "animate-soft-pulse bg-spectre/45"
                        : cell.kind === "speck"
                          ? "bg-[#cbd6dc]"
                          : cell.kind === "shade"
                            ? "bg-[#b9c6cd] transition-colors duration-300 group-hover:bg-ghost"
                            : "bg-paper transition-colors duration-300 group-hover:bg-white"
                }
              />
            );
          })}
        </div>
      </button>

      <div className="relative mt-6 flex h-5 items-center gap-3">
        <span className="font-pixel text-[10px] tracking-[0.34em] text-paper/35 uppercase">
          Integrity {String(Math.max(0, 100 - opened * 17)).padStart(3, "0")}%
        </span>
        {pokes > 0 && (
          <span className="font-pixel text-[10px] tracking-[0.34em] text-spectre/70 uppercase">
            Pokes {String(pokes).padStart(2, "0")}
          </span>
        )}
      </div>
    </div>
  );
}
