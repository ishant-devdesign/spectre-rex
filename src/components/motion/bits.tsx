"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/lib/hooks";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Start immediately on a normal load. Mid-transition, hold everything
 * back until the wipe has fully cleared — entrance animations belong to
 * the arriving page, not to the pixels still covering it. The loader
 * drops `data-route-transition` as it dispatches, so a component that
 * mounts after the fact starts at once rather than waiting forever.
 */
function whenTransitionEnds(start: () => void) {
  let started = false;
  const run = () => {
    if (started) return;
    started = true;
    start();
  };

  if (document.documentElement.dataset.routeTransition === "active") {
    window.addEventListener("srx:transition-complete", run, { once: true });
    return () => window.removeEventListener("srx:transition-complete", run);
  }

  run();
  return () => {};
}

/* ------------------------------------------------------------------ */
/* Reveal — fade / rise on scroll or hero entrance                     */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 44,
  duration = 1.05,
  once = true,
  scroll = true,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
  scroll?: boolean;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (reduced) {
      gsap.set(element, {
        opacity: 1,
        y: 0,
        clearProps: "opacity,transform",
      });
      return;
    }

    gsap.set(element, { opacity: 0, y, force3D: true });
    let context: gsap.Context | null = null;
    const cancelWait = whenTransitionEnds(() => {
      context = gsap.context(() => {
        gsap.to(element, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power4.out",
          clearProps: "opacity,transform",
          ...(scroll
            ? { scrollTrigger: { trigger: element, start: "top 88%", once } }
            : {}),
        });
      }, element);
    });

    return () => {
      cancelWait();
      context?.revert();
    };
  }, [reduced, delay, y, duration, once, scroll]);

  return (
    <div
      ref={ref}
      data-gsap-reveal
      className={className}
      style={{
        ...style,
        opacity: 0,
        transform: `translate3d(0, ${y}px, 0)`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Words — word-stagger headline reveal                                */
/* ------------------------------------------------------------------ */

export function Words({
  lines,
  accent,
  className,
  delay = 0,
  stagger = 0.055,
  duration = 1.1,
  scroll = true,
  as: Tag = "div",
}: {
  lines: string[];
  accent?: string[];
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  scroll?: boolean;
  as?: "div" | "h1" | "h2" | "h3" | "p" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const accents = (accent ?? []).map((a) => a.toLowerCase());

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const words = element.querySelectorAll<HTMLElement>("[data-word]");
    if (!words.length) return;

    if (reduced) {
      gsap.set(words, {
        y: 0,
        yPercent: 0,
        clearProps: "transform",
      });
      return;
    }

    gsap.set(words, {
      y: 0,
      yPercent: 118,
      force3D: true,
    });
    let context: gsap.Context | null = null;
    const cancelWait = whenTransitionEnds(() => {
      context = gsap.context(() => {
        gsap.to(words, {
          y: 0,
          yPercent: 0,
          duration,
          delay,
          stagger,
          ease: "power4.out",
          clearProps: "transform",
          ...(scroll
            ? {
                scrollTrigger: {
                  trigger: element,
                  start: "top 86%",
                  once: true,
                },
              }
            : {}),
        });
      }, element);
    });

    return () => {
      cancelWait();
      context?.revert();
    };
  }, [reduced, delay, stagger, duration, scroll]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className}>
      {lines.map((line, lineIndex) => {
        const words = line.split(" ");
        return (
          <span key={lineIndex} className="block">
            {words.map((word, wordIndex) => {
              const highlighted =
                accents.length > 0 &&
                accents.some((value) => word.toLowerCase().includes(value));
              return (
                <span
                  key={wordIndex}
                  className="inline-block overflow-hidden align-bottom pb-[0.2em] -mb-[0.2em]"
                >
                  <span
                    data-word
                    className={`inline-block will-change-transform ${
                      highlighted ? "text-spectre" : ""
                    }`}
                    style={{ transform: "translate3d(0, 118%, 0)" }}
                  >
                    {word}
                    {wordIndex < words.length - 1 ? " " : ""}
                  </span>
                </span>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Clip — cinematic clip-path reveal                                   */
/* ------------------------------------------------------------------ */

export function Clip({
  children,
  className,
  delay = 0,
  duration = 1.25,
  scroll = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  scroll?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const inner = element.firstElementChild as HTMLElement | null;

    if (reduced) {
      gsap.set(element, { clearProps: "clipPath" });
      if (inner) gsap.set(inner, { clearProps: "transform" });
      return;
    }

    gsap.set(element, { clipPath: "inset(8% 4% 92% 4%)" });
    if (inner) gsap.set(inner, { scale: 1.28, force3D: true });

    let context: gsap.Context | null = null;
    const cancelWait = whenTransitionEnds(() => {
      context = gsap.context(() => {
        gsap.to(element, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration,
          delay,
          ease: "power4.inOut",
          clearProps: "clipPath",
          ...(scroll
            ? { scrollTrigger: { trigger: element, start: "top 84%", once: true } }
            : {}),
        });

        if (inner) {
          gsap.to(inner, {
            scale: 1,
            duration: duration + 0.25,
            delay,
            ease: "power3.inOut",
            clearProps: "transform",
            ...(scroll
              ? { scrollTrigger: { trigger: element, start: "top 84%", once: true } }
              : {}),
          });
        }
      }, element);
    });

    return () => {
      cancelWait();
      context?.revert();
    };
  }, [reduced, delay, duration, scroll]);

  return (
    <div
      ref={ref}
      data-gsap-clip
      /* clip-path masks painting but not layout overflow, so an inner
         parallax layer inset by -10% still widened the document and made
         mobile Chrome shrink-to-fit the whole page. */
      className={`overflow-hidden ${className ?? ""}`}
      style={{
        clipPath: "inset(8% 4% 92% 4%)",
        willChange: "clip-path",
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Parallax — gentle scrub drift                                       */
/* ------------------------------------------------------------------ */

export function Parallax({
  children,
  className,
  from = 9,
  to = -9,
  speed = 0.7,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  to?: number;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || reduced) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        { yPercent: from },
        {
          yPercent: to,
          ease: "none",
          scrollTrigger: {
            trigger: element.parentElement ?? element,
            start: "top bottom",
            end: "bottom top",
            scrub: speed,
          },
        },
      );
    }, element);
    return () => context.revert();
  }, [reduced, from, to, speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ transform: `translate3d(0, ${from}%, 0)` }}
    >
      {children}
    </div>
  );
}
