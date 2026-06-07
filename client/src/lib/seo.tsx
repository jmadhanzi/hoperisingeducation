/**
 * SEO utility — per-page <title>, <meta>, and Open Graph tags.
 * Wrap each page with <PageSEO ... /> to get full SEO coverage.
 */
import { Helmet } from "react-helmet-async";

const SITE_NAME = "Hope Rising Education";
const DEFAULT_DESC =
  "Hope Rising Education is a nonprofit dedicated to improving educational outcomes for underserved children in Zimbabwe. We provide school fees, meals, tutoring, and psycho-social support.";
const OG_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663208076335/8TaPKuh8NEV6zjk5GTYvjo/hero-children-E3Zp4N9BdqMr2BPpEu4Yxq.webp";
const SITE_URL = "https://hoperisingeducationglobal.org";

interface PageSEOProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
}

export function PageSEO({
  title,
  description = DEFAULT_DESC,
  path = "",
  ogImage = OG_IMAGE,
}: PageSEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Empowering Children Through Education`;
  const canonical = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data — NonprofitOrganization */}
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NGO",
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": ogImage,
        "description": DEFAULT_DESC,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Chiredzi",
          "addressCountry": "ZW",
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+263776129568",
          "contactType": "customer support",
          "email": "info@hoperisingeducationglobal.org",
        },
        "sameAs": [
          "https://facebook.com",
          "https://youtube.com",
        ],
      })}</script>
    </Helmet>
  );
}
