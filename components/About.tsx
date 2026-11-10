"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section id="about" ref={ref} className="bg-cream py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-mono text-xs uppercase tracking-widest text-brand mb-3"
        >
          About Us
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
          className="font-display font-bold text-3xl md:text-4xl mb-6 text-ink-invert"
        >
          A Vision Focused on the Future
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.16 }}
        >
          <p className="text-dim-invert leading-relaxed mb-4">
            The world is evolving rapidly. Technology is transforming businesses, industries, and the way we live and work. At Yakimel Empire LLC, we aim to play an active role in this transformation.
          </p>
          <p className="text-dim-invert leading-relaxed mb-4">
            We are building a technology driven vision based on creativity, research, innovation, and execution, exploring the possibilities offered by digital technologies to create solutions designed to address today&apos;s challenges and tomorrow&apos;s opportunities.
          </p>
          <p className="text-dim-invert leading-relaxed mb-10">
            Our ambition is to build a technology company capable of developing its own solutions while collaborating with businesses, entrepreneurs, institutions, and partners who share the same commitment to innovation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.24 }}
          className="border-l-2 border-brand pl-6"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-brand mb-2">
            Our Philosophy
          </p>
          <p className="font-display text-2xl text-ink-invert">
            Think beyond. Build better. Create the future.
          </p>
        </motion.div>
      </div>
    </section>
  );
}