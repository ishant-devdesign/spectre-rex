"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Read-only value with a copy button. */
export function CopyField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Clipboard access is denied in some embedded contexts. The value is
         selectable in the field, so failing quietly is better than an alert
         that interrupts a copy the user can still do by hand. */
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase">
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 border border-paper/20 px-2.5 py-1 font-pixel text-[9px] tracking-[0.2em] text-paper/60 uppercase transition-colors duration-300 hover:border-spectre hover:text-spectre"
        >
          {copied ? (
            <Check className="h-3 w-3 text-spectre" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <textarea
        readOnly
        value={value}
        rows={multiline ? 8 : 1}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full resize-y border border-paper/15 bg-white/[0.02] px-3.5 py-2.5 font-mono text-[12.5px] leading-relaxed text-paper/70 outline-none focus:border-spectre"
      />
    </div>
  );
}
