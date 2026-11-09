import type { Metadata } from "next";
import Link from "next/link";
import { Check, MessageCircle } from "lucide-react";
import Testimonials from "@/components/Testimonials";
import { SITE, whatsappUrl } from "@/lib/site";

export const revalidate = 600;

const title = "Pricing — AI, Websites & Apps for Small Businesses | Yakimel Empire";
const description =
  "Clear packages for small businesses and clinics: a website with a 24/7 WhatsApp AI assistant, online booking, and custom apps. Delivered fast, supported every month.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/pricing" },
  openGraph: { title, description, type: "website", siteName: SITE.name },
};

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

type Plan = {
  name: string;
  forWho: string;
  setup: string;
  monthly: string;
  delivery: string;
  features: string[];
  service: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "AI Business",
    forWho: "For restaurants, shops, salons and local services",
    setup: "$1,500",
    monthly: "$199",
    delivery: "Live in 7 days",
    service: "AI Business Package",
    featured: true,
    features: [
      "Professional 5-page website",
      "WhatsApp AI assistant that answers customers 24/7",
      "Replies in English, French, Spanish and Haitian Creole",
      "Google Business Profile set up",
      "Every request lands in one dashboard",
      "Hosting, security, updates and small changes included",
    ],
  },
  {
    name: "Clinic",
    forWho: "For clinics, doctors, dentists and labs",
    setup: "$3,000",
    monthly: "$399",
    delivery: "Live in 14 days",
    service: "Clinic Package",
    features: [
      "Everything in AI Business",
      "Online appointment booking",
      "Automatic WhatsApp reminders to cut no-shows",
      "Patient intake forms",
      "Priority support",
    ],
  },
  {
    name: "Shopify Store Rebuild",
    forWho: "For online stores that look dated or don't convert",
    setup: "$2,500",
    monthly: "$149",
    delivery: "Live in 14 days",
    service: "Shopify Store Rebuild",
    features: [
      "New mobile-first design for your Shopify store",
      "Products, collections and menus reorganized",
      "Faster pages and a smoother checkout",
      "SEO basics: titles, descriptions, Google Shopping",
      "Abandoned-cart and order emails set up",
      "Monthly care: updates, fixes and small changes",
    ],
  },
  {
    name: "Custom",
    forWho: "For businesses that need an app or internal system",
    setup: "From $8,000",
    monthly: "From $500",
    delivery: "Timeline agreed together",
    service: "Custom App or System",
    features: [
      "Mobile app, web platform or e-commerce",
      "Internal systems: CRM, dashboards, automation",
      "AI built into your workflows",
      "Design, development and launch",
      "Ongoing maintenance and improvements",
      "A dedicated project lead",
    ],
  },
];

const FAQ = [
  {
    q: "What does the monthly fee cover?",
    a: "Hosting, security, backups, the AI assistant, software updates and small content changes. You never pay extra to keep your site or assistant running.",
  },
  {
    q: "How do payments work?",
    a: "50% of the setup fee to start and 50% at launch. The monthly plan starts once you are live. You can cancel the monthly plan with 30 days' notice.",
  },
  {
    q: "Do you work with businesses in Haiti?",
    a: "Yes. We work with businesses in Haiti, the United States, Canada and the wider diaspora. Ask us about local payment options.",
  },
];

export default function PricingPage() {
  const wa = whatsappUrl("Hi Yakimel Empire, I'd like to know more about your packages.");
  return (
    <main className="min-h-screen bg-bg-dark text-ink-invert">
      <header className="relative overflow-hidden border-b border-white/10 pb-14 pt-28 text-center md:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(47,111,234,0.3),transparent_65%)]"
        />
        <div className="relative mx-auto max-w-3xl px-6">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand">Pricing</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-6xl">
            Get more customers. Answer every one.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-dim-invert md:text-lg">
            Simple packages with a clear price. A one-time setup, then one monthly plan that keeps
            everything running.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                plan.featured
                  ? "border-brand bg-brand/10 shadow-[0_0_40px_rgba(47,111,234,0.25)]"
                  : "border-white/10 bg-surface/60"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-xs font-medium text-white">
                  Most popular
                </span>
              )}
              <h2 className="font-display text-2xl font-bold">{plan.name}</h2>
              <p className="mt-1 text-sm text-dim-invert">{plan.forWho}</p>

              <div className="mt-6">
                <p className="font-display text-4xl font-bold">{plan.setup}</p>
                <p className="text-sm text-dim-invert">one-time setup</p>
                <p className="mt-3 text-lg font-medium">
                  + {plan.monthly}
                  <span className="text-sm font-normal text-dim-invert"> / month</span>
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-brand">{plan.delivery}</p>
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/consultation?service=${encodeURIComponent(plan.service)}`}
                className={`mt-8 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
                  plan.featured
                    ? "bg-brand text-white hover:bg-brand-dark"
                    : "border border-white/20 hover:border-brand hover:bg-brand/10"
                } ${focus}`}
              >
                Get started <span aria-hidden="true">&nbsp;→</span>
              </Link>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-dim-invert">
          Prices in US dollars. Every project starts with a free 20-minute call to confirm what you
          need. No surprises.
        </p>

      </section>

      <Testimonials className="border-t border-white/10" />

      <section className="mx-auto max-w-7xl px-6 pb-14 md:px-10">
        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="font-display text-3xl font-bold">Questions</h2>
          <span aria-hidden="true" className="mt-3 block h-1 w-12 rounded bg-brand" />
          <dl className="mt-8 space-y-6">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl border border-white/10 bg-surface/60 p-6">
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-dim-invert">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mx-auto mt-16 flex max-w-5xl flex-col items-start justify-between gap-5 rounded-2xl border border-white/10 bg-surface/60 px-6 py-6 md:flex-row md:items-center md:px-8">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
              <MessageCircle size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-bold">Not sure which package fits?</h2>
              <p className="mt-1 text-sm text-dim-invert">Tell us about your business and we&apos;ll recommend one.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center rounded-lg bg-[#25D366] px-6 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 ${focus}`}
              >
                Chat on WhatsApp
              </a>
            )}
            <Link
              href="/consultation"
              className={`inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark ${focus}`}
            >
              Book a free call <span aria-hidden="true">&nbsp;→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
