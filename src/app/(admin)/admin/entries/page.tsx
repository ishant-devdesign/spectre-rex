import Link from "next/link";
import { FileText, Plus, Layers } from "lucide-react";
import { listEntries, createEntry } from "./actions";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default async function EntriesPage() {
  const { entries, error } = await listEntries();

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-10 md:px-10 md:py-14">
      <AdminHeader current="entries" />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-[1.8rem] font-extrabold tracking-[-0.03em]">
          Signals &amp; projects
        </h1>
        <div className="flex gap-2.5">
          <form action={createEntry.bind(null, "signal")}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 border border-paper/25 px-4 py-2.5 font-pixel text-[10px] tracking-[0.24em] text-paper/75 uppercase transition-colors duration-300 hover:border-spectre hover:bg-spectre hover:text-night"
            >
              <Plus className="h-3.5 w-3.5" />
              New signal
            </button>
          </form>
          <form action={createEntry.bind(null, "project")}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 border border-paper/25 px-4 py-2.5 font-pixel text-[10px] tracking-[0.24em] text-paper/75 uppercase transition-colors duration-300 hover:border-spectre hover:bg-spectre hover:text-night"
            >
              <Plus className="h-3.5 w-3.5" />
              New project
            </button>
          </form>
        </div>
      </div>

      {error ? (
        <p className="mt-8 border border-spectre/40 bg-spectre/10 px-5 py-4 text-[14px] text-paper/80">
          {error}. Apply <code>supabase/schema.sql</code> and check{" "}
          <code>DATABASE_URL</code>.
        </p>
      ) : entries.length === 0 ? (
        <p className="mt-8 border border-paper/12 bg-white/[0.02] px-6 py-14 text-center text-[15px] text-paper/45">
          Nothing written yet.
        </p>
      ) : (
        <ul className="mt-8 border-t border-paper/12">
          {entries.map((entry) => (
            <li key={`${entry.kind}-${entry.id}`} className="border-b border-paper/12">
              <Link
                href={`/admin/entries/${entry.kind}/${entry.id}`}
                className="group grid gap-3 py-5 transition-colors md:grid-cols-12 md:items-center"
              >
                <div className="flex items-center gap-3 md:col-span-3">
                  <span className="grid h-8 w-8 place-items-center border border-paper/20 text-paper/50">
                    {entry.kind === "signal" ? (
                      <FileText className="h-3.5 w-3.5" />
                    ) : (
                      <Layers className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <span className="font-pixel text-[10px] tracking-[0.24em] text-paper/45 uppercase">
                    {entry.kind} {entry.code}
                  </span>
                </div>
                <div className="md:col-span-6">
                  <p className="font-display text-[1.15rem] font-bold tracking-[-0.015em] transition-colors group-hover:text-spectre">
                    {entry.title}
                  </p>
                  <p className="mt-1 text-[13.5px] text-paper/45">
                    /{entry.slug} · {entry.blocks.length} block
                    {entry.blocks.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="md:col-span-3 md:justify-self-end">
                  <span
                    className={`inline-flex items-center border px-2.5 py-1 font-pixel text-[9px] tracking-[0.24em] uppercase ${
                      entry.status === "published"
                        ? "border-spectre bg-spectre text-night"
                        : "border-paper/30 text-paper/60"
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
