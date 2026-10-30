// Slugs that have a real, built-in demo at /demo/<slug>.
// Add a slug here and register its component in app/demo/[slug]/page.tsx.
export const DEMO_SLUGS = ["aurum"] as const;

export type DemoSlug = (typeof DEMO_SLUGS)[number];

export function hasDemo(slug: string): slug is DemoSlug {
  return (DEMO_SLUGS as readonly string[]).includes(slug);
}
