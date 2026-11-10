"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Layers, Monitor } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const PILLARS = [
  { icon: Monitor, title: "Design", body: "Thoughtful, user-centered experiences." },
  { icon: Layers, title: "Build", body: "Reliable, scalable digital products." },
  { icon: BarChart3, title: "Grow", body: "Technology that creates real impact." },
];

export default function HomeHero() {
  return (
    <>
      <section className="relative overflow-hidden bg-sky pt-32 text-ink md:pt-40">
        {/* Soft light from the top */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.65),transparent_70%)]"
        />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-ink/70"
          >
            Website design, Shopify &amp; AI for small businesses · New York
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="font-display text-[3.1rem] font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-[6.5rem]"
          >
            Your business, online.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink/80 md:text-xl"
          >
            We design and build powerful, beautiful software — websites, online stores, apps and AI tools that help
            businesses grow, sell and serve more people.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.3 }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/consultation"
              className="group inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-base font-semibold text-white shadow-[0_14px_30px_-12px_rgba(14,59,50,0.6)] transition-all hover:-translate-y-0.5 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              Start Your Project
              <ArrowRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/pricing"
              className="rounded-full px-6 py-4 text-base font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              See pricing
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease, delay: 0.35 }}
          className="relative mx-auto mt-12 max-w-6xl px-2 md:mt-14"
        >
          <Image
            src="/hero-devices.webp"
            alt="DigiMarket, a platform built by Yakimel Empire, shown on a laptop and a phone"
            width={1450}
            height={517}
            priority
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="h-auto w-full [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
          />
        </motion.div>
      </section>

      <section className="border-t border-ink/5 bg-cream px-6 py-12 text-ink md:py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:px-4 lg:grid-cols-[1.1fr_2fr]">
          <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl lg:border-r lg:border-ink/10 lg:pr-10">
            A technology studio for modern businesses.
          </h2>
          <ul className="grid gap-8 sm:grid-cols-3">
            {PILLARS.map((p) => (
              <li key={p.title} className="flex items-start gap-4">
                <p.icon size={34} strokeWidth={1.6} aria-hidden="true" className="shrink-0 text-ink" />
                <div>
                  <p className="font-display text-xl font-bold">{p.title}</p>
                  <p className="mt-1 text-sm text-ink/70">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
