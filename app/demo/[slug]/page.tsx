import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProduct, products } from "@/lib/products";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return {
    title: product ? `${product.name} Demo | Yakimel Empire LLC` : "Demo | Yakimel Empire LLC",
    robots: { index: false },
  };
}

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default async function DemoPage({ params }: Params) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  if (product.demoUrl) {
    redirect(product.demoUrl);
  }

  return (
    <main className="flex min-h-screen items-center bg-bg-dark px-6 py-32 text-ink-invert">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          {product.name}
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">Demo coming soon</h1>
        <p className="mt-5 text-lg leading-relaxed text-dim-invert">
          The live demo for {product.name} isn&apos;t ready yet. In the meantime you can read more
          about it, or tell us what you have in mind.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={`/products/${product.slug}`}
            className={`rounded-lg border border-white/25 px-7 py-3 text-sm font-medium transition-colors hover:border-white/60 hover:bg-white/5 ${focus}`}
          >
            View Details
          </Link>
          <Link
            href={`/consultation?service=${encodeURIComponent(product.name)}`}
            className={`rounded-lg bg-brand px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark ${focus}`}
          >
            Start a Project
          </Link>
        </div>
      </div>
    </main>
  );
}
