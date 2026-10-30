export type ProductType = "website" | "app" | "ai-app" | "software";
export type ProductStatus = "live" | "coming-soon";

export type Product = {
  slug: string;
  name: string;
  /** Primary type. */
  type: ProductType;
  /** Every tab the product is listed under (always includes `type`). */
  tabs: ProductType[];
  industry: string;
  /** Small letter-spaced label shown above the name. */
  categoryLabel: string;
  description: string;
  image: string;
  status: ProductStatus;
  demoUrl?: string;
  detailsUrl: string;
  /** Replaces the "View Demo" button (e.g. "Get a Quote"). */
  primaryCta?: { label: string; href: string };
};

export type TabId = "all" | "websites" | "apps" | "ai-apps" | "software";

export type TabDef = {
  id: TabId;
  label: string;
  /** Product type the tab filters on; undefined shows everything. */
  type?: ProductType;
  searchPlaceholder: string;
};

export const TABS: TabDef[] = [
  { id: "all", label: "All Products", searchPlaceholder: "Search products..." },
  { id: "websites", label: "Websites", type: "website", searchPlaceholder: "Search websites..." },
  { id: "apps", label: "Apps", type: "app", searchPlaceholder: "Search apps..." },
  { id: "ai-apps", label: "AI Apps", type: "ai-app", searchPlaceholder: "Search AI apps..." },
  { id: "software", label: "Software & Tools", type: "software", searchPlaceholder: "Search software & tools..." },
];

export function parseTab(value: string | null | undefined): TabId {
  return TABS.find((t) => t.id === value)?.id ?? "all";
}

// Swap a placeholder for a real screenshot by dropping the file in /public
// and updating the `image` path (e.g. "/products/templates/atelier.jpg").
const template = (
  slug: string,
  name: string,
  industry: string,
  description: string,
  image = `/products/templates/${slug}.svg`,
): Product => ({
  slug,
  name,
  type: "website",
  tabs: ["website"],
  industry,
  categoryLabel: industry,
  description,
  image,
  status: "live",
  detailsUrl: `/products/${slug}`,
});

export const products: Product[] = [
  template(
    "aurum",
    "Aurum",
    "Restaurant",
    "An elegant restaurant website with a refined design and immersive dining experience.",
    "/template-aurum.png",
  ),
  template(
    "velora",
    "Velora",
    "Beauty & Shop",
    "A modern beauty and cosmetics shop with a clean, editorial design and seamless shopping experience.",
    "/template-velora.png",
  ),
  template(
    "ironstone",
    "Ironstone",
    "Construction",
    "A powerful construction website showcasing expertise, projects and trust.",
    "/template-ironstone.png",
  ),
  template(
    "maison",
    "Maison",
    "Real Estate",
    "A premium real estate website with stunning visuals and advanced property search.",
  ),
  template(
    "bloom",
    "Bloom",
    "Salon & Spa",
    "A beautiful salon and spa website with online booking and modern, calming design.",
  ),
  template(
    "savory",
    "Savory",
    "Bakery & Cafe",
    "A warm and inviting bakery website with a delightful shop and cafe experience.",
  ),
  template(
    "forma",
    "Forma",
    "Fitness",
    "A bold fitness website designed to inspire, with class schedules and membership options.",
  ),
  template(
    "atelier",
    "Atelier",
    "Portfolio",
    "A minimalist portfolio website for creative professionals and designers.",
  ),
  template(
    "nexora",
    "Nexora",
    "Business",
    "A professional business website built for growth, with a clean and modern design.",
  ),
  {
    slug: "digimarket",
    name: "DigiMarket",
    type: "app",
    tabs: ["app"],
    industry: "E-commerce",
    categoryLabel: "Digital Marketplace",
    description:
      "A multi-vendor marketplace for digital products, with an AI design studio for sellers.",
    image: "/digimarket-hero.png",
    status: "live",
    demoUrl: "https://digimarketapp.com",
    detailsUrl: "https://digimarketapp.com",
  },
  {
    slug: "whatsapp-ai-assistant",
    name: "WhatsApp AI Assistant",
    type: "ai-app",
    tabs: ["ai-app"],
    industry: "Small Business",
    categoryLabel: "AI Assistant",
    description:
      "An AI assistant on WhatsApp that answers customers and takes bookings and orders in English, French, Spanish and Haitian Creole.",
    image: "/products/apps/whatsapp-ai-assistant.svg",
    status: "live",
    detailsUrl: "/products/whatsapp-ai-assistant",
    primaryCta: {
      label: "Get a Quote",
      href: "/consultation?service=WhatsApp%20AI%20Assistant",
    },
  },
  {
    slug: "health-hyr",
    name: "Health Hyr",
    type: "app",
    tabs: ["app"],
    industry: "Healthcare",
    categoryLabel: "Healthcare Jobs",
    description:
      "An AI-powered healthcare jobs and credentials platform connecting professionals with employers.",
    image: "/healthhyr-hero.png",
    status: "coming-soon",
    detailsUrl: "/products/health-hyr",
  },
  {
    slug: "yakimel-design-studio",
    name: "Yakimel Design Studio",
    type: "software",
    tabs: ["software", "ai-app"],
    industry: "Design",
    categoryLabel: "AI Design Tool",
    description:
      "An AI design tool for digital product sellers. Create your product and publish straight to a marketplace.",
    image: "/products/apps/yakimel-design-studio.svg",
    status: "coming-soon",
    detailsUrl: "/products/yakimel-design-studio",
  },
  {
    slug: "omnipresence-ai",
    name: "OmniPresence AI",
    type: "ai-app",
    tabs: ["ai-app"],
    industry: "Marketing",
    categoryLabel: "Social Content Engine",
    description:
      "Automated social media content for small businesses, so they stay visible without a marketing team.",
    image: "/products/apps/omnipresence-ai.svg",
    status: "coming-soon",
    detailsUrl: "/products/omnipresence-ai",
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

export function productsForTab(tab: TabId): Product[] {
  const type = TABS.find((t) => t.id === tab)?.type;
  return type ? products.filter((p) => p.tabs.includes(type)) : products;
}

export function industriesFor(list: Product[]): string[] {
  return Array.from(new Set(list.map((p) => p.industry))).sort((a, b) => a.localeCompare(b));
}
