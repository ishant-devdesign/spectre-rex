"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Loader2, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

type Status = "idle" | "sending" | "sent" | "error";

export function LoginForm({ next }: { next: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);

    try {
      const supabase = createClient();
      const redirect = new URL("/auth/callback", window.location.origin);
      redirect.searchParams.set("next", next);

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirect.toString(),
          /* Never create an account from the login screen. Admins are
             provisioned in Supabase first; this only signs them in. */
          shouldCreateUser: false,
        },
      });

      if (authError) {
        setError(
          authError.message.toLowerCase().includes("signups not allowed")
            ? "No studio account exists for that address."
            : authError.message,
        );
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Could not reach the auth service.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="border border-spectre/40 bg-white/[0.03] p-6">
        <span className="grid h-11 w-11 place-items-center border border-spectre text-spectre">
          <Check className="h-5 w-5" />
        </span>
        <h2 className="mt-6 font-display text-[1.5rem] font-bold tracking-[-0.02em]">
          Check your inbox.
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-paper/55">
          A sign-in link is on its way to{" "}
          <span className="text-paper">{email}</span>. It expires in one hour
          and works once.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 font-pixel text-[10px] tracking-[0.3em] text-spectre uppercase transition-colors hover:text-paper"
        >
          Use a different address
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2.5 block font-pixel text-[10px] tracking-[0.3em] text-paper/45 uppercase"
        >
          Studio email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@spectrerex.com"
          className="w-full border border-paper/20 bg-white/[0.03] px-4 py-3.5 font-body text-[15px] text-paper placeholder:text-paper/30 transition-colors duration-300 outline-none focus:border-spectre focus:bg-white/[0.06]"
        />
      </div>

      {status === "error" && error ? (
        <p
          role="alert"
          className="flex items-start gap-3 border border-spectre/40 bg-spectre/10 px-4 py-3.5 text-[14px] leading-relaxed text-paper/80"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-spectre" />
          <span>{error}</span>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending" || !email.trim()}
        className="group relative inline-flex items-center justify-center gap-3 bg-paper px-7 py-4 font-body text-[15px] font-semibold tracking-[-0.01em] text-night transition-colors duration-300 hover:bg-spectre disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          aria-hidden
          className="absolute -top-1 -right-1 h-2 w-2 bg-spectre transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending link
          </>
        ) : (
          <>
            Send magic link
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}
