import Link from "next/link";
import { Plus } from "lucide-react";

const QUESTIONS = [
  {
    q: "How much does a website cost?",
    a: "Business websites start at $699, Shopify stores at $599 and dropshipping stores at $799. Apps and AI tools are quoted per project. You get a written quote before any work starts.",
  },
  {
    q: "Are there other costs?",
    a: "Domain, hosting, premium themes, platform subscriptions and other third-party fees are billed separately. We list them in your quote so you know the full cost up front.",
  },
  {
    q: "Can I update my website myself?",
    a: "Yes. Every website we build comes with a private admin dashboard where you can manage products or menus, update prices and track orders without touching code.",
  },
  {
    q: "What happens after launch?",
    a: "We show you how to run your site, and offer maintenance plans from $79/month and one-to-one training at $60/hour if you want ongoing help.",
  },
  {
    q: "How fast will you get back to me?",
    a: "We reply to project requests within 24–48 business hours.",
  },
];

export default function HomeFAQ() {
  return (
    <section className="bg-slate-50 px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 md:px-4 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brand">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-5xl">
            Common questions
          </h2>
          <Link
            href="/faq"
            className="mt-6 inline-block font-mono text-xs uppercase tracking-widest text-brand hover:text-brand-dark"
          >
            All questions →
          </Link>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-bold text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus
                  size={20}
                  aria-hidden="true"
                  className="shrink-0 text-brand transition-transform group-open:rotate-45"
                />
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-dim">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
