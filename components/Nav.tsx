"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bot, ChevronDown, Globe, Menu, ShoppingBag, Smartphone, X } from "lucide-react";
import { NAV_LINKS, whatsappUrl } from "@/lib/site";
import { consultationHref } from "@/lib/services";

const SERVICES = [
  { icon: Globe, title: "Business Websites", body: "Fast, mobile-first sites from $699", href: "/services" },
  { icon: ShoppingBag, title: "Shopify Stores", body: "New stores and full rebuilds", href: "/pricing" },
  { icon: Bot, title: "WhatsApp AI Assistant", body: "Answers your customers 24/7", href: "/products/whatsapp-ai-assistant" },
  { icon: Smartphone, title: "Apps & AI Development", body: "Custom apps, dashboards, automation", href: consultationHref("App & AI Development") },
];

const WA_ICON =
  "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.38 9.38 0 0 1-1.44-5c0-5.19 4.23-9.42 9.43-9.42 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.42 9.42zm8.02-17.44A11.27 11.27 0 0 0 12.05.75C5.8.75.71 5.84.71 12.09c0 2 .52 3.95 1.52 5.66L.62 23.62l6.01-1.58a11.3 11.3 0 0 0 5.41 1.38h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02z";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4d8dff]";

function Logo() {
  return (
    <Link href="/" className={`flex items-center gap-3 rounded-lg ${focus}`} aria-label="Yakimel Empire — home">
      <Image src="/yakimel-icon.png" alt="" width={44} height={44} priority className="h-10 w-10 object-contain md:h-11 md:w-11" />
      <span className="leading-none">
        <span className="block font-display text-[17px] font-semibold tracking-tight text-white md:text-lg">Yakimel Empire</span>
        <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.22em] text-[#8f9bb8]">Web · Apps · AI</span>
      </span>
    </Link>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const wa = whatsappUrl("Hi Yakimel Empire, I'd like to talk about a project.");

  // Hash links (/#about) point at sections of the home page, so only path-only links can be "active".
  const isActive = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open; Escape closes menus.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setServicesOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const openServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const closeServicesSoon = () => {
    closeTimer.current = setTimeout(() => setServicesOpen(false), 120);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-white/[0.08] bg-[#05070d]/80 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl" : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 md:px-10 ${scrolled ? "py-3" : "py-5"}`}>
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              if (link.href === "/services") {
                return (
                  <li key={link.label} className="relative" onMouseEnter={openServices} onMouseLeave={closeServicesSoon}>
                    <button
                      type="button"
                      aria-expanded={servicesOpen}
                      aria-haspopup="true"
                      onClick={() => setServicesOpen((v) => !v)}
                      className={`flex items-center gap-1 rounded-lg px-3.5 py-2 text-[15px] font-medium transition-colors hover:text-white ${focus} ${
                        active || servicesOpen ? "text-white" : "text-[#c3cbe0]"
                      }`}
                    >
                      {link.label}
                      <ChevronDown size={15} aria-hidden="true" className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {servicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                          className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3"
                        >
                          <div className="rounded-2xl border border-white/10 bg-[#0a0f1c]/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
                            <ul className="grid grid-cols-2 gap-1">
                              {SERVICES.map((s) => (
                                <li key={s.title}>
                                  <Link
                                    href={s.href}
                                    onClick={() => setServicesOpen(false)}
                                    className={`flex gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.06] ${focus}`}
                                  >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4d8dff]/15 text-[#8fb3ff]">
                                      <s.icon size={19} aria-hidden="true" />
                                    </span>
                                    <span>
                                      <span className="block text-sm font-semibold text-white">{s.title}</span>
                                      <span className="mt-0.5 block text-xs text-[#8f9bb8]">{s.body}</span>
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <Link
                              href="/services"
                              onClick={() => setServicesOpen(false)}
                              className={`mt-2 flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] ${focus}`}
                            >
                              All services &amp; prices <ArrowRight size={15} aria-hidden="true" />
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              }
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative block rounded-lg px-3.5 py-2 text-[15px] font-medium transition-colors hover:text-white ${focus} ${
                      active ? "text-white after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#4d8dff]" : "text-[#c3cbe0]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp (opens in a new tab)"
                className={`flex h-11 w-11 items-center justify-center rounded-full text-[#c3cbe0] transition-colors hover:bg-white/[0.06] hover:text-[#25D366] ${focus}`}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d={WA_ICON} />
                </svg>
              </a>
            )}
            <Link
              href="/consultation"
              className={`rounded-full bg-[#4d8dff] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(77,141,255,0.9)] transition-all hover:-translate-y-0.5 hover:bg-[#3a7ae8] ${focus}`}
            >
              Book a free call
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className={`flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/[0.06] lg:hidden ${focus}`}
          >
            <Menu size={24} aria-hidden="true" />
          </button>
        </nav>
      </header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[#05070d] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className={`flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/[0.06] ${focus}`}
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>

            <ul className="flex-1 px-6 pt-4">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 * i }}
                  className="border-b border-white/[0.07]"
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`flex items-center justify-between py-4 font-display text-2xl font-semibold ${isActive(link.href) ? "text-[#4d8dff]" : "text-white"}`}
                  >
                    {link.label}
                    <ArrowRight size={20} aria-hidden="true" className="text-[#5d6b86]" />
                  </Link>
                  {link.href === "/services" && (
                    <ul className="-mt-1 grid grid-cols-2 gap-2 pb-4">
                      {SERVICES.map((s) => (
                        <li key={s.title}>
                          <Link
                            href={s.href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm text-[#c3cbe0]"
                          >
                            <s.icon size={16} aria-hidden="true" className="shrink-0 text-[#8fb3ff]" />
                            {s.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.li>
              ))}
            </ul>

            <div className="space-y-3 px-6 pb-10 pt-6">
              <Link
                href="/consultation"
                onClick={() => setMenuOpen(false)}
                className="block w-full rounded-full bg-[#4d8dff] px-8 py-4 text-center font-semibold text-white"
              >
                Book a free call
              </Link>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-4 font-semibold text-white"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366" aria-hidden="true">
                    <path d={WA_ICON} />
                  </svg>
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
