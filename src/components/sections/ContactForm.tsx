"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader2, TriangleAlert } from "lucide-react";
import { CONTACTS } from "@/data/content";

type Status = "idle" | "sending" | "sent" | "error";

const CHANNELS = [
  { value: "general", label: "General" },
  { value: "press", label: "Press" },
  { value: "business", label: "Business" },
] as const;

const FIELD =
  "w-full border border-paper/20 bg-white/[0.03] px-4 py-3.5 font-body text-[15px] text-paper placeholder:text-paper/30 transition-colors duration-300 outline-none focus:border-spectre focus:bg-white/[0.06]";
const LABEL =
  "mb-2.5 block font-pixel text-[10px] tracking-[0.3em] text-paper/45 uppercase";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<string>("general");

  const fallback = CONTACTS[0]?.email ?? "hello@spectrerex.com";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
          channel: data.get("channel"),
          company: data.get("company"),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !body.ok) {
        setError(body.error ?? "Something went wrong on our end.");
        setStatus("error");
        return;
      }
      form.reset();
      setChannel("general");
      setStatus("sent");
    } catch {
      setError("We could not reach the studio. Check your connection.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex min-h-[420px] flex-col items-start justify-center border border-spectre/40 bg-white/[0.03] p-8 md:p-12">
        <span className="grid h-12 w-12 place-items-center border border-spectre text-spectre">
          <Check className="h-5 w-5" />
        </span>
        <h3 className="mt-7 font-display text-[1.9rem] leading-tight font-extrabold tracking-[-0.03em] md:text-[2.4rem]">
          Transmission received.
        </h3>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-paper/55">
          The dragon reads every line. Expect a reply within two working days —
          sooner if it is interesting.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 font-pixel text-[10px] tracking-[0.3em] text-spectre uppercase transition-colors hover:text-paper"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      {/* honeypot — hidden from people, irresistible to bots */}
      <div aria-hidden className="hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <span className={LABEL}>Channel</span>
        <div className="grid grid-cols-3 gap-px border border-paper/20 bg-paper/20">
          {CHANNELS.map((option) => {
            const active = channel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setChannel(option.value)}
                aria-pressed={active}
                className={`px-3 py-3 font-pixel text-[10px] tracking-[0.24em] uppercase transition-colors duration-300 ${
                  active
                    ? "bg-spectre text-night"
                    : "bg-night text-paper/55 hover:text-paper"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="channel" value={channel} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Who is this?"
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="email">
            Email <span className="text-spectre">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@studio.com"
            className={FIELD}
          />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="subject">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          placeholder="What is this about?"
          className={FIELD}
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="message">
          Message <span className="text-spectre">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Pitch, proposal, or proposition of chaos."
          className={`${FIELD} resize-y`}
        />
      </div>

      {status === "error" && error ? (
        <p
          role="alert"
          className="flex items-start gap-3 border border-spectre/40 bg-spectre/10 px-4 py-3.5 text-[14px] leading-relaxed text-paper/80"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-spectre" />
          <span>
            {error} You can always reach us at{" "}
            <a href={`mailto:${fallback}`} className="text-spectre underline">
              {fallback}
            </a>
            .
          </span>
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group relative inline-flex items-center gap-3 bg-paper px-7 py-4 font-body text-[15px] font-semibold tracking-[-0.01em] text-night transition-colors duration-300 hover:bg-spectre disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span
            aria-hidden
            className="absolute -top-1 -right-1 h-2 w-2 bg-spectre transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
          {status === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              Send transmission
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
        <p className="font-pixel text-[10px] tracking-[0.3em] text-paper/35 uppercase">
          Replies within 2 working days
        </p>
      </div>
    </form>
  );
}
