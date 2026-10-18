"use client";

import { useEffect, useState } from "react";
import { PixelTag } from "@/components/ui/chrome";

type Consent = {
  necessary: true; // always true, no 0 cookies option
  analytics: boolean;
  version: number;
};

const CONSENT_KEY = "srx:cookie-consent";
const CONSENT_VERSION = 1;

const DEFAULT_CONSENT: Consent = {
  necessary: true,
  analytics: false,
  version: CONSENT_VERSION,
};

function loadConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return { ...DEFAULT_CONSENT, ...parsed, necessary: true };
  } catch {
    return null;
  }
}

function saveConsent(consent: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    // Also set a cookie so server can read if needed
    document.cookie = `${CONSENT_KEY}=${encodeURIComponent(
      JSON.stringify(consent),
    )}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    // Dispatch event for GA component
    window.dispatchEvent(new CustomEvent("srx:consent", { detail: consent }));
    // gtag consent update
    // @ts-ignore
    const gtag = window.gtag;
    if (typeof gtag === "function") {
      gtag("consent", "update", {
        analytics_storage: consent.analytics ? "granted" : "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
  } catch {}
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const existing = loadConsent();
    if (existing) {
      setConsent(existing);
      setAnalytics(existing.analytics);
      // Ensure gtag gets update on load
      // @ts-ignore
      const gtag = window.gtag;
      if (typeof gtag === "function") {
        gtag("consent", "update", {
          analytics_storage: existing.analytics ? "granted" : "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
      }
    } else {
      setShowBanner(true);
      // Default denied for analytics until user chooses
      // @ts-ignore
      const gtag = window.gtag;
      if (typeof gtag === "function") {
        gtag("consent", "default", {
          analytics_storage: "denied",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          functionality_storage: "granted",
          security_storage: "granted",
        });
      }
    }

    // Listen for footer "Manage cookies" button
    const handler = () => {
      const c = loadConsent() ?? DEFAULT_CONSENT;
      setAnalytics(c.analytics);
      setShowCustomize(true);
      setShowBanner(true);
    };
    window.addEventListener("srx:open-cookie-settings", handler as EventListener);
    return () => window.removeEventListener("srx:open-cookie-settings", handler as EventListener);
  }, []);

  if (!showBanner) return null;

  const acceptAll = () => {
    const next: Consent = { necessary: true, analytics: true, version: CONSENT_VERSION };
    saveConsent(next);
    setConsent(next);
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    const next: Consent = { necessary: true, analytics: false, version: CONSENT_VERSION };
    saveConsent(next);
    setConsent(next);
    setShowBanner(false);
  };

  const saveCustom = () => {
    const next: Consent = { necessary: true, analytics, version: CONSENT_VERSION };
    saveConsent(next);
    setConsent(next);
    setShowBanner(false);
    setShowCustomize(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[120] p-3 md:p-5">
      <div className="mx-auto max-w-[1440px]">
        <div className="border border-paper/15 bg-night text-paper shadow-2xl">
          {/* accent */}
          <div className="h-[3px] w-full bg-spectre" />
          <div className="p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <PixelTag tone="paper">Cookies / Consent</PixelTag>
              <span className="font-pixel text-[9px] tracking-[0.3em] text-paper/35 uppercase">
                No 0-cookie mode — necessary always on
              </span>
            </div>

            <h3 className="mt-5 font-display text-[1.5rem] font-extrabold leading-tight tracking-[-0.02em] md:text-[2rem]">
              We use cookies, but not the creepy kind.
            </h3>
            <p className="mt-3 max-w-[65ch] text-[14.5px] leading-relaxed text-paper/60">
              Necessary cookies keep the site and admin login working. Analytics (GA4) helps us see
              what’s being read. You can’t turn off necessary — there’s no zero-cookie option — but
              you can choose whether analytics runs.
            </p>

            {showCustomize ? (
              <div className="mt-6 grid gap-4 border-t border-paper/12 pt-6">
                <div className="flex items-center justify-between gap-4 border border-paper/12 bg-white/[0.03] px-4 py-4">
                  <div>
                    <p className="font-pixel text-[10px] tracking-[0.24em] text-paper/80 uppercase">
                      Necessary — always on
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-paper/45">
                      Session, auth, security, consent storage. Required for /admin to stay logged in.
                    </p>
                  </div>
                  <span className="shrink-0 border border-spectre bg-spectre px-3 py-1 font-pixel text-[9px] tracking-[0.24em] text-night uppercase">
                    On
                  </span>
                </div>

                <label className="flex cursor-pointer items-center justify-between gap-4 border border-paper/12 bg-white/[0.02] px-4 py-4 transition-colors hover:bg-white/[0.04]">
                  <div>
                    <p className="font-pixel text-[10px] tracking-[0.24em] text-paper/80 uppercase">
                      Analytics — GA4
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-paper/45">
                      {`ID ${process.env.NEXT_PUBLIC_GA_ID ?? "G-DELZZBKLTV"} — page views, no ads.`}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="h-5 w-5 accent-[#35AEE4]"
                  />
                </label>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={saveCustom}
                    className="bg-paper px-6 py-3 font-pixel text-[10px] tracking-[0.24em] text-night uppercase transition-colors hover:bg-spectre"
                  >
                    Save preferences
                  </button>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="border border-paper/20 px-6 py-3 font-pixel text-[10px] tracking-[0.24em] text-paper/60 uppercase hover:border-paper/40 hover:text-paper"
                  >
                    Back
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={acceptAll}
                  className="bg-paper px-6 py-3 font-pixel text-[10px] tracking-[0.24em] text-night uppercase transition-colors hover:bg-spectre"
                >
                  Accept all
                </button>
                <button
                  onClick={acceptNecessary}
                  className="border border-paper/20 bg-night px-6 py-3 font-pixel text-[10px] tracking-[0.24em] text-paper/70 uppercase transition-colors hover:border-paper/40 hover:text-paper"
                >
                  Necessary only
                </button>
                <button
                  onClick={() => setShowCustomize(true)}
                  className="px-6 py-3 font-pixel text-[10px] tracking-[0.24em] text-paper/40 uppercase hover:text-paper"
                >
                  Customize
                </button>
                <a
                  href="/press#contact"
                  className="ml-auto font-pixel text-[9px] tracking-[0.24em] text-paper/25 uppercase hover:text-paper/50"
                >
                  Cookie policy in press kit
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to open settings from footer
export function openCookieSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("srx:open-cookie-settings"));
  }
}
