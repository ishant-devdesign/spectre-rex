"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, type ReactNode } from "react";

/**
 * The pixel compositor must not reveal a half-initialised route.
 * This signal fires after child layout effects have established GSAP's
 * hidden entrance states, fonts are ready, above-fold images are decoded,
 * and two browser frames have settled.
 */
export function RouteReadyBoundary({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;

    const waitForImages = async () => {
      const images = Array.from(
        document.querySelectorAll<HTMLImageElement>("main img"),
      ).filter((image) => {
        const rect = image.getBoundingClientRect();
        return (
          image.fetchPriority === "high" &&
          rect.top < window.innerHeight &&
          rect.bottom > 0
        );
      });

      if (images.length === 0) return;

      await Promise.race([
        Promise.all(
          images.map(async (image) => {
            if (image.complete) {
              try {
                await image.decode();
              } catch {
                // A decoded image is an enhancement, never a blocker.
              }
              return;
            }
            await new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            });
          }),
        ),
        new Promise<void>((resolve) => window.setTimeout(resolve, 1400)),
      ]);
    };

    const signal = () => {
      if (cancelled) return;
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (cancelled) return;
          window.dispatchEvent(
            new CustomEvent("srx:route-ready", { detail: { pathname } }),
          );
        });
      });
    };

    const fonts = document.fonts?.ready ?? Promise.resolve();
    void Promise.all([fonts.catch(() => undefined), waitForImages()]).then(
      signal,
      signal,
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [pathname]);

  return children;
}
