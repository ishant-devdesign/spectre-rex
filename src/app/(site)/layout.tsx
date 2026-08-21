import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { PremiumLoaderProvider } from "@/components/transition/PremiumLoader";
import { PixelTransitionShell } from "@/components/transition/PixelTransitionShell";
import { RouteReadyBoundary } from "@/components/transition/RouteReadyBoundary";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Grain } from "@/components/ui/Grain";

/**
 * Public site chrome. The intro flag is set here rather than in the root
 * <head> so /admin never inherits it — otherwise the intro's
 * `overflow: hidden` would lock scrolling on a page that has no loader to
 * release it.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement;d.dataset.intro='pending';d.dataset.routeTransition='active';setTimeout(function(){if(d.dataset.intro==='pending'){d.removeAttribute('data-intro');d.removeAttribute('data-route-transition');window.dispatchEvent(new Event('srx:transition-complete'));}},9000);}}catch(e){}`,
        }}
      />
      <PixelTransitionShell />
      <PremiumLoaderProvider>
        <div data-app-shell>
          <SmoothScroll>
            <Nav />
            <RouteReadyBoundary>
              <main>{children}</main>
            </RouteReadyBoundary>
            <Footer />
          </SmoothScroll>
        </div>
      </PremiumLoaderProvider>
      <Grain />
    </>
  );
}
