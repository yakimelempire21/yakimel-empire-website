import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ProductsBrowser from "@/components/ProductsBrowser";

export const metadata: Metadata = {
  title: "Products | Yakimel Empire LLC",
  description:
    "Explore website designs, apps and digital solutions built around your goals.",
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-bg-dark text-ink-invert">
      <header className="relative overflow-hidden border-b border-white/10 pb-12 pt-28 md:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(ellipse_at_top_right,rgba(47,111,234,0.28),transparent_65%)]"
        />
        <div className="relative mx-auto max-w-7xl px-6 md:px-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-dim-invert">
              <li>
                <Link href="/" className="hover:text-ink-invert transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink-invert">
                Products
              </li>
            </ol>
          </nav>

          <p className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-brand">
            Product Collection
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight md:text-6xl">
            Find the right website for your business.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-dim-invert md:text-lg">
            Explore website designs, apps and digital solutions built around your goals.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
          <ProductsBrowser />
        </Suspense>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/10 bg-surface/60 px-6 py-6 md:flex-row md:items-center md:px-8">
          <div>
            <h2 className="font-display text-2xl font-bold">Have a different vision?</h2>
            <p className="mt-1 text-sm text-dim-invert">
              Let&apos;s create a custom website or app for your business.
            </p>
          </div>
          <Link
            href="/consultation"
            className="inline-flex items-center justify-center rounded-lg bg-brand px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Start a Project <span aria-hidden="true">&nbsp;→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
