import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import ServicesGrid from "@/components/ServicesGrid";
import { SERVICES_PAGE } from "@/lib/services";

export const metadata: Metadata = {
  title: SERVICES_PAGE.metaTitle,
  description: SERVICES_PAGE.metaDescription,
  openGraph: {
    title: SERVICES_PAGE.metaTitle,
    description: SERVICES_PAGE.metaDescription,
    type: "website",
    siteName: "Yakimel Empire LLC",
  },
};

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-bg-dark text-ink-invert">
      <header className="relative overflow-hidden border-b border-white/10 pb-12 pt-28 md:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(ellipse_at_top_right,rgba(47,111,234,0.28),transparent_65%)]"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 md:px-10 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand">
              {SERVICES_PAGE.eyebrow}
            </p>
            <h1 className="mt-3 max-w-xl font-display text-4xl font-bold leading-tight md:text-6xl">
              {SERVICES_PAGE.title}
            </h1>
            <p className="mt-4 max-w-xl text-base text-dim-invert md:text-lg">
              {SERVICES_PAGE.subtitle}
            </p>
            <Link
              href={SERVICES_PAGE.heroCta.href}
              className={`mt-8 inline-flex items-center justify-center rounded-lg bg-brand px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark ${focus}`}
            >
              {SERVICES_PAGE.heroCta.label} <span aria-hidden="true">&nbsp;→</span>
            </Link>
          </div>

          <Image
            src={SERVICES_PAGE.heroImage}
            alt={SERVICES_PAGE.heroImageAlt}
            width={1400}
            height={900}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-auto w-full"
          />
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <h2 className="font-display text-3xl font-bold md:text-4xl">
          {SERVICES_PAGE.sectionTitle}
        </h2>
        <span aria-hidden="true" className="mt-3 block h-1 w-12 rounded bg-brand" />

        <div className="mt-8">
          <ServicesGrid />
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-dim-invert">
          {SERVICES_PAGE.note}
        </p>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-white/10 bg-surface/60 px-6 py-6 md:flex-row md:items-center md:px-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
              <MessageCircle size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold">{SERVICES_PAGE.cta.title}</h2>
              <p className="mt-1 text-sm text-dim-invert">{SERVICES_PAGE.cta.subtitle}</p>
            </div>
          </div>
          <Link
            href={SERVICES_PAGE.cta.href}
            className={`inline-flex items-center justify-center rounded-lg bg-brand px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark ${focus}`}
          >
            {SERVICES_PAGE.cta.button} <span aria-hidden="true">&nbsp;→</span>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-dim-invert">
          <a
            href={SERVICES_PAGE.credit.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline underline-offset-2 transition-colors hover:text-ink-invert ${focus}`}
          >
            {SERVICES_PAGE.credit.text}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </section>
    </main>
  );
}
