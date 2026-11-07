import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const WORK = [
  { slug: "aurum", name: "Aurum", category: "Fine dining restaurant", image: "/template-aurum.png" },
  { slug: "velora", name: "Velora", category: "Beauty e-commerce", image: "/template-velora.png" },
  { slug: "ironstone", name: "Ironstone", category: "Construction & contracting", image: "/template-ironstone.png" },
];

export default function HomeWork() {
  return (
    <section className="bg-[#05070a] px-6 py-24 text-ink-invert md:py-32">
      <div className="mx-auto max-w-7xl md:px-4">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brand">Our Work</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold md:text-5xl">
              Designed around the business, not a template.
            </h2>
            <p className="mt-4 max-w-xl text-dim-invert">
              Concept designs that show the range we build across industries.
            </p>
          </div>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-dim-invert transition-colors hover:text-ink-invert"
          >
            See all work <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {WORK.map((w) => (
            <li key={w.slug}>
              <Link
                href={`/products/${w.slug}`}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={w.image}
                    alt={`${w.name} website design`}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl font-bold">{w.name}</h3>
                  <span className="font-mono text-xs uppercase tracking-widest text-dim-invert">
                    {w.category}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
