import { SITE } from "@/lib/site";

/** Tells Google who Yakimel Empire is (business type, contact, area served). */
export default function OrganizationSchema() {
  const sameAs = Object.values(SITE.socials).filter(Boolean);
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: "Yakimel Empire",
    url: SITE.url,
    logo: `${SITE.url}/yakimel-logo.png`,
    image: `${SITE.url}/opengraph-image`,
    description:
      "Yakimel Empire LLC designs and builds websites, Shopify stores, apps and WhatsApp AI assistants for small businesses in the United States, Haiti and the diaspora.",
    email: SITE.email,
    ...(SITE.phone ? { telephone: SITE.phone } : {}),
    address: { "@type": "PostalAddress", addressLocality: "New York", addressRegion: "NY", addressCountry: "US" },
    areaServed: ["United States", "Haiti", "Canada"],
    knowsLanguage: ["en", "fr", "es", "ht"],
    priceRange: "$$",
    makesOffer: [
      { "@type": "Offer", name: "AI Business package: website + WhatsApp AI assistant", price: "1500", priceCurrency: "USD" },
      { "@type": "Offer", name: "Shopify Store Rebuild", price: "2500", priceCurrency: "USD" },
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
