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
  phone: "",
  /** Social profile URLs, e.g. "https://www.instagram.com/yakimelempire". */
  socials: {
    linkedin: "",
    instagram: "",
    youtube: "",
  },
  /** Last time the Privacy Policy / Terms were updated. */
  legalUpdated: "November 7, 2026",
} as const;

/** Main navigation, shared by the header and footer. */
export const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Our Work", href: "/templates" },
  { label: "Products", href: "/products" },
  { label: "Innovation", href: "/innovation" },
  { label: "About", href: "/#about" },
];
