import { LoginForm } from "@/components/admin/LoginForm";
import { ADMIN_EMAILS, supabaseConfigured } from "@/lib/supabase/config";
import { LogoMark } from "@/components/svg/LogoMark";
import { DragonMark } from "@/components/svg/DragonMark";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const denied = params.denied === "1";
  const error = typeof params.error === "string" ? params.error : null;
  const next = typeof params.next === "string" ? params.next : "/admin";

  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden px-5 py-16">
      <div
        aria-hidden
        className="bg-grid-night pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]"
      />
      <DragonMark
        aria-hidden
        className="animate-float pointer-events-none absolute -right-[10%] bottom-[4%] w-[46vw] max-w-[520px] text-paper opacity-[0.04]"
      />

      <div className="relative w-full max-w-[440px]">
        <LogoMark className="h-[30px] w-auto" />

        <h1 className="mt-10 font-display text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.035em]">
          Studio access.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-paper/55">
          Sign in with a magic link. No passwords to lose, and only
          allowlisted studio addresses get through.
        </p>

        {denied ? (
          <p
            role="alert"
            className="mt-8 border border-spectre/40 bg-spectre/10 px-4 py-3.5 text-[14px] leading-relaxed text-paper/80"
          >
            That address is not on the admin allowlist. Ask an existing admin
            to add it to <code className="font-pixel text-spectre">ADMIN_EMAILS</code>.
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-8 border border-spectre/40 bg-spectre/10 px-4 py-3.5 text-[14px] leading-relaxed text-paper/80"
          >
            {error === "expired"
              ? "That link has expired or was already used. Request a new one."
              : "Something went wrong with that link. Try again."}
          </p>
        ) : null}

        <div className="mt-9">
          {supabaseConfigured() ? (
            <LoginForm next={next} />
          ) : (
            <div className="border border-paper/20 bg-white/[0.03] p-6">
              <p className="font-pixel text-[10px] tracking-[0.3em] text-spectre uppercase">
                Not configured
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-paper/60">
                Set <code className="text-paper">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
                <code className="text-paper">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
                and <code className="text-paper">ADMIN_EMAILS</code> in your
                environment, then reload. See README for the full setup.
              </p>
            </div>
          )}
        </div>

        {ADMIN_EMAILS.length > 0 ? (
          <p className="mt-8 font-pixel text-[9px] tracking-[0.3em] text-paper/25 uppercase">
            {ADMIN_EMAILS.length} address
            {ADMIN_EMAILS.length === 1 ? "" : "es"} allowlisted
          </p>
        ) : null}
      </div>
    </main>
  );
}
