import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProduct, products } from "@/lib/products";
import { DEMO_ALIASES, DEMO_SITES, getDemoSite, type DemoSite } from "@/lib/demo-sites";
import AurumDemo from "@/components/demos/AurumDemo";
import BookingDemo from "@/components/demos/BookingDemo";
import CafeDemo from "@/components/demos/CafeDemo";
import ShopDemo from "@/components/demos/ShopDemo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  const slugs = new Set([...DEMO_SITES.map((d) => d.slug), ...products.map((p) => p.slug)]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const site = getDemoSite(slug);
  const name = site?.name ?? getProduct(slug)?.name;
  return {
    title: name ? `${name} — Live Demo | Yakimel Empire` : "Demo | Yakimel Empire",
    description: site ? `Try a live ${site.businessType.toLowerCase()} website demo with online booking and a WhatsApp AI assistant, built by Yakimel Empire.` : undefined,
    alternates: { canonical: `/demo/${slug}` },
  };
}

/** Which demo photos have been added to public/demos/<slug>/ (checked at build time). */
function photosFor(site: DemoSite): string[] {
  const all = [site.hero, ...site.gallery].map((p) => p.src);
  if (site.kind === "menu") all.push(...site.menu.flatMap((c) => c.items.flatMap((i) => (i.photo ? [`/demos/${site.slug}/${i.photo}`] : []))));
  if (site.kind === "store") all.push(...site.products.map((p) => `/demos/${site.slug}/${p.id}.jpg`));
  return all.filter((src) => existsSync(path.join(process.cwd(), "public", src)));
}

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default async function DemoPage({ params }: Params) {
  const { slug } = await params;

  if (DEMO_ALIASES[slug]) redirect(`/demo/${DEMO_ALIASES[slug]}`);
  if (slug === "aurum") return <AurumDemo />;

  const site = getDemoSite(slug);
  if (site) {
    const photos = photosFor(site);
    if (site.kind === "booking") return <BookingDemo site={site} photos={photos} />;
    if (site.kind === "menu") return <CafeDemo site={site} photos={photos} />;
    return <ShopDemo site={site} photos={photos} />;
  }

  const product = getProduct(slug);
  if (!product) notFound();
  if (product.demoUrl) redirect(product.demoUrl);

  return (
    <main className="flex min-h-screen items-center bg-bg px-6 py-32 text-ink">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">{product.name}</p>
        <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Demo coming soon</h1>
        <p className="mt-5 text-lg leading-relaxed text-dim">
          The live demo for {product.name} isn&apos;t ready yet. Try one of our other live demos, or tell us what you have in mind.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/demo" className={`rounded-full border border-ink/20 px-7 py-3 text-sm font-semibold transition-colors hover:border-brand ${focus}`}>
            See all demos
          </Link>
          <Link
            href={`/consultation?service=${encodeURIComponent(product.name)}`}
            className={`rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark ${focus}`}
          >
            Start a Project
          </Link>
        </div>
      </div>
    </main>
  );
}
