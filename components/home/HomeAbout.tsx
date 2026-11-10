import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";

const PILLARS = [
  { title: "Websites & stores", body: "Business sites, Shopify and e-commerce, redesigns." },
  { title: "Apps & software", body: "Web and mobile apps, marketplaces, custom platforms." },
  { title: "AI & automation", body: "AI assistants, chatbots and automated workflows." },
];

export default function HomeAbout() {
  return (
    <section id="about" className="scroll-mt-20 bg-bg-dark px-6 py-24 text-ink-invert md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 md:px-4 lg:grid-cols-2">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-widest text-brand">About Us</p>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl lg:text-6xl">
            A New York technology company building for real business.
          </h2>
          <div className="mt-6 space-y-4 leading-relaxed text-dim-invert">
            <p>
              Yakimel Empire LLC designs and builds digital products for small businesses,
              entrepreneurs and organizations, and develops its own platforms such as DigiMarket
              and our WhatsApp AI Assistant.
            </p>
            <p>
              We combine design, engineering and AI to turn ideas into tools that work: sites that
              bring in customers, stores that sell, and systems that save you time.
            </p>
          </div>
          <p className="mt-8 border-l-2 border-brand pl-5 font-display text-xl">
            Think beyond. Build better. Create the future.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="rounded-3xl border border-ink-invert/15 bg-surface/50 p-8 md:p-10">
          <Image
            src="/yakimel-icon.png"
            alt=""
            width={56}
            height={56}
            className="h-14 w-14"
          />
          <ul className="mt-8 divide-y divide-ink-invert/15">
            {PILLARS.map((p) => (
              <li key={p.title} className="py-5 first:pt-0 last:pb-0">
                <p className="font-display text-lg font-bold">{p.title}</p>
                <p className="mt-1 text-sm text-dim-invert">{p.body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
