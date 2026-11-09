"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth, eased scrolling for the public site (not the Command Center, which
 * renders outside <ChromeGate>). Off for people who prefer reduced motion and
 * on touch screens, which already scroll smoothly.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || touch) return;

    const lenis = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3), anchors: { offset: -80 } });
    let frame = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
  return null;
}
