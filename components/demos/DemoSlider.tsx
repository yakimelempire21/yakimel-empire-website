"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo } from "@/lib/demo-sites";

const ease = [0.22, 1, 0.36, 1] as const;

export type Slide = { photo: Photo; title?: string; meta?: string };

/** Swipe left/right on touch screens (and drag with a mouse). */
function useSwipe(onPrev: () => void, onNext: () => void) {
  const start = useRef<number | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      start.current = e.clientX;
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (start.current === null) return;
      const dx = e.clientX - start.current;
      start.current = null;
      if (Math.abs(dx) > 50) (dx > 0 ? onPrev : onNext)();
    },
  };
}

/**
 * Full-bleed photo slideshow: slow cross-fade with a gentle zoom, progress bars,
 * arrows and swipe. Pauses on hover and while the tab is hidden.
 */
export function HeroSlider({
  slides,
  interval = 5500,
  children,
  onSlide,
}: {
  slides: Slide[];
  interval?: number;
  children?: React.ReactNode;
  onSlide?: (i: number) => void;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const go = useCallback(
    (to: number) => {
      const next = (to + n) % n;
      setI(next);
      onSlide?.(next);
    },
    [n, onSlide],
  );

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => go(i + 1), interval);
    return () => clearTimeout(t);
  }, [i, paused, n, interval, go]);

  useEffect(() => {
    const vis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, []);

  const swipe = useSwipe(
    () => go(i - 1),
    () => go(i + 1),
  );
  const s = slides[i];

  return (
    <div
      className="absolute inset-0 touch-pan-y select-none overflow-hidden bg-black"
      role="region"
      aria-roledescription="carousel"
      aria-label="Photos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      {...swipe}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={s.photo.src}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1.02, transition: { opacity: { duration: 1.2, ease }, scale: { duration: interval / 1000 + 1.5, ease: "linear" } } }}
          exit={{ opacity: 0, transition: { duration: 1.2, ease } }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.photo.src} alt={s.photo.alt} draggable={false} className="h-full w-full object-cover" />
        </motion.div>
      </AnimatePresence>

      {children}

      {n > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-6">
          <div className="mx-auto flex max-w-6xl items-center gap-4">
            <div className="flex min-w-0 max-w-sm flex-1 items-center gap-3">
              <span className="font-mono text-xs tabular-nums text-white/80">
                {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </span>
              <div className="flex max-w-xs flex-1 gap-1.5">
                {slides.map((x, k) => (
                  <button
                    key={x.photo.src}
                    type="button"
                    onClick={() => go(k)}
                    aria-label={`Show photo ${k + 1}: ${x.photo.alt}`}
                    aria-current={k === i}
                    className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/30"
                  >
                    {k < i && <span className="absolute inset-0 bg-white" />}
                    {k === i && (
                      <motion.span
                        key={`${i}-${paused}`}
                        className="absolute inset-y-0 left-0 bg-white"
                        initial={{ width: paused ? "100%" : "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: paused ? 0 : interval / 1000, ease: "linear" }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden shrink-0 gap-2 sm:flex">
              {[
                { label: "Previous photo", icon: ChevronLeft, to: i - 1 },
                { label: "Next photo", icon: ChevronRight, to: i + 1 },
              ].map(({ label, icon: Icon, to }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(to)}
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Icon size={20} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {s.photo.alt}
      </p>
    </div>
  );
}

/** Big headline whose words rise into place one after another. */
export function SplitHeadline({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <h1 className={className} aria-label={text}>
      {words.map((w, k) => (
        <span key={k} aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.9, ease, delay: 0.15 + k * 0.07 }}
          >
            {w}
          </motion.span>
          {k < words.length - 1 && <span className="inline-block w-[0.26em]" />}
        </span>
      ))}
    </h1>
  );
}

/** Endless strip of words in the demo's colors. */
export function DemoMarquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((t) => (
        <li key={t} className="flex items-center gap-10 whitespace-nowrap">
          <span>{t}</span>
          <span aria-hidden="true" className="text-[0.6em] text-[var(--d-accent)]">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`marquee relative overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/** Masonry photo wall; tapping a photo opens it full screen with prev/next and swipe. */
export function PhotoWall({ photos, columns = "columns-2 md:columns-3 lg:columns-4" }: { photos: Photo[]; columns?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const n = photos.length;
  const close = () => setOpen(null);
  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + n) % n)), [n]);
  const swipe = useSwipe(
    () => step(-1),
    () => step(1),
  );

  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", key);
    };
  }, [open, step]);

  return (
    <>
      <div className={`${columns} gap-3 md:gap-4`}>
        {photos.map((p, k) => (
          <motion.button
            key={p.src}
            type="button"
            onClick={() => setOpen(k)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.7, ease, delay: (k % 4) * 0.08 }}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl md:mb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--d-accent)]"
            aria-label={`Open photo: ${p.alt}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt={p.alt} loading="lazy" className="h-auto w-full transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 pb-3 pt-10 text-left text-xs font-medium text-white md:translate-y-2 md:opacity-0 md:transition md:group-hover:translate-y-0 md:group-hover:opacity-100">
              {p.alt}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={photos[open].alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <div className="relative flex max-h-full w-full max-w-4xl flex-col items-center touch-pan-y" onClick={(e) => e.stopPropagation()} {...swipe}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={photos[open].src}
                  src={photos[open].src}
                  alt={photos[open].alt}
                  draggable={false}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="max-h-[78vh] w-auto rounded-2xl object-contain"
                />
              </AnimatePresence>
              <p className="mt-4 text-center text-sm text-white/85">
                {photos[open].alt} <span className="text-white/50">· {open + 1} / {n}</span>
              </p>
            </div>
            {[
              { label: "Previous photo", icon: ChevronLeft, d: -1, pos: "left-3 md:left-6" },
              { label: "Next photo", icon: ChevronRight, d: 1, pos: "right-3 md:right-6" },
            ].map(({ label, icon: Icon, d, pos }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={(e) => {
                  e.stopPropagation();
                  step(d);
                }}
                className={`absolute top-1/2 ${pos} flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30`}
              >
                <Icon size={22} aria-hidden="true" />
              </button>
            ))}
            <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30">
              <X size={20} aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
