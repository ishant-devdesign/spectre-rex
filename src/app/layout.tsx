import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://spectrerex.com"),
  title: {
    default: "Spectre Rex Studios — Independent Game Studio in Gurugram, India",
    template: "%s — Spectre Rex Studios",
  },
  description:
    "Spectre Rex Studios is an independent game studio crafting memorable games and digital experiences — bold ideas, built pixel by pixel.",
  openGraph: {
    title: "Spectre Rex Studios",
    description:
      "Independent game studio crafting memorable games and digital experiences — bold ideas, built pixel by pixel.",
    images: ["/assets/img/hero.jpg"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1014",
};

/**
 * Document shell only. The marketing chrome — nav, footer, smooth scroll,
 * pixel transition, first-load intro — lives in the (site) group so the
 * admin panel can opt out of all of it rather than fighting it.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <noscript>
          <style>{`
            [data-gsap-reveal], [data-word] {
              opacity: 1 !important;
              transform: none !important;
            }
            [data-gsap-clip] { clip-path: none !important; }
            [data-pixel-transition] { display: none !important; }
          `}</style>
        </noscript>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Pixelify+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-paper font-body text-ink antialiased">{children}</body>
    </html>
  );
}
