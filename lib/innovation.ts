import { getProduct } from "@/lib/products";

export type ConceptKind = "brand" | "ads" | "services" | "pickup";

export type InnovationMedia =
  | { type: "image"; src: string; alt: string }
  | { type: "concept"; kind: ConceptKind };

export type LogoAsset = {
  src: string;
  alt: string;
  /** Intrinsic size of the file, for layout. */
  width: number;
  height: number;
};

export type InnovationProject = {
  slug: string;
  name: string;
  category: string;
  description: string;
  /** e.g. "Working title". */
  badge?: string;
  media: InnovationMedia;
  /** Compact app logo (monogram), shown on a light tile next to the name on the card. */
  logo?: LogoAsset;
  /** Full wordmark, shown on a light panel on the overview page. */
  wordmark?: LogoAsset;
  /** Where "Discover Project" goes. /innovation/<slug> routes are generated overview pages. */
  detailsHref: string;
  /** Slug in lib/products.ts, used to read the verified status. */
  productSlug?: string;
  /** Only set when a verified public URL exists. */
  visit?: { label: string; href: string };
  /** Overview page content (projects without an existing detail page). */
  audience: string[];
  capabilities: string[];
};

export const INNOVATION_PAGE = {
  metaTitle: "Innovation | Yakimel Empire LLC",
  metaDescription:
    "Explore the platforms Yakimel Empire is building to help people create, connect and grow.",
  eyebrow: "The Yakimel Ecosystem",
  title: "Innovation starts here.",
  description: "Explore the platforms we're building to help people create, connect and grow.",
  heroCta: { label: "Explore projects", href: "#projects" },
  gridTitle: "Our apps & platforms",
  gridSubtitle: "Discover the ideas shaping our digital future.",
  discover: "Discover Project",
  conceptLabel: "Concept preview",
  closing: {
    title: "Building what comes next.",
    description: "Interested in our vision? Let's connect.",
    button: "Contact Us",
    href: "/#contact",
  },
  overview: {
    back: "← Back to Innovation",
    audience: "Who it's for",
    capabilities: "Planned capabilities",
    capabilitiesNote:
      "This project is at the concept stage. These capabilities are planned and may change.",
    cta: "Start a Project",
    ctaNote: "Interested in this project? Tell us about it.",
  },
} as const;

export const innovationProjects: InnovationProject[] = [
  {
    slug: "digimarket",
    name: "DigiMarket",
    category: "Digital Marketplace",
    description: "A platform for digital products, online courses and creative tools.",
    media: {
      type: "image",
      src: "/digimarket-hero.png",
      alt: "DigiMarket app icon, a play button over an open book with a graduation cap",
    },
    detailsHref: "/products/digimarket",
    productSlug: "digimarket",
    visit: { label: "Visit App", href: "https://digimarketapp.com" },
    audience: [],
    capabilities: [],
  },
  {
    slug: "health-hyr",
    name: "Health Hyr",
    category: "Healthcare Careers",
    description:
      "Connecting healthcare professionals with employers and career opportunities.",
    media: {
      type: "image",
      src: "/healthhyr-hero.png",
      alt: "Health Hyr logo with the tagline Careers that care, over a healthcare worker holding a tablet",
    },
    detailsHref: "/products/health-hyr",
    productSlug: "health-hyr",
    audience: [],
    capabilities: [],
  },
  {
    slug: "brandforge-ai",
    name: "BrandForge AI",
    category: "Brand Creation",
    description:
      "AI-powered tools to help entrepreneurs develop their brand identity and content.",
    media: { type: "concept", kind: "brand" },
    detailsHref: "/innovation/brandforge-ai",
    audience: ["Entrepreneurs building a brand"],
    capabilities: ["AI-powered brand identity development", "AI-powered content development"],
  },
  {
    // The old spelling /innovation/advertwise redirects here (see next.config.ts).
    slug: "advertwize",
    name: "Advertwize",
    category: "Advertising Platform",
    description: "Plan campaigns, manage advertising and understand performance in one place.",
    media: { type: "concept", kind: "ads" },
    logo: {
      src: "/logos/advertwize-mark.trim.png",
      alt: "Advertwize logo",
      width: 671,
      height: 385,
    },
    wordmark: {
      src: "/logos/advertwize-wordmark.trim.png",
      alt: "Advertwize logo",
      width: 3557,
      height: 857,
    },
    detailsHref: "/innovation/advertwize",
    audience: ["Businesses and teams that run advertising campaigns"],
    capabilities: ["Campaign planning", "Advertising management", "Performance insights in one place"],
  },
  {
    slug: "service-business-platform",
    name: "Service Business Platform",
    category: "Bookings & Business Tools",
    badge: "Working title",
    description:
      "Create a business page, showcase services, manage appointments and accept payments. This concept supports professionals such as hairstylists, nail technicians, cleaners, plumbers, tutors and consultants.",
    media: { type: "concept", kind: "services" },
    detailsHref: "/innovation/service-business-platform",
    audience: [
      "Hairstylists",
      "Nail technicians",
      "Cleaners",
      "Plumbers",
      "Tutors",
      "Consultants",
    ],
    capabilities: [
      "A business page",
      "A showcase of your services",
      "Appointment management",
      "Payment acceptance",
    ],
  },
  {
    slug: "pickup-marketplace",
    name: "Pickup Marketplace",
    category: "Local Commerce",
    badge: "Working title",
    description:
      "A platform for ordering from restaurants, shops and local businesses, with pickup on location.",
    media: { type: "concept", kind: "pickup" },
    detailsHref: "/innovation/pickup-marketplace",
    audience: ["Restaurants, shops and local businesses", "Customers who want to order and pick up locally"],
    capabilities: ["Ordering from local businesses", "Pickup on location"],
  },
];

/** Projects whose "Discover Project" target is a generated /innovation/<slug> overview page. */
export const overviewProjects = innovationProjects.filter((p) =>
  p.detailsHref.startsWith("/innovation/"),
);

export function getOverviewProject(slug: string): InnovationProject | undefined {
  return overviewProjects.find((p) => p.slug === slug);
}

/** Verified status from lib/products.ts; undefined (hidden) when unknown. */
export function statusLabel(project: InnovationProject): string | undefined {
  const status = project.productSlug ? getProduct(project.productSlug)?.status : undefined;
  if (status === "live") return "Live";
  if (status === "coming-soon") return "Coming soon";
  return undefined;
}
