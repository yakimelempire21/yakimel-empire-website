"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isExternal, products, type Product } from "@/lib/products";

// The home carousel highlights products; website templates live on /products.
const featured = products.filter((p) => p.type !== "website");

const siteUrlFor = (p: Product) =>
  isExternal(p.detailsUrl) ? p.detailsUrl : p.demoUrl;

export default function ProductGrid() {
  const sectionRef = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-10% 0px" });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const scrollByCard = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? 340;
    el.scrollBy({ left: direction === "left" ? -cardWidth - 24 : cardWidth + 24, behavior: "smooth" });
  };

  return (
    <section id="products" ref={sectionRef} className="bg-[#05070a] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-mono text-xs uppercase tracking-widest text-[#4d8dff] mb-3"
        >
          Portfolio
        </motion.p>

        <div className="mb-10 flex items-end justify-between gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.08 }}
            className="font-display font-bold text-3xl md:text-4xl text-[#eef1f6]"
          >
            Products in the empire
          </motion.h2>

          {/* Arrow controls */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scrollByCard("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              className="rounded-full border border-[#1b2436] p-2.5 text-[#a2adc4] transition-colors hover:border-[#4d8dff] hover:text-white disabled:opacity-30 disabled:hover:border-[#1b2436] disabled:hover:text-[#a2adc4]"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollByCard("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              className="rounded-full border border-[#1b2436] p-2.5 text-[#a2adc4] transition-colors hover:border-[#4d8dff] hover:text-white disabled:opacity-30 disabled:hover:border-[#1b2436] disabled:hover:text-[#a2adc4]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal scroll track — full width, snaps per card */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-6 pb-4 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-[calc((100vw-72rem)/2+1.5rem)]"
      >
        {featured.map((p, i) => (
          <motion.div
            key={p.slug}
            data-card
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              ease: "easeOut",
              delay: 0.15 + Math.min(i, 4) * 0.08,
            }}
            className="liquid-glass w-[85vw] max-w-[340px] flex-shrink-0 snap-start rounded-2xl bg-[#0b0f16]/60 backdrop-blur-md p-8 transition-all duration-300 hover:bg-[#0b0f16]/80"
          >
            <div className="flex items-center justify-between mb-4 gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#4d8dff]">
                {p.categoryLabel}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#7f93b8] shrink-0">
                {p.status === "live" ? "Live" : "Coming soon"}
              </span>
            </div>

            <h3 className="font-display font-bold text-2xl mb-3 text-[#eef1f6]">
              {p.name}
            </h3>
            <p className="text-[#a2adc4] leading-relaxed mb-6">
              {p.description}
            </p>

            <div className="flex items-center gap-6">
              <Link
                href={`/products/${p.slug}`}
                className="font-mono text-xs uppercase tracking-widest text-[#4d8dff] hover:text-[#7fa8ff] transition-colors"
              >
                Learn more
              </Link>
              {p.status === "live" && siteUrlFor(p) && (
                <a
                  href={siteUrlFor(p)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-widest text-[#7f93b8] hover:text-[#eef1f6] transition-colors"
                >
                  Visit site
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-8">
        <Link
          href="/products"
          className="font-mono text-xs uppercase tracking-widest text-[#7f93b8] hover:text-[#eef1f6] transition-colors"
        >
          View all products &rarr;
        </Link>
      </div>
    </section>
  );
}
