export type Service = {
  slug: string;
  title: string;
  /** Small label above the price, e.g. "Starting at". Empty when not applicable. */
  priceLabel: string;
  /** Display price, e.g. "$599" or "Custom Quote". */
  price: string;
  /** Shown after the price, e.g. "/ month". */
  unit?: string;
  description: string;
  buttonLabel: string;
  image: string;
  details: string[];
  /** "link" goes straight to the consultation form; "modal" opens a details dialog. */
  action: "link" | "modal";
};

export const SERVICES_PAGE = {
  metaTitle: "Services & Pricing | Yakimel Empire LLC",
  metaDescription:
    "Expert services with clear starting prices. Build, launch and manage your digital business with Yakimel Empire.",
  eyebrow: "Services & Pricing",
  title: "Expert services. Clear starting prices.",
  subtitle: "Build, launch and manage your digital business with Yakimel Empire.",
  heroCta: { label: "Book a Consultation", href: "/consultation?service=Business%20Consultation" },
  heroImage: "/services/hero.png",
  heroImageAlt: "A laptop and a phone showing a website design",
  sectionTitle: "Choose the service you need.",
  note: "Domain, hosting, premium themes, platform subscriptions, and third-party fees are billed separately.",
  cta: {
    title: "Need a custom solution?",
    subtitle: "Tell us about your project.",
    button: "Request a Quote",
    href: "/consultation?service=Custom%20Solution",
  },
  credit: {
    text: "Photos by Unsplash photographers",
    href: "https://unsplash.com/?utm_source=yakimel_empire&utm_medium=referral",
  },
  modal: { getStarted: "Get Started", close: "Close", includes: "What's included" },
} as const;

export function consultationHref(title: string): string {
  return `/consultation?service=${encodeURIComponent(title)}`;
}

export const services: Service[] = [
  {
    slug: "business-consultation",
    title: "Business Consultation",
    priceLabel: "",
    price: "$75",
    unit: "/ 45 min",
    description: "Project guidance and practical recommendations.",
    buttonLabel: "Book Consultation",
    image: "/services/business-consultation.jpg",
    details: ["Project guidance", "Practical recommendations"],
    action: "link",
  },
  {
    slug: "shopify-store-setup",
    title: "Shopify Store Setup",
    priceLabel: "Starting at",
    price: "$599",
    description: "Theme customization, up to 10 products and basic setup.",
    buttonLabel: "View Packages",
    image: "/services/shopify-store-setup.jpg",
    details: ["Theme customization", "Up to 10 products", "Basic setup"],
    action: "modal",
  },
  {
    slug: "dropshipping-website",
    title: "Dropshipping Website",
    priceLabel: "Starting at",
    price: "$799",
    description: "Store setup, one supplier integration and up to 20 products.",
    buttonLabel: "View Packages",
    image: "/services/dropshipping-website.jpg",
    details: ["Store setup", "One supplier integration", "Up to 20 products"],
    action: "modal",
  },
  {
    slug: "business-website",
    title: "Business Website",
    priceLabel: "Starting at",
    price: "$699",
    description: "Up to 5 pages, mobile design and a contact form.",
    buttonLabel: "View Packages",
    image: "/services/business-website.jpg",
    details: ["Up to 5 pages", "Mobile design", "A contact form"],
    action: "modal",
  },
  {
    slug: "website-redesign",
    title: "Website Redesign",
    priceLabel: "Starting at",
    price: "$499",
    description: "A refreshed design for up to 3 existing pages.",
    buttonLabel: "View Packages",
    image: "/services/website-redesign.jpg",
    details: ["A refreshed design", "Up to 3 existing pages"],
    action: "modal",
  },
  {
    slug: "app-ai-development",
    title: "App & AI Development",
    priceLabel: "",
    price: "Custom Quote",
    description: "Custom apps, AI tools and business integrations.",
    buttonLabel: "Request a Quote",
    image: "/services/app-ai-development.jpg",
    details: ["Custom apps", "AI tools", "Business integrations"],
    action: "link",
  },
  {
    slug: "website-maintenance",
    title: "Website Maintenance",
    priceLabel: "Starting at",
    price: "$79",
    unit: "/ month",
    description: "Maintenance and up to 1 hour of minor updates per month.",
    buttonLabel: "View Plans",
    image: "/services/website-maintenance.jpg",
    details: ["Maintenance", "Up to 1 hour of minor updates per month"],
    action: "modal",
  },
  {
    slug: "private-training",
    title: "Private Training",
    priceLabel: "",
    price: "$60",
    unit: "/ hour",
    description: "One-to-one training to manage your website or Shopify store.",
    buttonLabel: "Book Training",
    image: "/services/private-training.jpg",
    details: ["One-to-one training", "Manage your website or Shopify store"],
    action: "link",
  },
];
