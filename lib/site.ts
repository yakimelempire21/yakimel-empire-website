/**
 * Company-wide contact details and links, in one place.
 *
 * Fill in the empty values when they are ready: anything left empty is
 * hidden on the site, so there are never dead or placeholder links.
 */
export const SITE = {
  name: "Yakimel Empire LLC",
  url: "https://www.yakimelempire.com",
  location: "New York, USA",
  /** Public contact email. Shown in the footer and on the legal pages. */
  email: "info@yakimelempire.com",
  /** Phone or WhatsApp number in international format, e.g. "+18455551234". */
  phone: "+18455432799",
  /** How the number is written on the site. */
  phoneDisplay: "+1 (845) 543-2799",
  /** Social profile URLs, e.g. "https://www.instagram.com/yakimelempire". */
  socials: {
    linkedin: "",
    instagram: "",
    youtube: "",
  },
  /** Your Google "Write a review" link (Google Business Profile → Ask for reviews). */
  googleReviewUrl: "https://g.page/r/CYa7EkQq6Uf-ECE/review",
  /** Last time the Privacy Policy / Terms were updated. */
  legalUpdated: "November 7, 2026",
} as const;

/** Main navigation, shared by the header and footer. */
export const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Our Work", href: "/templates" },
  { label: "Products", href: "/products" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

/** wa.me link for SITE.phone with a pre-filled message, or null when no number is set. */
export function whatsappUrl(message?: string): string | null {
  const digits = SITE.phone.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
