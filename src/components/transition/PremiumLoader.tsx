"use client";

import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/lib/hooks";
import {
  clamp,
  createField,
  introPixelUnit,
  paintBar,
  paintDragonDrift,
  paintDragonIn,
  paintIntroFill,
  paintWipe,
  pixelUnit,
  type Field,
} from "./pixelField";

type Phase = "idle" | "intro" | "cover" | "hold" | "reveal" | "linger" | "drift";

interface Shell {
  host: HTMLDivElement;
  pixels: HTMLCanvasElement;
  dragon: HTMLCanvasElement;
}

/* Route transition */
const COVER_MS = 950;
const MIN_HOLD_MS = 260;
const REVEAL_MS = 1050;
const LINGER_MS = 260;
const DRIFT_MS = 1650;

/**
 * Absolute cap on the hold. Deliberately generous: revealing before the
 * route has committed drops the wipe back onto the page you started on,
 * which reads as a click that did nothing.
 */
const READY_FALLBACK_MS = 12000;

/* First-load intro */
const INTRO_FILL_MS = 900;
const INTRO_DRAGON_MS = 700;
const INTRO_STEP_MS = 150;
const INTRO_BAR_MIN_MS = 1100;
const INTRO_READY_CAP_MS = 6000;
const LATTICE_ALPHA = 0.085;

function readShell(): Shell | null {
  const host = document.querySelector<HTMLDivElement>("[data-pixel-transition]");
  const pixels = document.querySelector<HTMLCanvasElement>("[data-pixel-canvas]");
  const dragon = document.querySelector<HTMLCanvasElement>("[data-dragon-canvas]");
  if (!host || !pixels || !dragon) return null;
  return { host, pixels, dragon };
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Fonts decoded and subresources settled — with a hard cap. */
function whenDocumentReady(): Promise<void> {
  const fonts = document.fonts?.ready?.catch(() => undefined) ?? Promise.resolve();
  const loaded =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) =>
          window.addEventListener("load", () => resolve(), { once: true }),
        );
  return Promise.race([
    Promise.all([fonts, loaded]).then(() => undefined),
    wait(INTRO_READY_CAP_MS),
  ]);
}

const TransitionContext = createContext<(href: string) => void>(() => {});

export function usePremiumNavigate() {
  return useContext(TransitionContext);
}

