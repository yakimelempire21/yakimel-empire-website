"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

const WORK = [
  { slug: "aurum", name: "Aurum", category: "Fine dining restaurant", image: "/template-aurum.png" },
  { slug: "velora", name: "Velora", category: "Beauty e-commerce", image: "/template-velora.png" },
  { slug: "ironstone", name: "Ironstone", category: "Construction & contracting", image: "/template-ironstone.png" },
];

function Heading() {
  return (
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-brand">Our Work</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold md:text-5xl lg:text-6xl">
          Designed around the business, not a template.
        </h2>
        <p className="mt-4 max-w-xl text-dim-invert">Concept designs that show the range we build across industries.</p>
      </div>
      <Link
        href="/templates"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-dim-invert transition-colors hover:text-ink-invert"
      >
        See all work <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}

function Card({ w, i, large = false }: { w: (typeof WORK)[number]; i: number; large?: boolean }) {
  return (
    <Link
      href={`/products/${w.slug}`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <div className={`relative overflow-hidden rounded-3xl border border-white/10 ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <Image
          src={w.image}
          alt={`${w.name} website design`}
          fill
          sizes={large ? "60vw" : "(min-width: 768px) 33vw, 100vw"}
          className="object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute right-5 top-5 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className={`font-display font-semibold ${large ? "text-3xl" : "text-xl"}`}>
          <span className="mr-3 font-mono text-sm text-brand">{String(i + 1).padStart(2, "0")}</span>
          {w.name}
        </h3>
        <span className="font-mono text-xs uppercase tracking-widest text-dim-invert">{w.category}</span>
      </div>
    </Link>
  );
}

/** Desktop: the section pins while the work slides sideways as you scroll. */
function HorizontalGallery() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0.05, 0.95], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth + 80));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section ref={section} className="relative hidden bg-[#05070a] text-ink-invert lg:block motion-reduce:hidden" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-16">
        <div className="mx-auto w-full max-w-7xl px-10">
          <Heading />
        </div>
        <motion.div ref={track} style={{ x }} className="mt-10 flex w-max gap-8 pl-[max(2.5rem,calc((100vw-80rem)/2+2.5rem))] pr-10">
          {WORK.map((w, i) => (
            <div key={w.slug} style={{ width: "min(58vw, 860px, calc((100vh - 400px) * 1.6))" }}>
              <Card w={w} i={i} large />
            </div>
          ))}
        </motion.div>
        <div className="mx-auto mt-10 w-full max-w-7xl px-10" aria-hidden="true">
          <div className="h-px w-full bg-white/10">
            <motion.div style={{ width: progress }} className="h-px bg-brand" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StackedGallery({ className = "" }: { className?: string }) {
  return (
    <section className={`bg-[#05070a] px-6 py-24 text-ink-invert md:py-32 ${className}`}>
      <div className="mx-auto max-w-7xl md:px-4">
        <Reveal>
          <Heading />
        </Reveal>
        <RevealGroup className="mt-12 grid gap-8 md:grid-cols-3">
          {WORK.map((w, i) => (
            <RevealItem key={w.slug}>
              <Card w={w} i={i} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export default function HomeWork() {
  // Reduced motion: the pinned sideways gallery is swapped for the simple grid (CSS only, so no hydration mismatch).
  return (
    <>
      <HorizontalGallery />
      <StackedGallery className="lg:hidden motion-reduce:block" />
    </>
  );
}
