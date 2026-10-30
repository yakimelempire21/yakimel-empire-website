import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, isExternal, products } from "@/lib/products";
import { productDetails } from "@/lib/product-details";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} | Yakimel Empire LLC`,
    description: product.description,
  };
}

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const detail = productDetails[product.slug];
  const comingSoon = product.status === "coming-soon";
  const siteUrl = isExternal(product.detailsUrl) ? product.detailsUrl : product.demoUrl;

  return (
    <main className="min-h-screen bg-bg-dark text-ink-invert">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-28 md:pt-32">
        <Link
          href="/products"
          className={`font-mono text-xs uppercase tracking-widest text-brand transition-opacity hover:opacity-80 ${focus}`}
        >
          ← Back to products
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-surface">
            <Image
              src={product.image}
              alt={`${product.name} ${product.categoryLabel.toLowerCase()} preview`}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-top"
            />
            {comingSoon && (
              <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-bg-dark/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest backdrop-blur-sm">
                Coming soon
              </span>
            )}
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brand">
              {product.categoryLabel}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{product.name}</h1>
            <p className="mt-5 text-lg leading-relaxed text-dim-invert">{product.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/consultation?service=${encodeURIComponent(product.name)}`}
                className={`rounded-lg bg-brand px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark ${focus}`}
              >
                Start a Project
              </Link>
              {!comingSoon && siteUrl && (
                <a
                  href={siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg border border-white/25 px-7 py-3 text-sm font-medium transition-colors hover:border-white/60 hover:bg-white/5 ${focus}`}
                >
                  Visit site
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {detail && (
        <section className="border-t border-white/10 px-6 py-16">
          <div className="mx-auto max-w-3xl space-y-6">
            {detail.longDescription.map((paragraph, i) => (
              <p key={i} className="text-lg leading-relaxed text-dim-invert">
                {paragraph}
              </p>
            ))}

            {detail.sections?.map((s) => (
              <div key={s.heading} className="pt-10">
                <h2 className="mb-5 font-display text-2xl font-bold md:text-3xl">{s.heading}</h2>
                <div className="space-y-4">
                  {s.paragraphs.map((p, i) => (
                    <p key={i} className="text-lg leading-relaxed text-dim-invert">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
