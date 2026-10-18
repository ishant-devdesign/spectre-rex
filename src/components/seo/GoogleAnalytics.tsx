import Script from "next/script";

/**
 * GA4 with Consent Mode v2.
 * - Necessary always granted (site + admin login)
 * - Analytics denied by default, granted only after user consents via CookieConsent
 * - No 0-cookie option: necessary is always on
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
      <Script id="ga4-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            functionality_storage: 'granted',
            personalization_storage: 'denied',
            security_storage: 'granted'
          });
          try {
            var raw = localStorage.getItem('srx:cookie-consent');
            if (raw) {
              var c = JSON.parse(raw);
              if (c && c.analytics) {
                gtag('consent', 'update', {
                  analytics_storage: 'granted'
                });
              }
            }
          } catch(e) {}
        `}
      </Script>
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', '${id}', {
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}
