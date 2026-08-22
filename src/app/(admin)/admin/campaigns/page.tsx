import { ArrowUpRight, Megaphone, Send } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { listBroadcasts, RESTRICTED, resendConfigured } from "@/lib/resend";

export const dynamic = "force-dynamic";

const RESEND_BROADCASTS = "https://resend.com/broadcasts";

/**
 * Campaigns are read-only here.
 *
 * Composing lives in Resend, which already provides an editor, test sends,
 * scheduling, unsubscribe injection and open/click stats. Rebuilding that
 * inside this panel would be the most expensive screen in the project and
 * strictly worse than what it replaced. What was actually missing was
 * visibility -- knowing what went out and when, without leaving the admin.
 */

const STATUS_STYLE: Record<string, string> = {
  sent: "border-spectre bg-spectre text-night",
  scheduled: "border-paper/40 text-paper/75",
  draft: "border-paper/25 text-paper/55",
  queued: "border-paper/40 text-paper/75",
};

function when(value: string | null): string {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminCampaignsPage() {
  const configured = resendConfigured();
  const { broadcasts, error } = configured
    ? await listBroadcasts()
    : { broadcasts: [], error: null };

  const sent = broadcasts.filter((b) => b.status === "sent").length;

  return (
    <main className="mx-auto max-w-[1240px] px-5 py-10 md:px-10 md:py-14">
      <AdminHeader current="campaigns" />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.8rem] font-extrabold tracking-[-0.03em]">
            Campaigns
          </h1>
          <p className="mt-1.5 font-pixel text-[9.5px] tracking-[0.28em] text-paper/40 uppercase">
            {broadcasts.length} total · {sent} sent
          </p>
        </div>
        <a
          href={RESEND_BROADCASTS}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 border border-spectre bg-spectre px-4 py-2.5 font-pixel text-[10px] tracking-[0.24em] text-night uppercase transition-colors duration-300 hover:bg-transparent hover:text-spectre"
        >
          <Send className="h-3.5 w-3.5" />
          Write a campaign
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {!configured ? (
        <p className="mt-8 border border-paper/12 bg-white/[0.02] px-6 py-14 text-center text-[15px] text-paper/45">
          <code className="text-paper/70">RESEND_API_KEY</code> is not set, so
          campaigns cannot be listed. Sending is disabled too.
        </p>
      ) : error === RESTRICTED ? (
        <div className="mt-8 border border-paper/12 bg-white/[0.02] px-6 py-10">
          <p className="font-pixel text-[10px] tracking-[0.28em] text-paper/45 uppercase">
            Sending-only key
          </p>
          <p className="mt-4 max-w-[70ch] text-[15px] leading-relaxed text-paper/65">
            Your API key can send email but not read account data, so
            campaigns cannot be listed. Resend has no read-only permission --
            listing requires full access. Either raise this key to full
            access, or create a second full-access key and set it as{" "}
            <code className="text-paper/85">RESEND_ADMIN_API_KEY</code>,
            leaving the sending key on the public paths.
          </p>
          <p className="mt-3 max-w-[70ch] text-[13.5px] leading-relaxed text-paper/40">
            Nothing is broken either way -- the contact form and signups use
            the sending key and are unaffected. This tab is the only thing
            that needs the wider permission.
          </p>
        </div>
      ) : error ? (
        <p className="mt-8 border border-spectre/40 bg-spectre/10 px-5 py-4 text-[14px] text-paper/80">
          Could not reach Resend: {error}
        </p>
      ) : broadcasts.length === 0 ? (
        <div className="mt-8 border border-paper/12 bg-white/[0.02] px-6 py-16 text-center">
          <Megaphone className="mx-auto h-6 w-6 text-paper/25" />
          <p className="mt-4 text-[15px] text-paper/45">
            Nothing sent yet. Write the first one in Resend and it will appear
            here.
          </p>
        </div>
      ) : (
        <ul className="mt-8 border-t border-paper/12">
          {broadcasts.map((broadcast) => (
            <li
              key={broadcast.id}
              className="grid gap-3 border-b border-paper/12 py-5 md:grid-cols-12 md:items-center md:gap-4"
            >
              <div className="min-w-0 md:col-span-6">
                <p className="truncate font-display text-[1.15rem] font-bold tracking-[-0.015em]">
                  {broadcast.subject || broadcast.name || "Untitled campaign"}
                </p>
                {broadcast.name && broadcast.subject ? (
                  <p className="mt-1 truncate text-[13.5px] text-paper/45">
                    {broadcast.name}
                  </p>
                ) : null}
              </div>
              <div className="md:col-span-3">
                <p className="font-pixel text-[9.5px] tracking-[0.24em] text-paper/40 uppercase">
                  {broadcast.status === "sent" ? "Sent" : "Updated"}
                </p>
                <p className="mt-1 text-[13.5px] text-paper/55">
                  {when(
                    broadcast.sent_at ??
                      broadcast.scheduled_at ??
                      broadcast.created_at,
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2.5 md:col-span-3 md:justify-end">
                <span
                  className={`inline-flex shrink-0 items-center border px-2.5 py-1 font-pixel text-[9px] tracking-[0.24em] uppercase ${
                    STATUS_STYLE[broadcast.status] ??
                    "border-paper/25 text-paper/55"
                  }`}
                >
                  {broadcast.status}
                </span>
                <a
                  href={`${RESEND_BROADCASTS}/${broadcast.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 border border-paper/20 px-3 py-1.5 font-pixel text-[9px] tracking-[0.24em] text-paper/60 uppercase transition-colors duration-300 hover:border-spectre hover:text-spectre"
                >
                  Open
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 text-[13.5px] leading-relaxed text-paper/35">
        Campaigns are written in Resend rather than here. Its editor already
        handles previews, test sends, scheduling and one-click unsubscribe --
        this tab exists so you can see what went out without leaving the
        panel.
      </p>
    </main>
  );
}
