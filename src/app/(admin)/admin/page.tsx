import { desc, sql } from "drizzle-orm";
import { Inbox, MailOpen } from "lucide-react";
import { getDb } from "@/db";
import { contactMessages } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { MessageList } from "@/components/admin/MessageList";

export const dynamic = "force-dynamic";

async function loadMessages() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(100);
    const [counts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        open: sql<number>`count(*) filter (where handled = false)::int`,
      })
      .from(contactMessages);
    return { rows, counts, error: null as string | null };
  } catch (error) {
    return {
      rows: [],
      counts: { total: 0, open: 0 },
      error: error instanceof Error ? error.message : "Database unavailable",
    };
  }
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { rows, counts, error } = await loadMessages();

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-10 md:px-10 md:py-14">
      <AdminHeader current="inbox" />

      <div className="mt-10 grid gap-px border border-paper/12 bg-paper/12 sm:grid-cols-3">
        {[
          { label: "Total messages", value: counts.total, icon: Inbox },
          { label: "Awaiting reply", value: counts.open, icon: MailOpen },
          {
            label: "Handled",
            value: Math.max(0, counts.total - counts.open),
            icon: MailOpen,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-night px-6 py-7">
            <div className="flex items-center gap-2.5">
              <stat.icon className="h-3.5 w-3.5 text-spectre" />
              <span className="font-pixel text-[9.5px] tracking-[0.3em] text-paper/40 uppercase">
                {stat.label}
              </span>
            </div>
            <p className="mt-4 font-display text-[2.2rem] leading-none font-extrabold tracking-[-0.03em]">
              {String(stat.value).padStart(2, "0")}
            </p>
          </div>
        ))}
      </div>

      {error ? (
        <p className="mt-10 border border-spectre/40 bg-spectre/10 px-5 py-4 text-[14px] leading-relaxed text-paper/80">
          Could not read messages: {error}. Check <code>DATABASE_URL</code> and
          that <code>supabase/schema.sql</code> has been applied.
        </p>
      ) : (
        <MessageList messages={rows} />
      )}
    </main>
  );
}

