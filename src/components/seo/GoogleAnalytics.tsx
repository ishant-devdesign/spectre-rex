import Script from "next/script";

/**
 * GA4 — loads only when NEXT_PUBLIC_GA_ID is set.
 * Set it in .env.local and in Vercel env vars:
 *   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 *
 * Apex is canonical (https://spectrerex.com), so the stream URL in GA
 * should also be https://spectrerex.com. The www -> apex 301 keeps all
 * hits consolidated.
 */
export function GoogleAnalytics() {
  const id = (process.env.NEXT_PUBLIC_GA_ID?.trim() || "G-DELZZBKLTV").trim();
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
