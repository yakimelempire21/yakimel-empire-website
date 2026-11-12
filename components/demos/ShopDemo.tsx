"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Lock, Minus, Plus, ShoppingBag, Truck, X } from "lucide-react";
import type { Product, StoreSite } from "@/lib/demo-sites";
import DemoShell from "./DemoShell";
import DemoPhoto, { PhotoContext } from "./DemoPhoto";
import { DemoFooter, Eyebrow, Reviews, Stars, Visit, dButton, dField, dFocus, heading, money, themeVars } from "./DemoParts";

type View = "cart" | "checkout" | "done";

/** Shopify-style online store demo: catalog, product view, cart and checkout. */
export default function ShopDemo({ site, photos }: { site: StoreSite; photos: string[] }) {
  const have = useMemo(() => new Set(photos), [photos]);
  const h = heading(site);
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [drawer, setDrawer] = useState(false);
  const [view, setView] = useState<View>("cart");
  const [orderNo, setOrderNo] = useState(0);

  const shown = site.products.filter((p) => cat === "All" || p.category === cat);
  const lines = Object.entries(cart)
    .filter(([, q]) => q > 0)
    .map(([id, q]) => ({ p: site.products.find((x) => x.id === id)!, q }));
  const count = lines.reduce((n, l) => n + l.q, 0);
  const subtotal = lines.reduce((n, l) => n + l.q * l.p.price, 0);
  const left = Math.max(0, site.freeShipping - subtotal);
  const shipping = subtotal === 0 || left === 0 ? 0 : 6.95;
  const pic = (p: Product) => ({ src: `/demos/${site.slug}/${p.id}.jpg`, alt: p.name });

  const put = (id: string, d: number) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + d) }));

  useEffect(() => {
    const busy = Boolean(open) || drawer;
    document.body.style.overflow = busy ? "hidden" : "";
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setDrawer(false);
      }
    };
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, [open, drawer]);

  return (
    <PhotoContext.Provider value={have}>
      <DemoShell name={site.name} service={site.pkg} chat={site.chat}>
        <div style={themeVars(site)} className="bg-[var(--d-bg)] text-[var(--d-ink)]">
          <p className="bg-[var(--d-ink)] px-4 py-2 text-center text-xs font-medium tracking-wide text-white">
            Free shipping on orders over {money(site.freeShipping)} · US & Canada
          </p>
          <header className="sticky top-11 z-50 border-b border-[var(--d-ink)]/10 bg-[var(--d-bg)]/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
              <a href="#top" className={`text-2xl ${h} ${dFocus}`}>
                {site.name}
              </a>
              <nav aria-label={`${site.name} menu`} className="hidden items-center gap-7 text-sm font-medium md:flex">
                {site.categories.slice(1).map((c) => (
                  <a
                    key={c}
                    href="#shop"
                    onClick={() => setCat(c)}
                    className={`text-[var(--d-muted)] hover:text-[var(--d-ink)] ${dFocus}`}
                  >
                    {c}
                  </a>
                ))}
                <a href="#reviews" className={`text-[var(--d-muted)] hover:text-[var(--d-ink)] ${dFocus}`}>
                  Reviews
                </a>
              </nav>
              <button
                type="button"
                onClick={() => {
                  setView("cart");
                  setDrawer(true);
                }}
                aria-label={`Open cart, ${count} items`}
                className={`relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--d-soft)] ${dFocus}`}
              >
                <ShoppingBag size={22} aria-hidden="true" />
                {count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--d-ink)] px-1 text-[11px] font-bold text-white">{count}</span>
                )}
              </button>
            </div>
          </header>

          {/* Hero */}
          <section id="top" className="px-6 pb-14 pt-10 md:pt-14">
            <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
              <div>
                <Eyebrow>New: Glow Vitamin C Serum</Eyebrow>
                <h1 className={`mt-4 text-[2.7rem] leading-[1.03] md:text-6xl ${h}`}>{site.tagline}</h1>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--d-muted)]">{site.intro}</p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a href="#shop" className={dButton}>
                    Shop now <ArrowRight size={16} aria-hidden="true" />
                  </a>
                  <span className="flex items-center gap-2 text-sm text-[var(--d-muted)]">
                    <Stars /> 2,100+ happy customers
                  </span>
                </div>
              </div>
              <div className="aspect-[5/4] overflow-hidden rounded-[2rem]">
                <DemoPhoto photo={site.hero} tone={site.theme.soft} ink={site.theme.ink} priority />
              </div>
            </div>
          </section>

          {/* Catalog */}
          <section id="shop" className="scroll-mt-28 px-6 py-16">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <Eyebrow>Shop</Eyebrow>
                  <h2 className={`mt-2 text-3xl md:text-4xl ${h}`}>Best sellers</h2>
                </div>
                <div role="tablist" aria-label="Categories" className="flex flex-wrap gap-2">
                  {site.categories.map((c) => (
                    <button
                      key={c}
                      role="tab"
                      type="button"
                      aria-selected={cat === c}
                      onClick={() => setCat(c)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${dFocus} ${cat === c ? "bg-[var(--d-ink)] text-white" : "bg-[var(--d-soft)] hover:brightness-95"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
                {shown.map((p) => (
                  <li key={p.id} className="group">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(p);
                        setQty(1);
                      }}
                      className={`block w-full text-left ${dFocus}`}
                    >
                      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--d-surface)] transition group-hover:shadow-lg">
                        <DemoPhoto photo={pic(p)} tone={p.tone} ink={site.theme.ink} label={false} className="transition duration-500 group-hover:scale-105" />
                      </div>
                      <p className="mt-3 text-[15px] font-semibold leading-snug">{p.name}</p>
                      <p className="mt-1 text-sm text-[var(--d-muted)]">{money(p.price)}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => put(p.id, 1)}
                      className={`mt-3 w-full rounded-full border border-[var(--d-ink)]/20 py-2 text-sm font-semibold transition hover:bg-[var(--d-ink)] hover:text-white ${dFocus}`}
                    >
                      {cart[p.id] ? `In cart (${cart[p.id]}) · add one` : "Add to cart"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="bg-[var(--d-soft)] px-6 py-12">
            <ul className="mx-auto grid max-w-6xl gap-6 text-center text-sm sm:grid-cols-3">
              {[
                ["Free shipping over $50", "US & Canada, 2–5 business days"],
                ["30-day returns", "Not happy? We'll make it right"],
                ["Secure checkout", "Cards, Apple Pay, Google Pay, Shop Pay"],
              ].map(([t, d]) => (
                <li key={t}>
                  <p className="font-semibold">{t}</p>
                  <p className="mt-1 text-[var(--d-muted)]">{d}</p>
                </li>
              ))}
            </ul>
          </section>

          <Reviews site={site} />
          <Visit site={site} />
          <DemoFooter site={site} />

          {/* Product quick view */}
          {open && (
            <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={open.name}>
              <button type="button" aria-label="Close" className="absolute inset-0 bg-black/45" onClick={() => setOpen(null)} />
              <div className="relative grid max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-[var(--d-surface)] sm:grid-cols-2 sm:rounded-3xl">
                <div className="aspect-square sm:aspect-auto">
                  <DemoPhoto photo={pic(open)} tone={open.tone} ink={site.theme.ink} label={false} />
                </div>
                <div className="p-6 md:p-8">
                  <button type="button" onClick={() => setOpen(null)} aria-label="Close" className={`absolute right-4 top-4 rounded-full bg-white/80 p-2 ${dFocus}`}>
                    <X size={18} aria-hidden="true" />
                  </button>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--d-muted)]">{open.category}</p>
                  <h3 className={`mt-2 text-3xl ${h}`}>{open.name}</h3>
                  <p className="mt-2 text-xl">{money(open.price)}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-[var(--d-muted)]">
                    <Stars size={13} /> 4.9 (312 reviews)
                  </div>
                  <p className="mt-5 leading-relaxed text-[var(--d-muted)]">{open.desc} Made in small batches with clean, plant-based ingredients. Cruelty-free.</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-[var(--d-ink)]/15">
                      <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Less" className={`p-3 ${dFocus}`}>
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <span className="w-6 text-center font-semibold" aria-live="polite">
                        {qty}
                      </span>
                      <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="More" className={`p-3 ${dFocus}`}>
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        put(open.id, qty);
                        setOpen(null);
                        setView("cart");
                        setDrawer(true);
                      }}
                      className={`${dButton} flex-1`}
                    >
                      Add to cart · {money(open.price * qty)}
                    </button>
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-sm text-[var(--d-muted)]">
                    <Truck size={16} aria-hidden="true" /> Ships in 1 business day
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cart drawer + checkout */}
          {drawer && (
            <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={view === "cart" ? "Cart" : "Checkout"}>
              <button type="button" aria-label="Close cart" className="absolute inset-0 bg-black/45" onClick={() => setDrawer(false)} />
              <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[var(--d-surface)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[var(--d-ink)]/10 px-6 py-4">
                  <p className={`text-xl ${h}`}>{view === "checkout" ? "Checkout" : view === "done" ? "Thank you!" : `Your cart (${count})`}</p>
                  <button type="button" onClick={() => setDrawer(false)} aria-label="Close cart" className={`rounded-full p-1.5 ${dFocus}`}>
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>

                {view === "done" ? (
                  <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--d-ink)] text-white">
                      <Check size={28} aria-hidden="true" />
                    </span>
                    <p className={`mt-4 text-2xl ${h}`}>Order #{orderNo} confirmed</p>
                    <p className="mt-2 text-sm text-[var(--d-muted)]">A confirmation and tracking link are on their way by email and WhatsApp.</p>
                    <p className="mt-6 text-xs text-[var(--d-muted)]">Demo only: nothing was charged or shipped.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setCart({});
                        setView("cart");
                        setDrawer(false);
                      }}
                      className={`${dButton} mt-6`}
                    >
                      Keep shopping
                    </button>
                  </div>
                ) : lines.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center px-8 text-center text-[var(--d-muted)]">
                    <ShoppingBag size={36} aria-hidden="true" />
                    <p className="mt-3">Your cart is empty.</p>
                  </div>
                ) : view === "cart" ? (
                  <>
                    <div className="border-b border-[var(--d-ink)]/10 px-6 py-4">
                      <p className="text-sm">{left > 0 ? `You're ${money(Math.round(left * 100) / 100)} away from free shipping` : "🎉 You've got free shipping!"}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--d-soft)]">
                        <div className="h-full rounded-full bg-[var(--d-ink)] transition-all" style={{ width: `${Math.min(100, (subtotal / site.freeShipping) * 100)}%` }} />
                      </div>
                    </div>
                    <ul className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                      {lines.map(({ p, q }) => (
                        <li key={p.id} className="flex gap-4">
                          <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl">
                            <DemoPhoto photo={pic(p)} tone={p.tone} ink={site.theme.ink} label={false} />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <p className="truncate text-sm font-semibold">{p.name}</p>
                            <p className="text-sm text-[var(--d-muted)]">{money(p.price)}</p>
                            <div className="mt-auto flex items-center gap-2">
                              <button type="button" onClick={() => put(p.id, -1)} aria-label={`Remove one ${p.name}`} className={`flex h-7 w-7 items-center justify-center rounded-full border border-[var(--d-ink)]/15 ${dFocus}`}>
                                <Minus size={12} aria-hidden="true" />
                              </button>
                              <span className="w-5 text-center text-sm font-semibold">{q}</span>
                              <button type="button" onClick={() => put(p.id, 1)} aria-label={`Add one ${p.name}`} className={`flex h-7 w-7 items-center justify-center rounded-full border border-[var(--d-ink)]/15 ${dFocus}`}>
                                <Plus size={12} aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm font-semibold">{money(p.price * q)}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-[var(--d-ink)]/10 px-6 py-5">
                      <div className="flex justify-between font-semibold">
                        <span>Subtotal</span>
                        <span>{money(subtotal)}</span>
                      </div>
                      <button type="button" onClick={() => setView("checkout")} className={`${dButton} mt-4 w-full`}>
                        <Lock size={15} aria-hidden="true" /> Checkout
                      </button>
                    </div>
                  </>
                ) : (
                  <form
                    className="flex flex-1 flex-col overflow-y-auto"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setOrderNo(1040 + Math.floor(Math.random() * 60));
                      setView("done");
                    }}
                  >
                    <div className="flex-1 space-y-3 px-6 py-5">
                      <p className="rounded-xl bg-[#FFF5C4] px-3 py-2 text-xs text-[#5b5130]">Demo checkout: don&apos;t enter real card details. Nothing is charged.</p>
                      <input required type="email" placeholder="Email" className={dField} autoComplete="off" />
                      <div className="grid grid-cols-2 gap-3">
                        <input required placeholder="First name" className={dField} autoComplete="off" />
                        <input required placeholder="Last name" className={dField} autoComplete="off" />
                      </div>
                      <input required placeholder="Address" className={dField} autoComplete="off" />
                      <div className="grid grid-cols-3 gap-3">
                        <input required placeholder="City" className={`${dField} col-span-2`} autoComplete="off" />
                        <input required placeholder="ZIP" className={dField} autoComplete="off" />
                      </div>
                      <div className="rounded-xl border border-[var(--d-ink)]/15 bg-[var(--d-soft)]/50 px-4 py-3 text-sm">
                        <p className="font-semibold">Payment</p>
                        <p className="mt-1 text-[var(--d-muted)]">Card · Apple Pay · Google Pay · Shop Pay (connected on the real store)</p>
                      </div>
                    </div>
                    <div className="border-t border-[var(--d-ink)]/10 px-6 py-5 text-sm">
                      <div className="flex justify-between text-[var(--d-muted)]">
                        <span>Subtotal</span>
                        <span>{money(subtotal)}</span>
                      </div>
                      <div className="mt-1 flex justify-between text-[var(--d-muted)]">
                        <span>Shipping</span>
                        <span>{shipping ? money(shipping) : "Free"}</span>
                      </div>
                      <div className="mt-2 flex justify-between text-base font-semibold">
                        <span>Total</span>
                        <span>{money(Math.round((subtotal + shipping) * 100) / 100)}</span>
                      </div>
                      <button type="submit" className={`${dButton} mt-4 w-full`}>
                        Place order
                      </button>
                      <button type="button" onClick={() => setView("cart")} className={`mt-3 w-full text-center text-sm font-semibold text-[var(--d-muted)] ${dFocus}`}>
                        ← Back to cart
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </DemoShell>
    </PhotoContext.Provider>
  );
}
