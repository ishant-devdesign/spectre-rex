"use client";

import { useEffect, useState } from "react";

/**
 * Pixel loader with 3D look — full width + full height, no layout jump.
 * Covers entire admin viewport, centered, so content doesn't shift when real data loads.
 */
export function PixelLoader({ label = "Loading transmission..." }: { label?: string }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 4), 180);
    return () => clearInterval(id);
  }, []);

  const cells = Array.from({ length: 9 }).map((_, i) => {
    const x = i % 3;
    const y = Math.floor(i / 3);
    const dist = Math.abs(x - 1) + Math.abs(y - 1);
    const active = (frame + dist) % 4 < 2;
    return { x, y, active, delay: (x + y) * 0.08 };
  });

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center px-5 py-16 md:min-h-[75vh]">
      <div className="flex flex-col items-center">
        <div className="relative" style={{ perspective: "600px" }}>
          <div
            className="absolute left-1/2 top-[88%] h-10 w-20 -translate-x-1/2 bg-ink/20 blur-[10px]"
            style={{ transform: "rotateX(75deg)" }}
          />
          <div
            className="relative grid gap-[3px] p-2"
            style={{
              gridTemplateColumns: "repeat(3, 18px)",
              transform: "rotateX(22deg) rotateZ(-18deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {cells.map((c, i) => (
              <span
                key={i}
                className="relative block h-[18px] w-[18px] transition-all duration-300"
                style={{
                  transform: c.active ? "translateZ(10px)" : "translateZ(0px)",
                  transformStyle: "preserve-3d",
                  transitionDelay: `${c.delay}s`,
                }}
              >
                <span
                  className={`absolute inset-0 ${
                    c.active ? "bg-spectre" : "bg-paper/15"
                  } transition-colors duration-300`}
                  style={{
                    transform: "translateZ(6px)",
                    boxShadow: c.active ? "0 0 12px rgba(53,174,228,0.5)" : "none",
                  }}
                />
                <span
                  className={`absolute left-0 top-full h-[6px] w-full origin-top ${
                    c.active ? "bg-[#1d8ab8]" : "bg-paper/10"
                  } transition-colors duration-300`}
                  style={{ transform: "rotateX(-90deg)" }}
                />
                <span
                  className={`absolute left-full top-0 h-full w-[6px] origin-left ${
                    c.active ? "bg-[#166a8c]" : "bg-paper/5"
                  } transition-colors duration-300`}
                  style={{ transform: "rotateY(90deg)" }}
                />
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="font-pixel text-[10px] tracking-[0.34em] text-paper/40 uppercase animate-pulse">
            {label}
          </p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1 w-1 bg-spectre/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 border border-paper/10 bg-white/[0.02] px-4 py-2">
          <p className="font-pixel text-[9px] tracking-[0.24em] text-paper/25 uppercase">
            Grid sync · {String(frame + 1).padStart(2, "0")} / 04
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Full-page admin loader — matches EntryListPage outer shell
 * so header doesn't jump when real list loads.
 * Full width + full height of admin viewport.
 */
export function AdminPageLoader() {
  return (
    <div className="flex min-h-svh w-full flex-col bg-night text-paper">
      {/* same max-w shell as EntryListPage to prevent jump */}
      <div className="mx-auto flex w-full max-w-[1240px] flex-col px-5 py-10 md:px-10 md:py-14">
        {/* header skeleton matching real page */}
        <div className="h-10 w-full animate-pulse bg-white/[0.04]" />
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="h-8 w-40 animate-pulse bg-white/[0.06]" />
            <div className="h-3 w-64 animate-pulse bg-white/[0.03]" />
          </div>
          <div className="h-9 w-28 animate-pulse bg-white/[0.04]" />
        </div>

        {/* loader takes remaining height, full width */}
        <div className="mt-8 w-full flex-1 border-t border-paper/10">
          <PixelLoader label="Loading studio archive..." />
        </div>
      </div>
    </div>
  );
}
