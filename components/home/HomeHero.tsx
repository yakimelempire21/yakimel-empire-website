"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Bot, Check, ShoppingBag, CalendarCheck } from "lucide-react";
import NetworkBackground from "@/components/hero/NetworkBackground";
import Marquee from "@/components/motion/Marquee";

const PROOF = [
  "Business websites from $699",
  "Private admin dashboard included",
  "Reply within 24–48 business hours",
];

const STRIP = [
  "Business websites",
  "Shopify stores",
  "WhatsApp AI assistants",
  "Mobile apps",
  "Booking systems",
  "Dashboards & CRMs",
  "Automation",
  "Redesigns",
];

/** Example notifications floating around the logo (illustrations of what our systems do). */
const CHIPS = [
  { icon: CalendarCheck, title: "New booking request", sub: "Saturday · 2:30 PM", className: "-left-3 top-6 lg:-left-10 lg:top-16" },
  { icon: Bot, title: "AI assistant replied", sub: "“Yes, we deliver to Brooklyn!”", className: "-right-3 top-[52%] lg:-right-12 lg:top-1/2" },
  { icon: ShoppingBag, title: "New order received", sub: "Order #1042", className: "bottom-2 left-0 lg:bottom-10 lg:-left-4" },
];

const ease = [0.22, 1, 0.36, 1] as const;
const LINE_1 = "Websites and apps that".split(" ");
const LINE_2 = "grow your business.".split(" ");

export default function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const copyOpacity = useTransform(scrollYProgress, [0.45, 0.95], [1, reduce ? 1 : 0]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.9]);

  const word = (w: string, i: number, gradient = false) => (
    <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
      <motion.span
        className={`inline-block ${gradient ? "bg-gradient-to-r from-[#eef1f6] via-[#8fb3ff] to-[#4d8dff] bg-clip-text text-transparent" : ""}`}
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.07 }}
      >
        {w}
      </motion.span>
      &nbsp;
    </span>
  );

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 -z-10 opacity-60">
        <NetworkBackground />
      </div>
      {/* Fine grid + glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 -z-10 h-[760px] w-[760px] rounded-full opacity-50 blur-[150px]"
        style={{ background: "radial-gradient(circle, rgba(77,141,255,0.5) 0%, transparent 70%)" }}
      />

      <div className="mx-auto grid min-h-[100svh] max-w-7xl items-center gap-10 px-6 pb-20 pt-32 lg:gap-14 md:px-10 lg:grid-cols-[1.2fr_1fr] lg:pt-28">
        <motion.div style={{ y: copyY, opacity: copyOpacity }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[#9fb2d6] backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Web · Apps · AI — New York
          </motion.p>

          <h1 className="mt-7 font-display text-[2.7rem] font-semibold leading-[1.0] text-[#eef1f6] sm:text-6xl lg:text-[5.2rem]">
            <span className="sr-only">Websites and apps that grow your business.</span>
            <span aria-hidden="true">
              {LINE_1.map((w, i) => word(w, i))}
              <br className="hidden sm:block" />
              {LINE_2.map((w, i) => word(w, i + LINE_1.length, true))}
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.7 }}
          >
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#a2adc4]">
              We design, build and run websites, online stores, apps and AI tools for small
              businesses, with clear prices and a private dashboard you control.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/consultation"
                className="group relative overflow-hidden rounded-full bg-[#4d8dff] px-8 py-4 text-center text-sm font-medium text-white shadow-[0_10px_40px_-10px_rgba(77,141,255,0.8)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4d8dff]"
              >
                <span className="relative z-10">Start Your Project →</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-white/15 bg-white/[0.03] px-8 py-4 text-center text-sm font-medium text-[#eef1f6] backdrop-blur transition-colors hover:border-[#4d8dff] hover:bg-[#4d8dff]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4d8dff]"
              >
                See Pricing
              </Link>
            </div>

            <ul className="mt-10 grid gap-3 text-sm text-[#a2adc4] sm:grid-cols-3 sm:gap-6">
              {PROOF.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#4d8dff]" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: orbY, scale: orbScale }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease, delay: 0.3 }}
          className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[440px]"
        >
          {/* Rotating light ring */}
          <div
            aria-hidden="true"
            className="absolute -inset-[2px] animate-[spin_14s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(77,141,255,0.9)_60deg,transparent_140deg,transparent_360deg)] motion-reduce:animate-none"
          />
          <div className="relative aspect-square rounded-full bg-[#050505] p-7 shadow-[0_0_120px_10px_rgba(77,141,255,0.22)] lg:p-10">
            <div className="absolute inset-3 rounded-full border border-white/5" aria-hidden="true" />
            <Image src="/yakimel-logo.png" alt="Yakimel Empire LLC" width={440} height={440} priority className="relative h-full w-full object-contain" />
          </div>

          {CHIPS.map((c, i) => (
            <motion.div
              key={c.title}
              aria-hidden="true"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{ opacity: { delay: 1 + i * 0.25, duration: 0.6 }, y: { delay: 1 + i * 0.25, duration: 5 + i, repeat: Infinity, ease: "easeInOut" } }}
              className={`absolute flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0b1020]/85 px-3 py-2 lg:gap-3 lg:px-4 lg:py-3 shadow-2xl shadow-black/40 backdrop-blur-xl ${c.className}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg lg:h-9 lg:w-9 lg:rounded-xl bg-[#4d8dff]/15 text-[#8fb3ff]">
                <c.icon size={16} />
              </span>
              <span>
                <span className="block whitespace-nowrap text-xs font-medium text-[#eef1f6] lg:text-sm">{c.title}</span>
                <span className="block whitespace-nowrap text-[10px] text-[#8a97b3] lg:text-xs">{c.sub}</span>
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="border-y border-white/[0.06] bg-white/[0.015] py-5 font-display text-lg text-[#c9d3e6] md:text-xl">
        <Marquee items={STRIP} />
      </div>
    </section>
  );
}
