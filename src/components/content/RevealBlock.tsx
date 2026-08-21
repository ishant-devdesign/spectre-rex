"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

/** Redacted until clicked — the studio's "classified" flourish, but readable. */
export function RevealBlock({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <p className="border-l-2 border-spectre bg-ghost/50 py-4 pl-6 text-[16.5px] leading-relaxed text-ink/80">
        {text}
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-expanded={false}
      className="group flex w-full items-center gap-3 border border-ink/15 bg-ink/[0.03] px-5 py-4 text-left transition-colors duration-300 hover:border-spectre hover:bg-spectre/5"
    >
      <Eye className="h-4 w-4 shrink-0 text-spectre" />
      <span className="font-pixel text-[10px] tracking-[0.3em] text-ink/55 uppercase group-hover:text-ink">
        {label || "Click to reveal"}
      </span>
      <span aria-hidden className="ml-auto flex gap-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} className="h-3 w-3 bg-ink/25" />
        ))}
      </span>
    </button>
  );
}
