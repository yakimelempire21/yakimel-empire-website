"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "./hooks/useHeroEffects";
import { useLenis } from "./hooks/useLenis";
import Image from "next/image";
import NetworkBackground from "./hero/NetworkBackground";

const FLOATING_WORDS = [
  { text: "WEB", top: "18%", left: "8%" },
  { text: "CLOUD", top: "16%", left: "72%" },
  { text: "MOBILE", top: "34%", left: "88%" },
  { text: "AUTOMATION", top: "68%", left: "92%" },
  { text: "SOFTWARE", top: "58%", left: "5%" },
  { text: "DATA", top: "80%", left: "36%" },
  { text: "AI", top: "84%", left: "78%" },
];

export default function Hero() {
  const [show, setShow] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  useLenis(reducedMotion);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-bg-dark">
      <NetworkBackground />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(15,76,63,0.21) 0%, transparent 70%)",
        }}
      />

      {FLOATING_WORDS.map((w, i) => (
        <motion.span
          key={w.text}
          initial={{ opacity: 0 }}
          animate={
            show
              ? reducedMotion
                ? { opacity: 0.12 }
                : { opacity: 0.12, y: [0, -10, 0] }
              : {}
          }
          transition={{
            opacity: { duration: 1, delay: 0.3 + i * 0.08 },
            y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
          }}
          className="pointer-events-none absolute hidden font-mono text-xs tracking-[0.3em] text-dim-invert md:block"
          style={{ top: w.top, left: w.left }}
        >
          {w.text}
        </motion.span>
      ))}

                <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={show ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-[6%] -translate-x-1/2"
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 0 35px 10px rgba(15,76,63,0.09)",
              "0 0 70px 24px rgba(15,76,63,0.27)",
              "0 0 35px 10px rgba(15,76,63,0.09)",
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-[260px] w-[260px] items-center justify-center rounded-full border border-ink-invert/15 bg-bg-dark p-4 md:h-[560px] md:w-[560px] md:p-7"
        >
          <Image
            src="/yakimel-logo.png"
            alt="Yakimel Empire LLC"
            width={560}
            height={560}
            className="h-full w-full object-contain"
          />
        </motion.div>
      </motion.div>    
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
          className="mb-6 mt-[300px] font-mono text-xs tracking-[0.35em] text-dim-invert md:mt-[600px]"
        >
          TECHNOLOGY · INNOVATION · FUTURE
        </motion.p>

        <div className="mb-6 font-display text-[13vw] font-bold leading-[0.95] text-ink-invert md:text-[6.5vw]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.65, ease: "easeOut" }}
          >
            BUILDING
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.78, ease: "easeOut" }}
            className="bg-gradient-to-r from-ink-invert to-brand bg-clip-text text-transparent"
          >
            THE DIGITAL FUTURE.
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.95, ease: "easeOut" }}
          className="mb-10 font-mono text-xs tracking-[0.25em] text-dim-invert md:text-sm"
        >
          WEB • APPS • SOFTWARE • AI • DIGITAL SYSTEMS
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 1.1, ease: "easeOut" }}
          className="flex flex-wrap justify-center gap-4"
        >
          <a
            href="#services"
            className="rounded-full bg-brand px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-brand-dark"
          >
            Explore Our Services
          </a>
          <a
            href="/consultation"
            className="rounded-full border border-ink-invert/15 px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-ink-invert transition-colors hover:border-brand hover:bg-brand/10"
          >
            Start Your Project
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 1.3 }}
        className="pointer-events-none absolute bottom-10 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-dim-invert">
          SCROLL TO EXPLORE
        </span>
        <motion.span
          animate={reducedMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-dim-invert"
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  );
}