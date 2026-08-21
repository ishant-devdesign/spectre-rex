"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/lib/hooks";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  window.history.scrollRestoration = "manual";
}

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;
    const instance = new Lenis({
      lerp: 0.11,
      wheelMultiplier: 1,
      touchMultiplier: 1.35,
    });
    setLenis(instance);
    instance.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  /* Reset scroll synchronously in layout effect before browser paint.
     This prevents the newly mounted page from painting at the old scroll position. */
  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
    ScrollTrigger.clearScrollMemory?.();
    ScrollTrigger.refresh();
  }, [pathname, lenis]);

  useEffect(() => {
    const first = setTimeout(() => ScrollTrigger.refresh(), 300);
    const second = setTimeout(() => ScrollTrigger.refresh(), 1000);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, [pathname]);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
