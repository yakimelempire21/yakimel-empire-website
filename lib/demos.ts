// Slugs that have a real, built-in demo at /demo/<slug> (they hide the site's
// Nav/Footer and use their own top bar). Configs live in lib/demo-sites.ts;
// "aurum" is the hand-built restaurant demo.
export const DEMO_SLUGS = ["aurum", "clinic", "cafe", "waxing", "lashes", "nails", "store"] as const;

export type DemoSlug = (typeof DEMO_SLUGS)[number];

export function hasDemo(slug: string): slug is DemoSlug {
  return (DEMO_SLUGS as readonly string[]).includes(slug);
}
