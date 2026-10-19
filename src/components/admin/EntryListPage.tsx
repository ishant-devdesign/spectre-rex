import Link from "next/link";
import { FileText, Layers, Plus, Star } from "lucide-react";
import { createEntry, listEntries, toggleFeatured, type EntryKind } from "@/app/(admin)/admin/entries/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DeleteEntryButton } from "@/components/admin/DeleteEntryButton";

export async function EntryListPage({ kind }: { kind: EntryKind }) {
  const { entries, error } = await listEntries();
  const rows = entries.filter((entry) => entry.kind === kind);

  const label = kind === "project" ? "Projects" : "Signals";
  const singular = kind === "project" ? "project" : "signal";
  const Icon = kind === "project" ? Layers : FileText;

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-10 md:px-10 md:py-14">
      <AdminHeader current={kind === "project" ? "projects" : "signals"} />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.8rem] font-extrabold tracking-[-0.03em]">{label}</h1>
          <p className="mt-1.5 font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase">
            {rows.length} total · {rows.filter((r) => r.status === "published").length} published ·{" "}
            {rows.filter((r) => (r as any).featured).length} featured
          </p>
        </div>
        <form action={createEntry.bind(null, kind)}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 border border-paper/25 px-4 py-2.5 font-pixel text-[10px] tracking-[0.24em] text-paper/75 uppercase transition-colors duration-300 hover:border-spectre hover:bg-spectre hover:text-night"
          >
            <Plus className="h-3.5 w-3.5" />
            New {singular}
          </button>
        </form>
      </div>

      {error ? (
        <p className="mt-8 border border-spectre/40 bg-spectre/10 px-5 py-4 text-[14px] text-paper/80">
          {error}. Apply <code>supabase/schema.sql</code> and check <code>DATABASE_URL</code>.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-8 border border-paper/12 bg-white/[0.02] px-6 py-14 text-center text-[15px] text-paper/45">
          No {singular}s yet. Create one to get started.
        </p>
      ) : (
        <ul className="mt-8 border-t border-paper/12">
          {rows.map((entry) => (
            <li
              key={entry.id}
              className={`group grid gap-3 border-b border-paper/12 py-5 md:grid-cols-12 md:items-center md:gap-4 ${
                (entry as any).featured ? "bg-amber-500/[0.04]" : ""
              }`}
            >
              <Link href={`/admin/entries/${entry.kind}/${entry.id}`} className="contents">
                <div className="flex items-center gap-3 md:col-span-2">
                  <span className="grid h-8 w-8 place-items-center border border-paper/20 text-paper/50">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-pixel text-[10px] tracking-[0.24em] text-paper/45 uppercase">
                    {entry.kind} {entry.code}
                  </span>
                </div>
                <div className="min-w-0 md:col-span-5">
                  <p
                    className={`flex items-center gap-2 font-display text-[1.15rem] font-bold tracking-[-0.015em] transition-colors group-hover:text-spectre ${
                      entry.title ? "" : "text-paper/45 italic"
                    }`}
                  >
                    {(entry as any).featured ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : null}
                    {entry.title || `${entry.slug} (unnamed)`}
                  </p>
                  <p className="mt-1 text-[13.5px] text-paper/45">
                    /{entry.slug} · {entry.blocks.length} block{entry.blocks.length === 1 ? "" : "s"}
                    {(entry as any).featured ? " · featured" : ""}
                  </p>
                </div>
              </Link>
              <div className="flex flex-wrap items-center gap-2 md:col-span-5 md:flex-nowrap md:justify-end">
                <form
                  action={async () => {
                    "use server";
                    await toggleFeatured(entry.kind, entry.id);
                  }}
                >
                  <button
                    type="submit"
                    title={(entry as any).featured ? "Unfeature" : "Feature (only 1 per kind)"}
                    className={`grid h-8 w-8 place-items-center border transition-colors ${
                      (entry as any).featured
                        ? "border-amber-400 bg-amber-400 text-night"
                        : "border-paper/20 text-paper/30 hover:border-amber-400/50 hover:text-amber-300"
                    }`}
                  >
                    <Star className={`h-4 w-4 ${(entry as any).featured ? "fill-night" : ""}`} />
                  </button>
                </form>
                <span
                  className={`inline-flex shrink-0 items-center border px-2.5 py-1 font-pixel text-[9px] tracking-[0.24em] uppercase ${
                    entry.status === "published"
                      ? "border-spectre bg-spectre text-night"
                      : "border-paper/30 text-paper/60"
                  }`}
                >
                  {entry.status}
                </span>
                <Link
                  href={`/admin/entries/${entry.kind}/${entry.id}`}
                  className="shrink-0 border border-paper/20 px-3 py-1.5 font-pixel text-[9px] tracking-[0.24em] text-paper/60 uppercase transition-colors duration-300 hover:border-spectre hover:text-spectre"
                >
                  Edit
                </Link>
                <DeleteEntryButton kind={entry.kind} id={entry.id} title={entry.title || entry.slug} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
