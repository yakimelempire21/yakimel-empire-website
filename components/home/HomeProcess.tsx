"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";

const STEPS = [
  {
    title: "Tell us your goal",
    body: "Send a project request or book a consultation. We learn about your business, your customers and what you need the site or app to do.",
  },
  {
    title: "Get a clear quote",
    body: "You get a scope, a price and a timeline in writing before any work starts. No surprises.",
  },
  {
    title: "Design & build",
    body: "We design around your brand, build it mobile-first, and share progress so you can give feedback along the way.",
  },
  {
    title: "Launch & grow",
    body: "We launch, show you how to run your dashboard, and stay available for maintenance, updates and new features.",
  },
];

export default function HomeProcess() {
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 75%", "end 55%"] });
  const line = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="bg-[#05070a] px-6 py-24 text-ink-invert md:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 md:px-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-widest text-brand">How It Works</p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold md:text-5xl lg:text-6xl">
              From idea to launch in four steps.
            </h2>
          </Reveal>
        </div>

        <ol ref={list} className="relative space-y-6 pl-10 md:pl-14">
          <div aria-hidden="true" className="absolute bottom-2 left-[11px] top-2 w-px bg-white/10 md:left-[15px]">
            <motion.div style={{ height: line }} className="w-px bg-gradient-to-b from-brand via-[#8fb3ff] to-brand shadow-[0_0_12px_rgba(77,141,255,0.8)]" />
          </div>
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={0.05} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-10 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-brand/60 bg-[#05070a] md:-left-14 md:h-8 md:w-8"
              >
                <span className="h-2 w-2 rounded-full bg-brand" />
              </span>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-brand/40 md:p-8">
                <span className="font-mono text-sm text-brand">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-dim-invert">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
