import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { consultationHref, services } from "@/lib/services";

const FEATURED = ["business-website", "shopify-store-setup", "dropshipping-website", "app-ai-development"];
const EXTRAS = ["business-consultation", "website-redesign", "website-maintenance", "private-training"];

const pick = (slugs: string[]) =>
  slugs.map((s) => services.find((x) => x.slug === s)).filter((x) => x !== undefined);

export default function HomeServices() {
  const featured = pick(FEATURED);
  const extras = pick(EXTRAS);

  return (
    <section id="services" className="scroll-mt-20 bg-bg-dark px-6 py-24 text-ink-invert md:py-32">
      <div className="mx-auto max-w-7xl md:px-4">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brand">Services & Pricing</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold md:text-5xl">
              What we build, and what it costs.
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-dim-invert transition-colors hover:text-ink-invert"
          >
            All services & packages <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((s) => (
            <li key={s.slug}>
              <Link
                href={consultationHref(s.title)}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/60 transition-colors hover:border-brand/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-bold">{s.title}</h3>
                  <p className="mt-3">
                    {s.priceLabel && (
                      <span className="block text-xs uppercase tracking-widest text-dim-invert">
                        {s.priceLabel}
                      </span>
                    )}
                    <span className="font-display text-3xl font-bold text-brand">{s.price}</span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-dim-invert">{s.description}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 font-mono text-xs uppercase tracking-widest text-ink-invert">
                    Get started
                    <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {extras.map((s) => (
            <li key={s.slug} className="bg-bg-dark p-6">
              <p className="font-display font-bold">{s.title}</p>
              <p className="mt-1 text-sm text-dim-invert">
                {s.priceLabel ? `${s.priceLabel} ` : ""}
                <span className="font-semibold text-ink-invert">{s.price}</span>
                {s.unit ? ` ${s.unit}` : ""}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-dim-invert">
          Domain, hosting, premium themes, platform subscriptions and third-party fees are billed
          separately.
        </p>
      </div>
    </section>
  );
}
