"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteEntry } from "@/app/(admin)/admin/entries/actions";
import type { EntryKind } from "@/app/(admin)/admin/entries/actions";

/**
 * Delete is destructive and sits inside a dense list, so it is two-step
 * rather than one click next to "Edit". The confirm state is local -- a
 * native confirm() is blocked in some embedded browsers and cannot be
 * styled to match the panel.
 */
export function DeleteEntryButton({
  kind,
  id,
  title,
}: {
  kind: EntryKind;
  id: string;
  title: string;
}) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        aria-label={`Delete ${title}`}
        className="grid h-[30px] w-[30px] shrink-0 place-items-center border border-paper/20 text-paper/45 transition-colors duration-300 hover:border-red-500/70 hover:text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={() => setArmed(false)}
        disabled={busy}
        className="shrink-0 border border-paper/20 px-2.5 py-1.5 font-pixel text-[9px] tracking-[0.2em] whitespace-nowrap text-paper/55 uppercase transition-colors duration-300 hover:text-paper disabled:opacity-40"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await deleteEntry(kind, id);
          } finally {
            /* deleteEntry redirects on success, so this only runs if it
               threw -- otherwise the button would stay spinning forever. */
            setBusy(false);
            setArmed(false);
          }
        }}
        className="inline-flex shrink-0 items-center gap-1.5 border border-red-500/70 bg-red-500/15 px-2.5 py-1.5 font-pixel text-[9px] tracking-[0.2em] whitespace-nowrap text-red-300 uppercase transition-colors duration-300 hover:bg-red-500 hover:text-night disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
        Confirm
      </button>
    </span>
  );
}