export function PremiumLoaderProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const shellRef = useRef<Shell | null>(null);
  const fieldRef = useRef<Field | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const targetRef = useRef<string | null>(null);
  const readyRef = useRef(false);
  const holdStartedRef = useRef(0);
  const tweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushedRef = useRef(true);
  const introAbortRef = useRef(false);
  const introStartedRef = useRef(false);

  const shell = useCallback(() => {
    /* Re-read when the cached nodes are detached: a hot reload swaps the
       shell for fresh canvases, and painting into orphaned ones is
       invisible — the transition looks like it simply never runs. */
    const cached = shellRef.current;
    if (
      cached &&
      document.contains(cached.host) &&
      document.contains(cached.dragon)
    ) {
      return cached;
    }
    shellRef.current = readShell();
    return shellRef.current;
  }, []);

  const contexts = useCallback(
    (pixelOverride?: number) => {
      const current = shell();
      if (!current) return null;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pw = Math.round(width * dpr);
      const ph = Math.round(height * dpr);

      for (const canvas of [current.pixels, current.dragon]) {
        if (canvas.width !== pw || canvas.height !== ph) {
          canvas.width = pw;
          canvas.height = ph;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
        }
      }

      const pixelContext = current.pixels.getContext("2d");
      const dragonContext = current.dragon.getContext("2d");
      if (!pixelContext || !dragonContext) return null;
      pixelContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      dragonContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* Nearest-neighbour upscale keeps every block edge razor sharp. */
      pixelContext.imageSmoothingEnabled = false;

      const stale =
        !fieldRef.current ||
        fieldRef.current.width !== width ||
        fieldRef.current.height !== height ||
        (pixelOverride !== undefined && fieldRef.current.pixel !== pixelOverride);

      if (stale) fieldRef.current = createField(width, height, pixelOverride);
      if (!fieldRef.current) return null;

      return {
        shell: current,
        pixelContext,
        dragonContext,
        field: fieldRef.current,
      };
    },
    [shell],
  );

  /* Surfaced so a failure is visible rather than silent. */
  const reportError = useCallback((reason: unknown) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    console.warn("[srx:loader]", message);
    window.dispatchEvent(
      new CustomEvent("srx:loader-error", { detail: message }),
    );
  }, []);

  const clearTimers = useCallback(() => {
    for (const ref of [timerRef, safetyRef, pushTimerRef, watchdogRef]) {
      if (ref.current) clearTimeout(ref.current);
      ref.current = null;
    }
  }, []);

  const releaseIntroChrome = useCallback(() => {
    document.documentElement.removeAttribute("data-intro");
  }, []);

  const finish = useCallback(() => {
    const setup = contexts();
    if (setup) {
      setup.pixelContext.clearRect(0, 0, setup.field.width, setup.field.height);
      setup.dragonContext.clearRect(0, 0, setup.field.width, setup.field.height);
      gsap.set([setup.shell.host, setup.shell.dragon], { autoAlpha: 0 });
      setup.shell.host.dataset.phase = "idle";
    }
    phaseRef.current = "idle";
    targetRef.current = null;
    readyRef.current = false;
    releaseIntroChrome();
    document.documentElement.removeAttribute("data-route-transition");
    document.documentElement.removeAttribute("data-loader-phase");
    clearTimers();
    tweenRef.current = null;
  }, [clearTimers, contexts, releaseIntroChrome]);

  /** The mark comes apart only once the page underneath is handed over. */
  const drift = useCallback(() => {
    const setup = contexts();
    if (!setup) {
      finish();
      return;
    }
    phaseRef.current = "drift";
    setup.shell.host.dataset.phase = "drift";

    const state = { progress: 0 };
    tweenRef.current = gsap.to(state, {
      progress: 1,
      duration: DRIFT_MS / 1000,
      ease: "none",
      onUpdate: () => {
        try {
          paintDragonDrift(setup.dragonContext, setup.field, state.progress);
        } catch (error) {
          reportError(error);
          tweenRef.current?.kill();
          finish();
        }
      },
      onComplete: finish,
    });
  }, [contexts, finish, reportError]);

  /* ---------------------------------------------------------------- *
   * First-load intro
   * ---------------------------------------------------------------- */
  const runIntro = useCallback(async () => {
    const aborted = () => introAbortRef.current || phaseRef.current !== "intro";

    try {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const base = pixelUnit(width, height);
      const big = introPixelUnit(width, height, base);
      const mid = Math.max(base + 1, Math.round((big + base) / 2));

      const setup = contexts(big);
      if (!setup) {
        finish();
        window.dispatchEvent(new Event("srx:transition-complete"));
        return;
      }

      let field = setup.field;
      const { pixelContext, dragonContext, shell: nodes } = setup;
      gsap.set([nodes.host, nodes.dragon], { autoAlpha: 1 });
      nodes.host.dataset.phase = "intro";
      window.scrollTo(0, 0);

      const state = {
        fill: 0,
        dragon: 0,
        lattice: LATTICE_ALPHA,
        bar: 0,
        barAlpha: 0,
        /* 1 = the intro's lifted cell tone, 0 = the exact black the route
           wipe paints. Rides to 0 before the reveal so the hand-off does
           not visibly change colour. */
        tone: 1,
        bob: 0,
      };
      const render = () => {
        paintIntroFill(pixelContext, field, state.fill, state.lattice, state.tone);
        paintDragonIn(dragonContext, field, state.dragon, Math.round(state.bob));
        paintBar(dragonContext, field, state.bar, state.barAlpha);
      };
      render();

      /* 1 — chunky pixels fill in, dragon resolves over the tail of it. */
      const opening = gsap.timeline({ onUpdate: render });
      tweenRef.current = opening;
      opening
        .to(state, { fill: 1, duration: INTRO_FILL_MS / 1000, ease: "sine.inOut" }, 0)
        .to(
          state,
          { dragon: 1, duration: INTRO_DRAGON_MS / 1000, ease: "none" },
          INTRO_FILL_MS / 1000 - 0.42,
        );
      await opening;
      if (aborted()) return;
      await wait(150);
      if (aborted()) return;

      /* 2 — resolution climbs: the grid re-rasterises to finer pixels
         and the outlines dissolve as they stop being legible. */
      for (const [index, size] of [mid, base].entries()) {
        const next = createField(width, height, size);
        if (next) {
          field = next;
          fieldRef.current = next;
        }
        /* Punch the grid bright for a beat as it snaps to the finer
           resolution, then let it settle — reads as pulling focus. */
        state.lattice = 0.26;
        state.tone = index === 0 ? 0.55 : 0;
        render();
        await gsap.to(state, {
          lattice: index === 0 ? LATTICE_ALPHA * 0.5 : 0,
          duration: INTRO_STEP_MS / 1000,
          ease: "power2.out",
          onUpdate: render,
        });
        if (aborted()) return;
      }
      state.tone = 0;
      render();

      /* 3 — pixel loading bar, held until the document is actually ready. */
      state.barAlpha = 1;
      const bobTween = gsap.to(state, {
        bob: 1,
        duration: 0.85,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      const barTween = gsap.to(state, {
        bar: 0.92,
        duration: 1.25,
        ease: "power1.out",
        onUpdate: render,
      });
      tweenRef.current = barTween;
      await Promise.all([whenDocumentReady(), wait(INTRO_BAR_MIN_MS)]);
      if (aborted()) return;
      barTween.kill();

      await gsap.to(state, {
        bar: 1,
        duration: 0.26,
        ease: "power2.out",
        onUpdate: render,
      });
      if (aborted()) return;
      bobTween.kill();
      state.bob = 0;

      /* 100% simply settles. A full-frame invert read well, but a hard
         luminance flip is a photosensitivity risk, so the bar just holds
         and fades into the reveal. */
      await wait(260);
      if (aborted()) return;
      await gsap.to(state, {
        barAlpha: 0,
        duration: 0.32,
        ease: "power2.in",
        onUpdate: render,
      });
      if (aborted()) return;

      /* 4 — same reveal as a route change: oval retreats to circle. */
      phaseRef.current = "reveal";
      nodes.host.dataset.phase = "reveal";
      releaseIntroChrome();

      const exit = { progress: 0 };
      const reveal = gsap.to(exit, {
        progress: 1,
        duration: REVEAL_MS / 1000,
        ease: "sine.inOut",
        onUpdate: () => paintWipe(pixelContext, field, "reveal", exit.progress),
      });
      tweenRef.current = reveal;
      await reveal;

      pixelContext.clearRect(0, 0, field.width, field.height);
      gsap.set(nodes.host, { autoAlpha: 0 });

      /* Page entrance animations are gated on this. */
      phaseRef.current = "linger";
      window.dispatchEvent(new Event("srx:transition-complete"));
      document.documentElement.removeAttribute("data-route-transition");
      await wait(LINGER_MS);
      if (introAbortRef.current) return;
      drift();
    } catch (error) {
      reportError(error);
      window.dispatchEvent(new Event("srx:transition-complete"));
      finish();
    }
  }, [contexts, drift, finish, releaseIntroChrome, reportError]);

  /* ---------------------------------------------------------------- *
   * Route transition
   * ---------------------------------------------------------------- */
  const reveal = useCallback(() => {
    if (phaseRef.current !== "hold") return;
    const setup = contexts();
    if (!setup) {
      /* No canvas to animate. Release the page instead of sitting in
         "hold" forever — that state also rejects every later click. */
      reportError("reveal: transition canvases unavailable");
      window.dispatchEvent(new Event("srx:transition-complete"));
      finish();
      return;
    }

    phaseRef.current = "reveal";
    setup.shell.host.dataset.phase = "reveal";
    document.documentElement.dataset.loaderPhase = "reveal";

    const state = { progress: 0 };
    tweenRef.current = gsap.to(state, {
      progress: 1,
      duration: REVEAL_MS / 1000,
      ease: "sine.inOut",
      onUpdate: () => {
        try {
          paintWipe(setup.pixelContext, setup.field, "reveal", state.progress);
        } catch (error) {
          reportError(error);
          tweenRef.current?.kill();
          window.dispatchEvent(new Event("srx:transition-complete"));
          finish();
        }
      },
      onComplete: () => {
        setup.pixelContext.clearRect(0, 0, setup.field.width, setup.field.height);
        gsap.set(setup.shell.host, { autoAlpha: 0 });

        /* Dispatch before dropping the flag, so a component mounting
           later starts at once instead of waiting on a fired event. */
        phaseRef.current = "linger";
        window.dispatchEvent(new Event("srx:transition-complete"));
        document.documentElement.removeAttribute("data-route-transition");
        document.documentElement.removeAttribute("data-loader-phase");

        timerRef.current = setTimeout(drift, LINGER_MS);
      },
    });
  }, [contexts, drift, finish, reportError]);

  const maybeReveal = useCallback(() => {
    if (phaseRef.current !== "hold" || !readyRef.current) return;
    const remaining = Math.max(
      0,
      MIN_HOLD_MS - (performance.now() - holdStartedRef.current),
    );
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(reveal, remaining);
  }, [reveal]);

  const navigate = useCallback(
    (href: string) => {
      /* Whatever happens below, the click must still take the user
         somewhere. Every failure path lands here. */
      const escapeHatch = (reason: unknown) => {
        reportError(reason);
        try {
          finish();
        } catch {
          /* a failed teardown must not block the navigation */
        }
        window.scrollTo(0, 0);
        router.push(href);
      };

      if (reduced) {
        window.scrollTo(0, 0);
        router.push(href);
        return;
      }

      try {
        const phase = phaseRef.current;
        /* An intro or transition already in flight must never strand the
           next click: tear it down rather than swallowing the click. */
        if (phase !== "idle" && phase !== "linger" && phase !== "drift") {
          introAbortRef.current = true;
          tweenRef.current?.kill();
          finish();
        }

        tweenRef.current?.kill();
        clearTimers();
        fieldRef.current = null;

        const setup = contexts();
        if (!setup) {
          escapeHatch("transition canvases unavailable — navigating without it");
          return;
        }

        router.prefetch(href);
        document.documentElement.dataset.routeTransition = "active";
        document.documentElement.dataset.loaderPhase = "cover";
        phaseRef.current = "cover";
        setup.shell.host.dataset.phase = "cover";
        targetRef.current = href;
        readyRef.current = false;
        pushedRef.current = false;

        /* Committed exactly once, by whichever comes first: the cover
           finishing, or the backstop timer. A ticker that never runs —
           throttled tab, offscreen iframe — cannot lose the navigation. */
        const commitRoute = () => {
          if (pushedRef.current) return;
          pushedRef.current = true;
          window.scrollTo(0, 0);
          router.push(href, { scroll: false });
        };

        const bail = (reason: unknown) => {
          reportError(reason);
          tweenRef.current?.kill();
          commitRoute();
          window.dispatchEvent(new Event("srx:transition-complete"));
          finish();
        };

        const guard = (fn: () => void) => {
          try {
            fn();
          } catch (error) {
            bail(error);
          }
        };

        gsap.set([setup.shell.host, setup.shell.dragon], { autoAlpha: 1 });
        guard(() => {
          paintWipe(setup.pixelContext, setup.field, "cover", 0);
          paintDragonIn(setup.dragonContext, setup.field, 0);
        });

        const state = { progress: 0 };
        tweenRef.current = gsap.to(state, {
          progress: 1,
          duration: COVER_MS / 1000,
          ease: "sine.inOut",
          onUpdate: () =>
            guard(() => {
              paintWipe(setup.pixelContext, setup.field, "cover", state.progress);
              /* The mark resolves over the back half of the cover. */
              paintDragonIn(
                setup.dragonContext,
                setup.field,
                clamp((state.progress - 0.4) / 0.55),
              );
            }),
          onComplete: () =>
            guard(() => {
              paintWipe(setup.pixelContext, setup.field, "cover", 1);
              paintDragonIn(setup.dragonContext, setup.field, 1);
              phaseRef.current = "hold";
              setup.shell.host.dataset.phase = "hold";
              document.documentElement.dataset.loaderPhase = "hold";
              holdStartedRef.current = performance.now();
              commitRoute();
              maybeReveal();
            }),
        });

        pushTimerRef.current = setTimeout(commitRoute, COVER_MS + 600);

        safetyRef.current = setTimeout(() => {
          readyRef.current = true;
          maybeReveal();
        }, READY_FALLBACK_MS);

        /* Last line of defence: nothing may outlive its budget and leave
           the loader unable to accept the next click. */
        watchdogRef.current = setTimeout(
          () => {
            if (phaseRef.current === "idle") return;
            reportError(
              `watchdog cleared a stalled transition in phase "${phaseRef.current}"`,
            );
            commitRoute();
            window.dispatchEvent(new Event("srx:transition-complete"));
            finish();
          },
          COVER_MS + READY_FALLBACK_MS + REVEAL_MS + DRIFT_MS + 2000,
        );
      } catch (error) {
        escapeHatch(error);
      }
    },
    [
      clearTimers,
      contexts,
      finish,
      maybeReveal,
      reduced,
      reportError,
      router,
    ],
  );

  useLayoutEffect(() => {
    const setup = contexts();
    if (!setup) return;

    const pending =
      document.documentElement.dataset.intro === "pending" && !reduced;

    if (pending && !introStartedRef.current) {
      introStartedRef.current = true;
      phaseRef.current = "intro";
      void runIntro();
      return;
    }

    if (!pending && phaseRef.current === "idle") {
      gsap.set([setup.shell.host, setup.shell.dragon], { autoAlpha: 0 });
      setup.shell.host.dataset.phase = "idle";
      releaseIntroChrome();
      document.documentElement.removeAttribute("data-route-transition");
    }
  }, [contexts, reduced, releaseIntroChrome, runIntro]);

  /* RouteReadyBoundary is the primary "page is mounted" signal, but the
     committed pathname independently confirms the push landed. */
  useEffect(() => {
    if (phaseRef.current !== "hold") return;
    if (!targetRef.current || pathname !== targetRef.current) return;
    readyRef.current = true;
    maybeReveal();
  }, [pathname, maybeReveal]);

  useEffect(() => {
    const onReady = (event: Event) => {
      const detail = (event as CustomEvent<{ pathname: string }>).detail
        ?.pathname;
      if (!detail || detail !== targetRef.current) return;
      if (safetyRef.current) clearTimeout(safetyRef.current);
      safetyRef.current = null;
      readyRef.current = true;
      maybeReveal();
    };
    window.addEventListener("srx:route-ready", onReady);
    return () => window.removeEventListener("srx:route-ready", onReady);
  }, [maybeReveal]);

  useEffect(() => {
    const onResize = () => {
      if (phaseRef.current === "idle") fieldRef.current = null;
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      introAbortRef.current = true;
      tweenRef.current?.kill();
      for (const ref of [timerRef, safetyRef, pushTimerRef, watchdogRef]) {
        if (ref.current) clearTimeout(ref.current);
      }
      document.documentElement.removeAttribute("data-route-transition");
      document.documentElement.removeAttribute("data-loader-phase");
      document.documentElement.removeAttribute("data-intro");
    };
  }, []);

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
    </TransitionContext.Provider>
  );
}
