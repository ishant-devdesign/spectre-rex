"use client";

import { useState, useTransition } from "react";
import { Check, Mail, RotateCcw } from "lucide-react";
import type { ContactMessage } from "@/db/schema";
import { setHandled } from "@/app/(admin)/admin/actions";

const CHANNEL_TONE: Record<string, string> = {
  general: "border-paper/30 text-paper/70",
  press: "border-spectre text-spectre",
  business: "border-paper bg-paper text-night",
};

function when(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

export function MessageList({ messages }: { messages: ContactMessage[] }) {
  const [filter, setFilter] = useState<"open" | "all">("open");
  const visible =
    filter === "open" ? messages.filter((m) => !m.handled) : messages;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-pixel text-[10px] tracking-[0.3em] text-paper/40 uppercase">
          Inbox
        </h2>
        <div className="flex gap-px border border-paper/20 bg-paper/20">
          {(["open", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-4 py-2 font-pixel text-[10px] tracking-[0.24em] uppercase transition-colors duration-300 ${
                filter === value
                  ? "bg-spectre text-night"
                  : "bg-night text-paper/55 hover:text-paper"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 border border-paper/12 bg-white/[0.02] px-6 py-14 text-center text-[15px] text-paper/45">
          {filter === "open"
            ? "Nothing awaiting a reply. The dragon rests."
            : "No messages yet."}
        </p>
      ) : (
        <ul className="mt-8 border-t border-paper/12">
          {visible.map((message) => (
            <MessageRow key={message.id} message={message} />
          ))}
        </ul>
      )}
    </section>
  );
}

function MessageRow({ message }: { message: ContactMessage }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <li className="border-b border-paper/12">
      <div className="grid gap-4 py-6 md:grid-cols-12 md:items-start md:gap-6">
        <div className="flex flex-wrap items-center gap-3 md:col-span-3">
          <span
            className={`inline-flex items-center border px-2.5 py-1 font-pixel text-[9px] tracking-[0.24em] uppercase ${
              CHANNEL_TONE[message.channel] ?? CHANNEL_TONE.general
            }`}
          >
            {message.channel}
          </span>
          <span className="font-pixel text-[10px] tracking-[0.18em] text-paper/35">
            {when(message.createdAt)}
          </span>
        </div>

        <div className="md:col-span-7">
          <p className="font-display text-[1.15rem] font-bold tracking-[-0.015em]">
            {message.subject || "(no subject)"}
          </p>
          <p className="mt-1.5 text-[13.5px] text-paper/50">
            {message.name ? `${message.name} — ` : ""}
            <a
              href={`mailto:${message.email}`}
              className="text-spectre hover:underline"
            >
              {message.email}
            </a>
          </p>
          <p
            className={`mt-3 text-[14.5px] leading-relaxed text-paper/70 ${
              open ? "" : "line-clamp-2"
            }`}
          >
            {message.message}
          </p>
          {message.message.length > 140 ? (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="mt-2 font-pixel text-[9px] tracking-[0.28em] text-paper/40 uppercase transition-colors hover:text-spectre"
            >
              {open ? "Collapse" : "Read all"}
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2 md:col-span-2 md:justify-end">
          <a
            href={`mailto:${message.email}?subject=${encodeURIComponent(
              `Re: ${message.subject || "your message"}`,
            )}`}
            className="grid h-9 w-9 place-items-center border border-paper/20 text-paper/70 transition-colors duration-300 hover:border-spectre hover:bg-spectre hover:text-night"
            aria-label={`Reply to ${message.email}`}
          >
            <Mail className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                void setHandled(message.id, !message.handled);
              })
            }
            className={`inline-flex items-center gap-2 border px-3 py-2 font-pixel text-[9px] tracking-[0.24em] uppercase transition-colors duration-300 disabled:opacity-50 ${
              message.handled
                ? "border-paper/20 text-paper/45 hover:border-paper/50"
                : "border-spectre text-spectre hover:bg-spectre hover:text-night"
            }`}
          >
            {message.handled ? (
              <>
                <RotateCcw className="h-3 w-3" />
                Reopen
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                Done
              </>
            )}
          </button>
        </div>
      </div>
    </li>
  );
}
