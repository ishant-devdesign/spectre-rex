import type { Metadata } from "next";
import { Reveal, Words } from "@/components/motion/bits";
import { PixelTag, SectionHead } from "@/components/ui/chrome";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Cookie policy for Spectre Rex Studios — how we use necessary and analytics cookies, and how to manage your preferences.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <>
      <PageHero eyebrow="Legal / Cookies" lines={["Cookie policy."]}>
        <Reveal delay={0.9} scroll={false} className="mt-10 max-w-xl">
          <p className="text-base leading-relaxed text-paper/65 md:text-lg">
            We use cookies, but not the creepy kind. Necessary cookies keep the site working. Analytics
            helps us understand what’s being read. No zero-cookie mode — necessary is always on.
          </p>
        </Reveal>
      </PageHero>

      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
          <SectionHead eyebrow="Policy / 01" lines={["How we use", "cookies."]} />

          <div className="mt-16 grid gap-12 md:grid-cols-12">
            <div className="md:col-span-3">
              <PixelTag>Categories</PixelTag>
            </div>
            <div className="md:col-span-9 space-y-10">
              <Reveal>
                <div className="border border-ink/10 p-6">
                  <h3 className="font-display text-[1.25rem] font-bold tracking-[-0.02em]">Necessary — always on</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/60">
                    Session, authentication, security, consent storage. Required for the site to function and for
                    <code className="mx-1 rounded bg-ink/5 px-1.5 py-0.5 font-pixel text-[12px]">/admin</code> to stay logged in
                    after you close a tab. These cookies have `SameSite=Lax`, `Secure` in production, and a 1-year max-age.
                    You cannot disable them — there is no zero-cookie option.
                  </p>
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-[14px] text-ink/60">
                    <li>
                      <code className="font-pixel text-[12px]">sb-* -auth-token</code> — Supabase auth session
                    </li>
                    <li>
                      <code className="font-pixel text-[12px]">srx:cookie-consent</code> — your cookie preferences
                    </li>
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="border border-ink/10 p-6">
                  <h3 className="font-display text-[1.25rem] font-bold tracking-[-0.02em]">Analytics — optional</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/60">
                    Google Analytics 4 — ID <code className="font-pixel text-[12px]">G-DELZZBKLTV</code>. We use Consent Mode v2:
                    analytics storage is <code className="font-pixel text-[12px]">denied</code> by default and only set to{" "}
                    <code className="font-pixel text-[12px]">granted</code> after you accept analytics in the banner. No ad
                    storage, no ad personalization — ever.
                  </p>
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-[14px] text-ink/60">
                    <li>
                      <code className="font-pixel text-[12px]">_ga, _ga_*</code> — GA4, 1 year, anonymized IP
                    </li>
                    <li>We do not use ad cookies, marketing cookies, or third-party trackers beyond GA4.</li>
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="border border-ink/10 p-6">
                  <h3 className="font-display text-[1.25rem] font-bold tracking-[-0.02em]">How to manage</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/60">
                    On first visit you’ll see a banner with three options: Accept all, Necessary only, Customize.
                    Customize lets you toggle analytics. You can change your choice anytime via the{" "}
                    <strong>Cookie settings</strong> button in the footer, which reopens the banner.
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/60">
                    You can also clear <code className="font-pixel text-[12px]">srx:cookie-consent</code> from localStorage and
                    cookies to reset.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.24}>
                <div className="border border-ink/10 p-6">
                  <h3 className="font-display text-[1.25rem] font-bold tracking-[-0.02em]">Contact</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/60">
                    Questions? <a href="mailto:hello@spectrerex.com" className="text-spectre underline">hello@spectrerex.com</a>
                  </p>
                  <p className="mt-2 font-pixel text-[10px] tracking-[0.24em] text-ink/40 uppercase">
                    Last updated: Oct 2026 · Apex canonical https://spectrerex.com
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
