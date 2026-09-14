import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  /* www is the canonical host — the bare domain 308s here in Vercel. All
     absolute URLs (OG images, sitemap, canonical) derive from this. */
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Spectre Rex Studios — Independent Game Studio in Gurugram, India",
    template: "%s — Spectre Rex Studios",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "indie game studio",
    "game development India",
    "Gurugram game studio",
    "pixel art games",
    "Spectre Rex",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/assets/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/assets/og.png"],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
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
      <body className="bg-paper font-body text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
