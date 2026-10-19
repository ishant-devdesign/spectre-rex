"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Monitor, Tablet, Smartphone, GripVertical } from "lucide-react";

type Resolution = "desktop" | "tablet" | "mobile";

const PRESETS: Record<
  Resolution,
  { label: string; width: number; min: number; max: number; icon: ReactNode; hint: string }
> = {
  mobile: {
    label: "Mobile",
    width: 375,
    min: 320,
    max: 480,
    icon: <Smartphone className="h-3.5 w-3.5" />,
    hint: "320–480",
  },
  tablet: {
    label: "Tablet",
    width: 768,
    min: 600,
    max: 900,
    icon: <Tablet className="h-3.5 w-3.5" />,
    hint: "600–900",
  },
  desktop: {
    label: "Desktop",
    width: 1280,
    min: 1024,
    max: 1440,
    icon: <Monitor className="h-3.5 w-3.5" />,
    hint: "1024–1440",
  },
};

// Global range for free drag
const GLOBAL_MIN = 320;
const GLOBAL_MAX = 1440;

export function PreviewFrame({ children }: { children: ReactNode }) {
  const [res, setRes] = useState<Resolution>("desktop");
  const [width, setWidth] = useState(PRESETS.desktop.width);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const current = PRESETS[res];

  // Update width when preset changes
  const applyPreset = (key: Resolution) => {
    setRes(key);
    setWidth(PRESETS[key].width);
  };

  // Determine resolution from width for label
  useEffect(() => {
    if (width < 600) {
      if (res !== "mobile") setRes("mobile");
    } else if (width < 1024) {
      if (res !== "tablet") setRes("tablet");
    } else {
      if (res !== "desktop") setRes("desktop");
    }
  }, [width]);

  // Drag handlers
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const delta = e.clientX - startXRef.current;
      let next = startWidthRef.current + delta;
      next = Math.max(GLOBAL_MIN, Math.min(GLOBAL_MAX, next));
      setWidth(Math.round(next));
    };
    const onMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    if (isDragging) {
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  const onDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  };

  return (
    <div className="flex min-h-[calc(100svh-56px)] flex-col bg-[#0e0e0e]">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper/10 bg-night px-3 py-2.5 md:px-6">
        <div className="flex items-center gap-2">
          <span className="mr-2 hidden font-pixel text-[9px] tracking-[0.3em] text-paper/30 uppercase md:block">
            Preview
          </span>
          <div className="flex gap-px border border-paper/15 bg-paper/15 p-px">
            {(Object.keys(PRESETS) as Resolution[]).map((key) => {
              const r = PRESETS[key];
              const active = res === key;
              return (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 font-pixel text-[10px] tracking-[0.2em] uppercase transition-colors ${
                    active
                      ? "bg-paper text-night"
                      : "bg-night text-paper/50 hover:bg-white/[0.06] hover:text-paper"
                  }`}
                  title={`${r.label} ${r.hint} — default ${r.width}px`}
                >
                  {r.icon}
                  {r.label}
                  <span className="ml-1 hidden text-[9px] opacity-60 md:inline">{r.width}</span>
                </button>
              );
            })}
          </div>
          <div className="ml-3 hidden items-center gap-2 md:flex">
            <span className="font-pixel text-[9px] tracking-[0.2em] text-paper/20 uppercase">Drag →</span>
            <span className="font-pixel text-[9px] tracking-[0.2em] text-paper/40 uppercase">
              {width}px
            </span>
            <span className="text-[10px] text-paper/20">({GLOBAL_MIN}–{GLOBAL_MAX})</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-pixel text-[9px] tracking-[0.24em] text-paper/30 uppercase">
            {width < 600 ? "Mobile" : width < 1024 ? "Tablet" : "Desktop"} · {width}px
          </span>
          <div className="hidden h-3 w-px bg-paper/15 md:block" />
          <span className="hidden font-pixel text-[9px] tracking-[0.24em] text-paper/20 uppercase md:block">
            Drag edge to resize — font scales with container
          </span>
        </div>
      </div>

      {/* stage */}
      <div ref={containerRef} className="flex flex-1 justify-center overflow-auto bg-[#121212] p-3 md:p-6">
        <div
          className="relative flex shrink-0 flex-col bg-paper shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_60px_rgba(0,0,0,0.6)] transition-[width] duration-150"
          style={{
            width: `${width}px`,
            maxWidth: "100%",
            minHeight: "60vh",
            containerType: "inline-size" as any,
          }}
        >
          {/* device top bar */}
          <div className="flex items-center gap-1.5 border-b border-ink/10 bg-[#f5f3ef] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            <span className="ml-4 truncate font-pixel text-[9px] tracking-[0.2em] text-ink/40">
              https://spectrerex.com/preview — {width}px · {res}
            </span>
          </div>

          {/* fix font sizing for preview — override vw with cqw */}
          <style>{`
            [data-preview-root] h1 {
              font-size: clamp(1.9rem, 8cqw, 5.4rem) !important;
            }
            [data-preview-root] h2 {
              font-size: clamp(1.5rem, 5cqw, 2.6rem) !important;
            }
            [data-preview-root] .font-display {
              /* ensure display scales with container, not viewport */
            }
            @container (max-width: 480px) {
              [data-preview-root] h1 {
                font-size: clamp(1.8rem, 10cqw, 2.8rem) !important;
                line-height: 0.98 !important;
              }
              [data-preview-root] p {
                font-size: 15px !important;
              }
            }
            @container (max-width: 900px) and (min-width: 481px) {
              [data-preview-root] h1 {
                font-size: clamp(2.2rem, 6cqw, 3.8rem) !important;
              }
            }
          `}</style>

          <div data-preview-root className="bg-paper">
            {children}
          </div>

          {/* drag handle */}
          <div
            onMouseDown={onDragStart}
            className={`absolute top-0 right-0 z-10 flex h-full w-3 -translate-x-0 cursor-ew-resize items-center justify-center border-l border-ink/10 bg-ink/[0.02] transition-colors hover:bg-spectre/20 ${
              isDragging ? "bg-spectre/30" : ""
            }`}
            title={`Drag to resize (${GLOBAL_MIN}-${GLOBAL_MAX}px)`}
          >
            <GripVertical className="h-4 w-4 text-ink/20" />
          </div>

          {/* left handle too */}
          <div
            onMouseDown={(e) => {
              // For left handle, invert delta
              setIsDragging(true);
              startXRef.current = e.clientX;
              startWidthRef.current = width;
              // Override mousemove for left
              const onMove = (ev: MouseEvent) => {
                const delta = startXRef.current - ev.clientX;
                let next = startWidthRef.current + delta;
                next = Math.max(GLOBAL_MIN, Math.min(GLOBAL_MAX, next));
                setWidth(Math.round(next));
              };
              const onUp = () => {
                setIsDragging(false);
                document.body.style.cursor = "";
                document.body.style.userSelect = "";
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
            className="absolute top-0 left-0 z-10 flex h-full w-3 cursor-ew-resize items-center justify-center border-r border-ink/10 bg-ink/[0.02] hover:bg-spectre/20"
            title="Drag left edge"
          >
            <GripVertical className="h-4 w-4 text-ink/20" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 border-t border-paper/10 bg-night px-4 py-2">
        <span className="h-1.5 w-1.5 bg-spectre animate-pulse" />
        <span className="font-pixel text-[9px] tracking-[0.3em] text-paper/30 uppercase">
          {width}px · {res} · {PRESETS[res].hint} range · drag edges — min {GLOBAL_MIN} max {GLOBAL_MAX}
        </span>
      </div>
    </div>
  );
}
