"use client";

import gsap from "gsap";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { NAV_LINKS } from "@/data/content";
import { TransitionLink } from "@/components/transition/TransitionLink";
import { LogoMark } from "@/components/svg/LogoMark";
import { DragonMark } from "@/components/svg/DragonMark";

const MENU_LINKS = [
  { href: "/", label: "Home", index: "00" },
  ...NAV_LINKS,
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  /* The overlay stays mounted while it animates out — unmounting on the
     state flip is exactly why closing had no animation before. */
  const [mounted, setMounted] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTimeline = useRef<gsap.core.Timeline | null>(null);
  const lastY = useRef(0);

  /* Scroll awareness: shrink, direction-aware hide, progress bar. */
  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        if (y > lastY.current + 6 && y > 480) setHidden(true);
        else if (y < lastY.current - 6 || y < 120) setHidden(false);
        lastY.current = y;

        const bar = progressRef.current;
        if (bar) {
          const max =
            document.documentElement.scrollHeight - window.innerHeight;
          bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
        }
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Adjust-during-render rather than in an effect: React applies both
     before paint, so there is no cascading re-render and no frame where
     the menu is open on the new route or unmounted mid-animation. */
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    if (open) setOpen(false);
  }
  if (open && !mounted) setMounted(true);

  /* Close on Escape. */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* Mobile menu entrance and exit. The exit is the entrance played in
     reverse order — items leave from the bottom up, then the panel
     closes back into the top edge. */
  useLayoutEffect(() => {
    const panel = menuRef.current;
    if (!mounted || !panel) return;

    const items = panel.querySelectorAll("[data-menu-item]");
    const meta = panel.querySelectorAll("[data-menu-meta]");
    menuTimeline.current?.kill();

    if (open) {
      document.documentElement.style.overflow = "hidden";
      menuTimeline.current = gsap
        .timeline()
        .fromTo(
          panel,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power4.inOut" },
        )
        .fromTo(
          items,
          { y: 64, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.06, ease: "power4.out" },
          "-=0.22",
        )
        .fromTo(
          meta,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
          "-=0.4",
        );
      return;
    }

    menuTimeline.current = gsap
      .timeline({
        onComplete: () => {
          document.documentElement.style.overflow = "";
          setMounted(false);
        },
      })
      .to(meta, { opacity: 0, y: -10, duration: 0.22, ease: "power2.in" }, 0)
      .to(
        items,
        {
          y: -48,
          opacity: 0,
          duration: 0.34,
          stagger: { each: 0.045, from: "end" },
          ease: "power3.in",
        },
        0.04,
      )
      .to(
        panel,
        { clipPath: "inset(0% 0% 100% 0%)", duration: 0.5, ease: "power4.inOut" },
        "-=0.14",
      );
  }, [open, mounted]);

  useEffect(
    () => () => {
      menuTimeline.current?.kill();
      document.documentElement.style.overflow = "";
    },
    [],
  );

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[80] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hidden && !open ? "-translate-y-[130%]" : "translate-y-0"
        }`}
      >
        {/* scroll progress */}
        <div
          ref={progressRef}
          aria-hidden
          className="absolute top-0 left-0 z-20 h-[2px] w-full origin-left scale-x-0 bg-spectre"
        />

        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled && !open ? "px-3 pt-3 md:px-6 md:pt-4" : "px-0 pt-0"
          }`}
        >
          <nav
            className={`mx-auto flex items-center justify-between gap-8 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              scrolled && !open
                /* Right padding matches the space above and below the
                   trailing control, so it sits inset by the same amount on
                   all three sides instead of floating away from the edge. */
                ? "h-[58px] max-w-[1180px] border border-ink/10 bg-paper/85 pr-[9px] pl-4 text-ink shadow-[0_18px_50px_-24px_rgba(11,16,20,0.4)] backdrop-blur-xl md:pl-6"
                : "h-[76px] max-w-[1440px] border border-transparent pr-[18px] pl-5 text-paper md:pl-10"
            }`}
          >
            <TransitionLink
              href="/"
              aria-label="Spectre Rex Studios — home"
              className="relative z-10 shrink-0"
            >
              <LogoMark
                className={`w-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  scrolled && !open ? "h-[20px]" : "h-[26px] md:h-[34px]"
                }`}
              />
            </TransitionLink>

            <div className="hidden items-center gap-9 md:flex">
              {NAV_LINKS.map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <TransitionLink
                    key={link.href}
                    href={link.href}
                    className={`group relative flex items-start gap-1.5 py-2 text-[13.5px] font-semibold tracking-[-0.01em] transition-colors ${
                      active ? "" : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    <span className="mt-[1px] font-pixel text-[8px] text-spectre">
                      {link.index}
                    </span>
                    {link.label}
                    <span
                      aria-hidden
                      className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-spectre transition-transform duration-300 ${
                        active
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </TransitionLink>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <TransitionLink
                href="/contact"
                className="group relative hidden items-center gap-2 border border-current/25 px-4 py-2.5 text-[12.5px] font-semibold transition-colors duration-300 hover:border-spectre hover:bg-spectre hover:text-night md:inline-flex"
              >
                <span className="h-1.5 w-1.5 bg-spectre transition-colors group-hover:bg-night" />
                Talk to the dragon
                <ArrowUpRight className="h-3.5 w-3.5" />
              </TransitionLink>

              {/* burger <-> cross: one control, one morph */}
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className={`group relative grid h-10 w-10 place-items-center border transition-colors duration-300 md:hidden ${
                  open ? "border-paper/30" : "border-current/25"
                }`}
              >
                <span
                  className={`relative block h-[10px] w-5 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    open ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <span
                    className={`absolute left-0 h-[2px] w-5 origin-center bg-current transition-[top,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      open
                        ? "top-1/2 -translate-y-1/2 rotate-45"
                        : "top-0 rotate-0 group-hover:scale-x-75"
                    }`}
                  />
                  <span
                    className={`absolute left-0 h-[2px] w-5 origin-center bg-current transition-[top,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      open
                        ? "top-1/2 -translate-y-1/2 -rotate-45"
                        : "top-[8px] rotate-0"
                    }`}
                  />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ------------------------- mobile menu ------------------------- */}
      {mounted && (
        <div
          ref={menuRef}
          className="fixed inset-0 z-[70] flex flex-col bg-night text-paper"
          style={{ clipPath: "inset(0% 0% 100% 0%)" }}
        >
          <div className="bg-grid-night pointer-events-none absolute inset-0 opacity-50" />
          <DragonMark
            aria-hidden
            className="pointer-events-none absolute -right-[14%] bottom-[6%] w-[70vw] max-w-[380px] text-paper opacity-[0.05]"
          />

          {/* Spacer: the fixed header (logo + morphing control) sits above
              this overlay, so the panel only reserves its height. */}
          <div aria-hidden className="h-[76px] shrink-0" />

          <nav className="relative flex flex-1 flex-col justify-center gap-1 px-6">
            {MENU_LINKS.map((link) => (
              <div
                key={link.href}
                data-menu-item
                className="overflow-hidden py-1"
              >
                <TransitionLink
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline gap-4"
                >
                  <span className="font-pixel text-[11px] text-spectre">
                    {link.index}
                  </span>
                  <span
                    className={`font-display text-[13vw] leading-[1.04] font-extrabold tracking-[-0.03em] uppercase transition-colors duration-300 group-hover:text-spectre sm:text-6xl ${
                      pathname === link.href ? "text-spectre" : "text-paper"
                    }`}
                  >
                    {link.label}
                  </span>
                </TransitionLink>
              </div>
            ))}
          </nav>

          <div
            data-menu-meta
            className="relative flex flex-wrap items-center justify-between gap-4 border-t border-paper/10 px-6 py-6"
          >
            <span className="font-pixel text-[10px] tracking-[0.3em] text-paper/45 uppercase">
              Gurugram, India — Est. 2026
            </span>
            <a
              href="mailto:hello@spectrerex.com"
              className="font-pixel text-[10px] tracking-[0.3em] text-spectre uppercase"
            >
              hello@spectrerex.com
            </a>
          </div>
        </div>
      )}
    </>
  );
}
