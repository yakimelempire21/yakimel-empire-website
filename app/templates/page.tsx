"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const TEMPLATES = [
  {
    slug: "ironstone",
    name: "Ironstone",
    category: "Construction & Contracting",
    image: "/template-ironstone.png",
    description:
      "A bold, high-contrast site built for construction and contracting companies — large photography, confident typography, and clear project pathways for clients who want work done right.",
    tags: ["Corporate", "Services", "Project Showcase"],
  },
  {
    slug: "aurum",
    name: "Aurum",
    category: "Fine Dining Restaurant",
    image: "/template-aurum.png",
    description:
      "An elegant, editorial-style site for upscale hospitality — warm photography, refined serif typography, and interactive gallery filters that let guests explore the space before they arrive.",
    tags: ["Hospitality", "Reservations", "Gallery"],
  },
  {
    slug: "velora",
    name: "Velora",
    category: "Beauty & E-Commerce",
    image: "/template-velora.png",
    description:
      "A premium beauty e-commerce experience — dark, moody product photography paired with clean, confident typography built to convert browsers into buyers.",
    tags: ["E-Commerce", "Product Showcase", "Retail"],
  },
];

export default function TemplatesPage() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-10% 0px" });

  return (
    <main className="min-h-screen bg-[#050505] px-6 pb-24 pt-40 md:px-16">
      <div ref={headerRef} className="mx-auto mb-20 max-w-3xl">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-4 font-mono text-xs uppercase tracking-widest text-[#4d8dff]"
        >
          Our Work
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
          className="font-display text-4xl font-bold leading-tight text-[#eef1f6] md:text-6xl"
        >
          Every business is different.
          <br />
          <span className="text-[#4d8dff]">So is every website we build.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.18 }}
          className="mt-6 max-w-xl text-base leading-relaxed text-[#a2adc4]"
        >
          Concept designs that show the range we design across, from
          construction to hospitality to e-commerce. Every project starts
          from your business, not a one-size-fits-all template.
        </motion.p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        {TEMPLATES.map((t, i) => (
          <TemplateCard key={t.slug} template={t} index={i} />
        ))}
      </div>

      <div className="mx-auto mt-24 max-w-3xl text-center">
        <p className="mb-6 text-lg text-[#a2adc4]">
          Have a business in mind? We&apos;ll design something built entirely around it.
        </p>
        <Link
          href="/consultation"
          className="inline-block rounded-full bg-[#4d8dff] px-10 py-4 font-mono text-sm uppercase tracking-widest text-white transition-colors hover:bg-[#3a7ae8]"
        >
          Start Your Project
        </Link>
      </div>
    </main>
  );
}

function TemplateCard({
  template,
  index,
}: {
  template: (typeof TEMPLATES)[number];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
      className="group overflow-hidden rounded-2xl border border-[#1b2436] bg-[#0b0f16] transition-colors duration-300 hover:border-[#2c3a52]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={template.image}
          alt={template.name}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-6">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-[#4d8dff]">
          {template.category}
        </p>
        <h3 className="mb-3 font-display text-xl font-bold text-[#eef1f6]">
          {template.name}
        </h3>
        <p className="mb-5 text-sm leading-relaxed text-[#a2adc4]">
          {template.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#2c3a52] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#7f93b8]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}