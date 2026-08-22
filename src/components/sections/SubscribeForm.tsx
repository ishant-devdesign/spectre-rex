"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader2, TriangleAlert } from "lucide-react";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Newsletter signup.
 *
 * Single opt-in: one field, one click, subscribed. No confirmation step,
 * which is a deliberate call -- the friction it removes is worth more than
 * the small share of typo'd addresses it lets through, and campaigns go out
 * from a sending subdomain so those cannot damage the studio's mail
 * reputation.
 */
export function SubscribeForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setError(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          company: data.get("company"),
          source: "contact",
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
      setStatus("sent");
    } catch {
      setError("Network trouble. Try again in a moment.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="flex items-center gap-3 border border-spectre/50 bg-spectre/10 px-5 py-4"
      >
        <Check className="h-4 w-4 shrink-0 text-spectre" />
        <p className="text-[15px] leading-relaxed text-paper/80">
          You are on the list. Transmissions incoming.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full">
      {/* Honeypot. Hidden from people, irresistible to bots. */}
      <div aria-hidden className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor="sub-company">Company</label>
        <input id="sub-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <label
        htmlFor="sub-email"
        className="mb-2.5 block font-pixel text-[10px] tracking-[0.3em] text-paper/45 uppercase"
      >
        Newsletter
      </label>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <input
          id="sub-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@studio.com"
          className="w-full border border-paper/20 bg-white/[0.03] px-4 py-3.5 font-body text-[15px] text-paper transition-colors duration-300 outline-none placeholder:text-paper/30 focus:border-spectre focus:bg-white/[0.06]"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex shrink-0 items-center justify-center gap-2 border border-spectre bg-spectre px-6 py-3.5 font-pixel text-[10px] tracking-[0.24em] text-night uppercase transition-colors duration-300 hover:bg-transparent hover:text-spectre disabled:opacity-60"
        >
          {status === "sending" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
          Subscribe
        </button>
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-paper/40">
        Devlogs, project reveals and the occasional dragon. No spam,
        unsubscribe in one click.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2.5 text-[14px] leading-relaxed text-spectre"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </form>
  );
}
