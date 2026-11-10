"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

export default function Expertise() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-10% 0px" });

  return (
    <section
      ref={sectionRef}
      className="bg-bg-dark px-6 py-32 md:px-16"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-14 md:flex-row md:items-center md:gap-16">
        {/* Video preview — links to /templates */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full md:w-1/2"
        >
          <Link
            href="/templates"
            className="group relative block overflow-hidden rounded-2xl border border-ink-invert/15"
          >
            <video
              src="/expertise-preview.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="h-auto w-full object-cover"
            />

            <div className="pointer-events-none absolute inset-0 bg-black/30 transition-colors duration-300 group-hover:bg-black/45" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-6 py-5">
              <span className="font-mono text-xs uppercase tracking-widest text-ink-invert">
                See Our Work
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-dim-invert group-hover:text-ink-invert">
                →
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Text beside the video */}
        <div className="w-full md:w-1/2">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="mb-4 font-mono text-xs uppercase tracking-widest text-brand"
          >
            Built For Real Business
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.22 }}
            className="mb-6 font-display text-3xl font-bold leading-tight text-ink-invert md:text-4xl"
          >
            Your website. Your control.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="mb-8 text-base leading-relaxed text-dim-invert"
          >
            Every website we build comes with a private admin dashboard
            built for you, not a template you're locked out of. Track
            incoming orders in real time, manage your menu or product
            catalog, update prices, and see everything happening on your
            site without ever touching code. No third-party platform
            fees. No waiting on us for every small change. Just log in,
            and run your business.
          </motion.p>

          <motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={inView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.6, ease: "easeOut", delay: 0.38 }}
>
  <Link
    href="/templates"
    className="inline-block rounded-full bg-brand px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-brand-dark"
  >
    See Our Work
  </Link>
</motion.div>
        </div>
      </div>
    </section>
  );
}