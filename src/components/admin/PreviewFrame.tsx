"use client";

import { useState, type ReactNode } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";

type Resolution = "desktop" | "tablet" | "mobile";

const RESOLUTIONS: Record<
  Resolution,
  { label: string; width: number; icon: ReactNode; hint: string }
> = {
  desktop: { label: "Desktop", width: 1280, icon: <Monitor className="h-3.5 w-3.5" />, hint: "1280px" },
  tablet: { label: "Tablet", width: 768, icon: <Tablet className="h-3.5 w-3.5" />, hint: "768px" },
  mobile: { label: "Mobile", width: 375, icon: <Smartphone className="h-3.5 w-3.5" />, hint: "375px" },
};

export function PreviewFrame({ children }: { children: ReactNode }) {
  const [res, setRes] = useState<Resolution>("desktop");

  const current = RESOLUTIONS[res];

  return (
    <div className="flex min-h-[calc(100svh-56px)] flex-col bg-[#0e0e0e]">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper/10 bg-night px-3 py-2.5 md:px-6">
        <div className="flex items-center gap-2">
          <span className="mr-2 hidden font-pixel text-[9px] tracking-[0.3em] text-paper/30 uppercase md:block">
            Preview
          </span>
          <div className="flex gap-px border border-paper/15 bg-paper/15 p-px">
            {(Object.keys(RESOLUTIONS) as Resolution[]).map((key) => {
              const r = RESOLUTIONS[key];
              const active = res === key;
              return (
                <button
                  key={key}
                  onClick={() => setRes(key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 font-pixel text-[10px] tracking-[0.2em] uppercase transition-colors ${
                    active
                      ? "bg-paper text-night"
                      : "bg-night text-paper/50 hover:bg-white/[0.06] hover:text-paper"
                  }`}
                  title={`${r.label} ${r.hint}`}
                >
                  {r.icon}
                  {r.label}
                  <span className="ml-1 hidden text-[9px] opacity-60 md:inline">{r.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-pixel text-[9px] tracking-[0.24em] text-paper/30 uppercase">
            {current.width}px · {res}
          </span>
          <div className="hidden h-3 w-px bg-paper/15 md:block" />
          <span className="hidden font-pixel text-[9px] tracking-[0.24em] text-paper/20 uppercase md:block">
            Scroll sync disabled in preview
          </span>
        </div>
      </div>

      {/* stage */}
      <div className="flex flex-1 justify-center overflow-auto bg-[#121212] p-3 md:p-6">
        <div
          className="relative bg-paper shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width: res === "desktop" ? "100%" : `${current.width}px`,
            maxWidth: res === "desktop" ? `${current.width}px` : undefined,
            minHeight: "60vh",
          }}
        >
          {/* device top bar */}
          <div className="flex items-center gap-1.5 border-b border-ink/10 bg-[#f5f3ef] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            <span className="ml-4 truncate font-pixel text-[9px] tracking-[0.2em] text-ink/40">
              https://spectrerex.com/{res} — preview
            </span>
          </div>

          {/* content */}
          <div className="bg-paper">{children}</div>
        </div>
      </div>

      {/* bottom meta */}
      <div className="flex items-center justify-center gap-2 border-t border-paper/10 bg-night px-4 py-2">
        <span className="h-1.5 w-1.5 bg-spectre animate-pulse" />
        <span className="font-pixel text-[9px] tracking-[0.3em] text-paper/30 uppercase">
          Pixel-perfect · {current.label} · {current.width}px
        </span>
      </div>
    </div>
  );
}
