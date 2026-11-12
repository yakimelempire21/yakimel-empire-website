"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Menu, Minus, Plus, ShoppingBag, X } from "lucide-react";
import type { CafeSite, MenuItem } from "@/lib/demo-sites";
import DemoShell from "./DemoShell";
import DemoPhoto, { PhotoContext } from "./DemoPhoto";
import { DemoMarquee, HeroSlider, PhotoWall, SplitHeadline, type Slide } from "./DemoSlider";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { DemoFooter, Eyebrow, Reviews, Stars, Visit, dButton, dField, dFocus, dGhost, heading, money, themeVars } from "./DemoParts";

const PICKUP = ["As soon as possible (~10 min)", "In 20 minutes", "In 30 minutes", "In 45 minutes", "In 1 hour"];

/** Café / drinks demo with order-ahead for pickup. */
export default function CafeDemo({ site, photos }: { site: CafeSite; photos: string[] }) {
  const have = useMemo(() => new Set(photos), [photos]);
  const h = heading(site);
  const [cat, setCat] = useState(site.menu[0].category);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [bagOpen, setBagOpen] = useState(false);
  const [placed, setPlaced] = useState<{ number: number; name: string; pickup: string } | null>(null);

  const items = site.menu.flatMap((c) => c.items);
  const lines = Object.entries(cart)
    .filter(([, q]) => q > 0)
    .map(([name, q]) => ({ item: items.find((i) => i.name === name)!, q }));
  const count = lines.reduce((n, l) => n + l.q, 0);
  const subtotal = lines.reduce((n, l) => n + l.q * l.item.price, 0);
  const tax = subtotal * 0.08875;

  // Two tagged favorites (new drink + house pastry) sit beside the hero photo.
  const featured = items.filter((i) => i.tag && i.photo).slice(-2);
  const pic = (i: MenuItem) => ({ src: `/demos/${site.slug}/${i.photo ?? "none.jpg"}`, alt: i.name });
  // With real photos: a full-screen slideshow of favorites (each slide can be added to the order).
  const slideItems = [items.find((i) => i.photo === "hero.jpg"), ...items.filter((i) => i.tag), ...items.filter((i) => ["Iced caramel latte", "Chokola", "Mango smoothie"].includes(i.name))]
    .filter((i): i is MenuItem => Boolean(i && i.photo && have.has(pic(i).src)))
    .filter((i, k, a) => a.indexOf(i) === k)
    .slice(0, 6);
  const slides: Slide[] = slideItems.map((i) => ({ photo: { src: pic(i).src, alt: `${i.name}${i.desc ? `: ${i.desc}` : ""}` } }));
  const modern = slides.length >= 3;
  const [slide, setSlide] = useState(0);
  const wall = [...site.gallery.map((p) => p.src), ...items.map((i) => pic(i).src)]
    .filter((src, k, a) => have.has(src) && a.indexOf(src) === k)
    .slice(0, 8)
    .map((src) => ({ src, alt: site.gallery.find((g) => g.src === src)?.alt ?? items.find((i) => pic(i).src === src)?.name ?? "" }));
  const add = (i: MenuItem, d = 1) => setCart((c) => ({ ...c, [i.name]: Math.max(0, (c[i.name] ?? 0) + d) }));
  const nav = [
    { label: "Menu", href: "#menu" },
    { label: "Gallery", href: "#gallery" },
    { label: "Reviews", href: "#reviews" },
    { label: "Visit", href: "#visit" },
  ];

  const bag = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--d-ink)]/10 px-5 py-4">
        <p className={`text-xl ${h}`}>Your order</p>
        <button type="button" onClick={() => setBagOpen(false)} aria-label="Close order" className={`rounded-full p-1.5 lg:hidden ${dFocus}`}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      {placed ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--d-accent)] text-[var(--d-accent-ink)]">
            <Check size={28} aria-hidden="true" />
          </span>
          <p className={`mt-4 text-2xl ${h}`}>Order #{placed.number} received!</p>
          <p className="mt-2 text-sm text-[var(--d-muted)]">
            Thanks {placed.name}. Pickup: {placed.pickup.toLowerCase()}. We&apos;ll send you a WhatsApp message when it&apos;s ready.
          </p>
          <p className="mt-6 text-xs text-[var(--d-muted)]">Demo only: nothing was ordered or charged.</p>
          <button
            type="button"
            onClick={() => {
              setPlaced(null);
              setCart({});
            }}
            className={`${dGhost} mt-6`}
          >
            New order
          </button>
        </div>
      ) : lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center text-[var(--d-muted)]">
          <ShoppingBag size={36} aria-hidden="true" />
          <p className="mt-3 text-sm">Your order is empty. Add something from the menu.</p>
        </div>
      ) : (
        <form
          className="flex flex-1 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setPlaced({ number: 1000 + Math.floor(Math.random() * 900), name: String(f.get("name")).split(" ")[0], pickup: String(f.get("pickup")) });
          }}
        >
          <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {lines.map(({ item, q }) => (
              <li key={item.name} className="flex items-center justify-between gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                  <DemoPhoto photo={pic(item)} tone={site.theme.soft} ink={site.theme.ink} label={false} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-sm text-[var(--d-muted)]">{money(item.price * q)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => add(item, -1)} aria-label={`Remove one ${item.name}`} className={`flex h-8 w-8 items-center justify-center rounded-full border border-[var(--d-ink)]/15 ${dFocus}`}>
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold" aria-label={`${q} in order`}>
                    {q}
                  </span>
                  <button type="button" onClick={() => add(item)} aria-label={`Add one ${item.name}`} className={`flex h-8 w-8 items-center justify-center rounded-full border border-[var(--d-ink)]/15 ${dFocus}`}>
                    <Plus size={14} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="space-y-3 border-t border-[var(--d-ink)]/10 px-5 py-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--d-muted)]">Pickup</span>
              <select name="pickup" className={dField}>
                {PICKUP.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--d-muted)]">Name</span>
              <input name="name" required placeholder="Name for the order" className={dField} autoComplete="off" />
            </label>
            <dl className="space-y-1 pt-1 text-sm">
              <div className="flex justify-between text-[var(--d-muted)]">
                <dt>Subtotal</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-[var(--d-muted)]">
                <dt>Tax</dt>
                <dd>{money(Math.round(tax * 100) / 100)}</dd>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <dt>Total</dt>
                <dd>{money(Math.round((subtotal + tax) * 100) / 100)}</dd>
              </div>
            </dl>
            <button type="submit" className={`${dButton} w-full`}>
              Place order · pay at pickup
            </button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <PhotoContext.Provider value={have}>
      <DemoShell name={site.name} service={site.pkg} chat={site.chat}>
        <div style={themeVars(site)} className="bg-[var(--d-bg)] text-[var(--d-ink)]">
          <header className="sticky top-11 z-50 border-b border-[var(--d-ink)]/10 bg-[var(--d-bg)]/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
              <a href="#top" className={`text-2xl ${h} ${dFocus}`}>
                {site.name}
              </a>
              <div className="flex items-center gap-2">
                <nav aria-label={`${site.name} menu`} className="mr-4 hidden items-center gap-7 text-sm font-medium md:flex">
                  {nav.map((n) => (
                    <a key={n.href} href={n.href} className={`text-[var(--d-muted)] hover:text-[var(--d-ink)] ${dFocus}`}>
                      {n.label}
                    </a>
                  ))}
                </nav>
                <button type="button" onClick={() => setBagOpen(true)} className={`${dButton} px-4 py-2.5`} aria-label={`Open order, ${count} items`}>
                  <ShoppingBag size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">Order</span>
                  {count > 0 && <span className="rounded-full bg-white/25 px-2 text-xs">{count}</span>}
                </button>
                <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label="Menu" className={`rounded-full p-2 md:hidden ${dFocus}`}>
                  {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
                </button>
              </div>
            </div>
            {menuOpen && (
              <nav aria-label={`${site.name} mobile menu`} className="border-t border-[var(--d-ink)]/10 px-6 py-4 md:hidden">
                {nav.map((n) => (
                  <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="block py-2.5 text-base font-medium">
                    {n.label}
                  </a>
                ))}
              </nav>
            )}
          </header>

          {/* Hero */}
          {modern ? (
            <section id="top" className="relative h-[calc(100svh-7.5rem)] min-h-[580px] max-h-[860px] text-white">
              <HeroSlider slides={slides} onSlide={setSlide}>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#1b0f08]/90 via-[#1b0f08]/35 to-transparent" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-[#1b0f08]/60 to-transparent" />
              </HeroSlider>
              <div className="pointer-events-none relative z-20 mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-24 md:pb-28">
                <div className="flex flex-wrap items-end justify-between gap-8">
                  <div className="pointer-events-auto max-w-2xl">
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-xs font-semibold uppercase tracking-[0.28em] text-[#F3C9A8]">
                      {site.businessType} · Brooklyn
                    </motion.p>
                    <SplitHeadline text={site.tagline} className={`mt-4 text-[2.9rem] leading-[1] md:text-7xl ${h}`} />
                    <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="mt-5 max-w-lg text-base leading-relaxed text-white/85 md:text-lg">
                      {site.intro}
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.65 }} className="mt-7 flex flex-wrap items-center gap-3">
                      <a href="#menu" className={dButton}>
                        Order ahead <ArrowRight size={16} aria-hidden="true" />
                      </a>
                      <span className="ml-1 hidden items-center gap-2 text-sm text-white/85 sm:flex">
                        <Stars /> <strong className="text-white">4.8</strong> · 410 reviews
                      </span>
                    </motion.div>
                  </div>
                  <div className="pointer-events-auto hidden min-w-[250px] lg:block">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={slideItems[slide]?.name}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.45 }}
                        className="flex items-center gap-4 rounded-2xl bg-white/90 p-3 pr-4 text-[var(--d-ink)] shadow-xl backdrop-blur"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                          <DemoPhoto photo={pic(slideItems[slide])} tone={site.theme.soft} ink={site.theme.ink} label={false} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--d-accent)]">On the menu</p>
                          <p className="truncate font-semibold">{slideItems[slide]?.name}</p>
                          <p className="text-sm text-[var(--d-muted)]">{money(slideItems[slide]?.price ?? 0)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            add(slideItems[slide]);
                            setPlaced(null);
                          }}
                          aria-label={`Add ${slideItems[slide]?.name} to order`}
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--d-accent)] text-[var(--d-accent-ink)] transition hover:brightness-110 ${dFocus}`}
                        >
                          <Plus size={18} aria-hidden="true" />
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </section>
          ) : (
          <section id="top" className="relative overflow-hidden px-6 pb-16 pt-10 md:pb-20 md:pt-14">
            <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[var(--d-soft)] blur-3xl" />
            <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1fr_1.05fr]">
              <div>
                <Eyebrow>{site.businessType} · Brooklyn</Eyebrow>
                <h1 className={`mt-4 text-[2.7rem] leading-[1.03] md:text-[4.2rem] ${h}`}>{site.tagline}</h1>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-[var(--d-muted)]">{site.intro}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#menu" className={dButton}>
                    Order ahead <ArrowRight size={16} aria-hidden="true" />
                  </a>
                  <a href="#visit" className={dGhost}>
                    Hours & location
                  </a>
                </div>
                <div className="mt-8 flex items-center gap-3 text-sm text-[var(--d-muted)]">
                  <Stars />
                  <span>
                    <strong className="text-[var(--d-ink)]">4.8</strong> · 410 Google reviews
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-[1.35fr_1fr] gap-3 md:gap-4">
                <div className="row-span-2 overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(43,26,16,0.55)]">
                  <DemoPhoto photo={site.hero} tone={site.theme.soft} ink={site.theme.ink} priority className="aspect-[3/4] h-full" />
                </div>
                <div className="aspect-square overflow-hidden rounded-[1.5rem]">
                  <DemoPhoto photo={pic(featured[0])} tone={site.theme.soft} ink={site.theme.ink} priority />
                </div>
                <div className="relative aspect-square overflow-hidden rounded-[1.5rem]">
                  <DemoPhoto photo={pic(featured[1])} tone={site.theme.soft} ink={site.theme.ink} priority />
                  <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--d-ink)] shadow">Fresh daily</span>
                </div>
              </div>
            </div>
          </section>
          )}

          {modern && (
            <DemoMarquee
              items={items.map((i) => i.name)}
              className={`border-y border-[var(--d-ink)]/10 bg-[var(--d-soft)] py-5 text-2xl md:py-7 md:text-4xl ${h}`}
            />
          )}

          {/* Menu + order */}
          <section id="menu" className="scroll-mt-28 px-6 py-20">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_340px]">
              <div>
                <Eyebrow>Menu</Eyebrow>
                <h2 className={`mt-2 text-3xl md:text-4xl ${h}`}>Order ahead, skip the line</h2>
                <div role="tablist" aria-label="Menu categories" className="mt-8 flex flex-wrap gap-2">
                  {site.menu.map((c) => (
                    <button
                      key={c.category}
                      role="tab"
                      type="button"
                      aria-selected={cat === c.category}
                      onClick={() => setCat(c.category)}
                      className={`rounded-full px-5 py-2 text-sm font-semibold transition ${dFocus} ${
                        cat === c.category ? "bg-[var(--d-ink)] text-white" : "bg-[var(--d-soft)] hover:brightness-95"
                      }`}
                    >
                      {c.category}
                    </button>
                  ))}
                </div>
                <RevealGroup key={cat} className="mt-8 grid gap-4 sm:grid-cols-2" stagger={0.06}>
                  {site.menu
                    .find((c) => c.category === cat)!
                    .items.map((i) => (
                      <RevealItem key={i.name} className="group flex flex-col overflow-hidden rounded-2xl bg-[var(--d-surface)] shadow-[0_10px_30px_-24px_rgba(0,0,0,0.4)]">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <DemoPhoto photo={pic(i)} tone={site.theme.soft} ink={site.theme.ink} label={false} className="transition duration-500 group-hover:scale-105" />
                          {i.tag && <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[var(--d-accent)] shadow">{i.tag}</span>}
                        </div>
                        <div className="flex flex-1 items-start justify-between gap-4 p-5">
                          <div className="min-w-0">
                            <p className="font-semibold">{i.name}</p>
                            {i.desc && <p className="mt-1 text-sm text-[var(--d-muted)]">{i.desc}</p>}
                            <p className="mt-2 font-semibold text-[var(--d-accent)]">{money(i.price)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              add(i);
                              setPlaced(null);
                            }}
                            aria-label={`Add ${i.name} to order`}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--d-accent)] text-[var(--d-accent-ink)] transition hover:brightness-110 ${dFocus}`}
                          >
                            <Plus size={18} aria-hidden="true" />
                          </button>
                        </div>
                      </RevealItem>
                    ))}
                </RevealGroup>
              </div>
              <aside aria-label="Your order" className="sticky top-32 hidden h-fit max-h-[calc(100vh-9rem)] overflow-hidden rounded-3xl bg-[var(--d-surface)] shadow-[0_24px_60px_-34px_rgba(0,0,0,0.45)] lg:flex lg:flex-col">
                {bag}
              </aside>
            </div>
          </section>

          {/* Mobile order bar + drawer */}
          {count > 0 && !bagOpen && (
            <button
              type="button"
              onClick={() => setBagOpen(true)}
              className={`fixed bottom-24 left-1/2 z-[65] flex -translate-x-1/2 items-center gap-3 rounded-full bg-[var(--d-ink)] px-6 py-3.5 text-sm font-semibold text-white shadow-xl lg:hidden ${dFocus}`}
            >
              <ShoppingBag size={16} aria-hidden="true" /> View order · {count} · {money(Math.round(subtotal * 100) / 100)}
            </button>
          )}
          {bagOpen && (
            <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Your order">
              <button type="button" aria-label="Close order" className="absolute inset-0 bg-black/40" onClick={() => setBagOpen(false)} />
              <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-hidden rounded-t-3xl bg-[var(--d-surface)]">{bag}</div>
            </div>
          )}

          {/* Gallery */}
          <section id="gallery" className="scroll-mt-28 bg-[var(--d-surface)] px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <Reveal>
                <Eyebrow>Gallery</Eyebrow>
                <h2 className={`mt-2 text-3xl md:text-5xl ${h}`}>Made fresh every day</h2>
              </Reveal>
              {wall.length > 4 ? (
                <div className="mt-10">
                  <PhotoWall photos={wall} />
                </div>
              ) : (
                <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                  {site.gallery.map((p, i) => (
                    <div key={p.src} className="aspect-[4/5] overflow-hidden rounded-2xl">
                      <DemoPhoto photo={p} tone={i % 2 ? site.theme.soft : "#EAD7C3"} ink={site.theme.ink} />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl bg-[var(--d-soft)] p-7 md:flex-row md:items-center">
                <div>
                  <p className={`text-2xl ${h}`}>Coffee for your office or event</p>
                  <p className="mt-1 text-[var(--d-muted)]">Coffee boxes and pastry trays for 10 to 100 people.</p>
                </div>
                <a href="#visit" className={dButton}>
                  Ask about catering
                </a>
              </div>
            </div>
          </section>

          <Reviews site={site} />
          <Visit site={site} />
          <DemoFooter site={site} />
        </div>
      </DemoShell>
    </PhotoContext.Provider>
  );
}
