import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { isExternal, products, type Product } from "@/lib/products";
import { Reveal } from "@/components/motion/Reveal";

const own = products.filter((p) => p.type !== "website");
const live = own.filter((p) => p.status === "live");
const upcoming = own.filter((p) => p.status !== "live");

const siteUrlFor = (p: Product) => (isExternal(p.detailsUrl) ? p.detailsUrl : p.demoUrl);

export default function HomeProducts() {
  return (
    <section id="products" className="scroll-mt-20 bg-bg-dark px-6 py-24 text-ink-invert md:py-32">
      <div className="mx-auto max-w-7xl md:px-4">
        <Reveal>
        <p className="font-mono text-xs uppercase tracking-widest text-brand">Our Products</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold md:text-5xl lg:text-6xl">
          We build our own products too.
        </h2>
        <p className="mt-4 max-w-xl text-dim-invert">
          The same team and technology behind client projects runs our own platforms.
        </p>
        </Reveal>

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {live.map((p) => {
            const site = siteUrlFor(p);
            return (
              <li
                key={p.slug}
                className="liquid-glass flex flex-col rounded-2xl bg-surface/60 p-8"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-brand">
                    {p.categoryLabel}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                    Live
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-bold md:text-3xl">{p.name}</h3>
                <p className="mt-3 leading-relaxed text-dim-invert">{p.description}</p>
                <div className="mt-auto flex flex-wrap gap-6 pt-8 font-mono text-xs uppercase tracking-widest">
                  <Link href={`/products/${p.slug}`} className="inline-flex items-center gap-2 text-ink-invert hover:text-brand">
                    Learn more <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                  {site && (
                    <a
                      href={site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-dim-invert hover:text-ink-invert"
                    >
                      Visit site <ArrowUpRight size={14} aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {upcoming.length > 0 && (
          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center">
            <p className="shrink-0 font-mono text-xs uppercase tracking-widest text-dim-invert">
              In development
            </p>
            <ul className="flex flex-wrap gap-3">
              {upcoming.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/products/${p.slug}`}
                    className="block rounded-full border border-white/10 px-4 py-2 text-sm text-dim-invert transition-colors hover:border-brand/60 hover:text-ink-invert"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/innovation"
                  className="block rounded-full px-4 py-2 text-sm text-brand hover:text-ink-invert"
                >
                  See the roadmap →
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
