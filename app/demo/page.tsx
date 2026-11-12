import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, MessageCircle, ShoppingBag, Smartphone } from "lucide-react";
import { DEMO_SITES, RESTAURANT_DEMO, type DemoSite } from "@/lib/demo-sites";
import { SITE } from "@/lib/site";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

const title = "Live Demos — Try Your Future Website | Yakimel Empire";
const description =
  "Click through real demo websites for restaurants, cafés, clinics, nail techs, lash and waxing studios and online stores, with online booking and a 24/7 WhatsApp AI assistant.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/demo" },
  openGraph: { title, description, type: "website", siteName: SITE.name },
};

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

type Card = {
  slug: string;
  name: string;
  businessType: string;
  pkgLabel: string;
  tagline: string;
  features: string[];
  image?: string;
  site?: DemoSite;
};

const hasFile = (src: string) => existsSync(path.join(process.cwd(), "public", src));

const CARDS: Card[] = [
  { ...RESTAURANT_DEMO },
  ...["cafe", "nails", "lashes", "waxing", "clinic", "store"].map((slug) => {
    const site = DEMO_SITES.find((d) => d.slug === slug)!;
    return {
      slug,
      name: site.name,
      businessType: site.businessType,
      pkgLabel: site.pkgLabel,
      tagline: site.tagline,
      features: site.features,
      image: hasFile(site.hero.src) ? site.hero.src : undefined,
      site,
    };
  }),
];

function Preview({ card }: { card: Card }) {
  if (card.image) {
    return <Image src={card.image} alt="" fill sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />;
  }
  const t = card.site!.theme;
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-5" style={{ background: `radial-gradient(120% 90% at 85% 0%, ${t.soft}, ${t.bg} 60%)`, color: t.ink }}>
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <span className={t.font === "serif" ? "font-serif text-base font-medium" : "font-display text-base font-bold"}>{card.name}</span>
        <span className="rounded-full px-2.5 py-1" style={{ background: t.accent, color: t.accentInk }}>
          Book
        </span>
      </div>
      <p className={`max-w-[85%] text-2xl leading-tight ${t.font === "serif" ? "font-serif" : "font-display font-bold"}`}>{card.tagline}</p>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-10 flex-1 rounded-lg" style={{ background: i === 1 ? t.accent : t.soft, opacity: i === 1 ? 0.85 : 1 }} />
        ))}
      </div>
    </div>
  );
}

export default function DemosPage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <header className="relative overflow-hidden bg-sky pb-16 pt-32 md:pt-40">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.7),transparent_65%)]" />
        <Reveal className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/70">Live demos</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-6xl">Try your future website before you buy.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink/80">
            Click around, book an appointment, place an order and chat with the WhatsApp AI assistant. This is exactly what your
            customers will see, with your name, photos and prices.
          </p>
        </Reveal>
        <ul className="relative mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3 px-6 text-sm font-medium">
          {[
            [CalendarCheck, "Online booking"],
            [ShoppingBag, "Order & checkout"],
            [MessageCircle, "WhatsApp AI 24/7"],
            [Smartphone, "Perfect on phones"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof CalendarCheck;
            return (
              <li key={label as string} className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 backdrop-blur">
                <I size={16} className="text-brand" aria-hidden="true" /> {label as string}
              </li>
            );
          })}
        </ul>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <RevealGroup className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => (
            <RevealItem key={c.slug}>
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-[0_20px_50px_-36px_rgba(14,59,50,0.5)] transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-34px_rgba(14,59,50,0.55)]">
                <Link href={`/demo/${c.slug}`} className={`relative block aspect-[16/11] overflow-hidden ${focus}`} aria-label={`Open the ${c.businessType.toLowerCase()} demo`}>
                  <Preview card={c} />
                  <span className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{c.businessType}</span>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl font-bold">{c.name}</h2>
                  <p className="mt-1 text-sm font-medium text-brand">{c.pkgLabel}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {c.features.map((f) => (
                      <li key={f} className="rounded-full bg-cream px-2.5 py-1 text-xs text-dim">
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap items-center gap-3 pt-1 sm:mt-auto">
                    <Link
                      href={`/demo/${c.slug}`}
                      className={`inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark ${focus}`}
                    >
                      Open demo <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                    <Link
                      href={`/consultation?service=${encodeURIComponent(c.site?.pkg ?? "AI Business Package")}`}
                      className={`text-sm font-semibold text-ink underline-offset-4 hover:underline ${focus}`}
                    >
                      I want this
                    </Link>
                  </div>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mx-auto mt-16 flex max-w-5xl flex-col items-start justify-between gap-5 rounded-3xl bg-brand px-7 py-8 text-white md:flex-row md:items-center md:px-10">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Don&apos;t see your type of business?</h2>
            <p className="mt-2 text-white/80">Barbers, churches, cleaning, real estate, trucking… we build it for you, live in 7 days.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/consultation" className={`rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:bg-cream ${focus}`}>
              Book a free call
            </Link>
            <Link href="/pricing" className={`rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 ${focus}`}>
              See pricing
            </Link>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-dim">
          Looking for design ideas? See our{" "}
          <Link href="/templates" className="font-semibold text-brand hover:underline">
            concept designs
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
