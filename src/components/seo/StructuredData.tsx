import { SITE_DESCRIPTION, SITE_EMAIL, SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * JSON-LD for the studio's public face.
 *
 * Two graphs, both page-independent so they belong on every route:
 *   - Organization  — identity, so Google can attach the name, logo and
 *                     sameAs profiles to the entity rather than to a page.
 *   - WebSite       — enables the sitelinks search box when the site ranks
 *                     for its own name.
 *
 * Rendered in the (site) layout only, never /admin.
 */
export function StructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/Logo.svg`,
    description: SITE_DESCRIPTION,
    email: SITE_EMAIL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gurugram",
      addressRegion: "Haryana",
      addressCountry: "IN",
    },
    foundingDate: "2026",
    // sameAs is intentionally empty until the social profiles exist; fill
    // with the real URLs once Instagram / YouTube / X / LinkedIn are live.
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
