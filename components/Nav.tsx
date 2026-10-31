"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
  { label: "Company", href: "/#about" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "Innovation", href: "/innovation" },
  { label: "About", href: "/#about" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hash links (/#about) point at sections of the home page, so only
  // path-only links can be "active".
  const isActive = (href: string) =>
    !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#050505]/70 backdrop-blur-md border-b border-[#1b2436]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/yakimel-icon.png"
              alt="Yakimel Empire LLC"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-display text-sm font-bold tracking-wide text-[#eef1f6]">
              YAKIMEL EMPIRE
            </span>
          </Link>

          <ul className="hidden items-center gap-9 md:flex">
            {LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`border-b-2 py-1.5 font-mono text-xs uppercase tracking-widest transition-colors hover:text-[#eef1f6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4d8dff] ${
                      active
                        ? "border-[#4d8dff] text-[#4d8dff]"
                        : "border-transparent text-[#a2adc4]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/consultation"
            className="hidden rounded-full border border-[#2c3a52] px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-[#eef1f6] transition-colors hover:border-[#4d8dff] hover:bg-[#4d8dff]/10 md:inline-block"
          >
            Start a Project
          </Link>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex flex-col gap-1.5 md:hidden"
          >
            <span className="h-px w-6 bg-[#eef1f6]" />
            <span className="h-px w-6 bg-[#eef1f6]" />
          </button>
        </nav>
      </header>

      {/* Full-screen mobile nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex flex-col bg-[#050505] md:hidden"
          >
            <div className="flex items-center justify-between px-6 py-4">
              <Image
                src="/yakimel-icon.png"
                alt="Yakimel Empire LLC"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="relative h-6 w-6"
              >
                <span className="absolute left-0 top-1/2 h-px w-6 -translate-y-1/2 rotate-45 bg-[#eef1f6]" />
                <span className="absolute left-0 top-1/2 h-px w-6 -translate-y-1/2 -rotate-45 bg-[#eef1f6]" />
              </button>
            </div>

            <ul className="flex flex-1 flex-col items-start justify-center gap-2 px-8">
              {LINKS.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 * i, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`font-display text-4xl font-bold ${
                      isActive(link.href) ? "text-[#4d8dff]" : "text-[#eef1f6]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="px-8 pb-10">
              <Link
                href="/consultation"
                onClick={() => setMenuOpen(false)}
                className="block w-full rounded-full bg-[#e9edf5] px-8 py-4 text-center font-mono text-xs uppercase tracking-widest text-[#05070a]"
              >
                Start a Project
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
