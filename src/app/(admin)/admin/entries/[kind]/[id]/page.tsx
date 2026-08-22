import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteEntry, getEntry, type EntryKind } from "../../actions";
import { EntryEditor } from "@/components/admin/EntryEditor";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default async function EntryPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (kind !== "signal" && kind !== "project") notFound();

  const entry = await getEntry(kind as EntryKind, id).catch(() => null);
  if (!entry) notFound();

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-10 md:px-10 md:py-14">
      <AdminHeader current={entry.kind === "project" ? "projects" : "signals"} />

      <div className="mt-10 mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-pixel text-[10px] tracking-[0.3em] text-paper/45 uppercase">
          Editing {entry.kind} {entry.code}
        </h1>
        {entry.broadcastId ? (
          <a
            href={`https://resend.com/broadcasts/${entry.broadcastId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-spectre/60 px-3.5 py-2 font-pixel text-[9.5px] tracking-[0.24em] text-spectre uppercase transition-colors duration-300 hover:bg-spectre hover:text-night"
          >
            Campaign drafted
          </a>
        ) : null}
        <form action={deleteEntry.bind(null, entry.kind, entry.id)}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 border border-paper/20 px-3.5 py-2 font-pixel text-[9.5px] tracking-[0.24em] text-paper/50 uppercase transition-colors duration-300 hover:border-spectre hover:text-spectre"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </form>
      </div>

      <EntryEditor entry={entry} />
    </main>
  );
}
