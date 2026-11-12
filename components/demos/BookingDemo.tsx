"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ChevronLeft, Clock, Menu, X } from "lucide-react";
import type { BookingSite, ServiceItem } from "@/lib/demo-sites";
import DemoShell from "./DemoShell";
import DemoPhoto, { PhotoContext } from "./DemoPhoto";
import { DemoFooter, Eyebrow, Reviews, Stars, Visit, dButton, dField, dFocus, dGhost, heading, money, nextDays, themeVars } from "./DemoParts";

type Step = "service" | "time" | "details" | "done";

/** Booking website demo: clinic, waxing, lashes, nails. */
export default function BookingDemo({ site, photos }: { site: BookingSite; photos: string[] }) {
  const have = useMemo(() => new Set(photos), [photos]);
  const all = site.services.flatMap((c) => c.items);
  const [cat, setCat] = useState(site.services[0].category);
  const [menuOpen, setMenuOpen] = useState(false);
  const [service, setService] = useState<ServiceItem | null>(null);
  const [step, setStep] = useState<Step>("service");
  const [days, setDays] = useState<ReturnType<typeof nextDays>>([]);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [client, setClient] = useState({ name: "", phone: "" });
  const bookRef = useRef<HTMLElement>(null);
  const h = heading(site);
  const isClinic = site.slug === "clinic";
  const price = (s: ServiceItem) => (s.price ? money(s.price) : "Insurance accepted");

  function pick(s: ServiceItem) {
    setService(s);
    setStep("time");
    setTime(null);
    // Dates are worked out on click (not during render) so server and browser agree.
    const list = days.length ? days : nextDays(7);
    setDays(list);
    if (!day) setDay(list[1].iso);
    bookRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const nav = [
    { label: "Services", href: "#services" },
    { label: "Gallery", href: "#gallery" },
    { label: "Reviews", href: "#reviews" },
    { label: "Visit", href: "#visit" },
  ];
  const chosenDay = days.find((d) => d.iso === day);
  const reminder = site.reminder
    .replace("{name}", client.name.split(" ")[0] || "there")
    .replace("{service}", service?.name.toLowerCase() ?? "appointment")
    .replace("{time}", time ?? "");
  // A couple of times look "taken" so the calendar feels real.
  const taken = (t: string, i: number) => (day ? (day.charCodeAt(day.length - 1) + i) % 4 === 0 : false) && t !== time;

  return (
    <PhotoContext.Provider value={have}>
      <DemoShell name={site.name} service={site.pkg} chat={site.chat}>
        <div style={themeVars(site)} className="bg-[var(--d-bg)] text-[var(--d-ink)]">
          {/* Site nav */}
          <header className="sticky top-11 z-50 border-b border-[var(--d-ink)]/10 bg-[var(--d-bg)]/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
              <a href="#top" className={`text-xl ${h} ${dFocus}`}>
                {site.name}
              </a>
              <nav aria-label={`${site.name} menu`} className="hidden items-center gap-7 text-sm font-medium md:flex">
                {nav.map((n) => (
                  <a key={n.href} href={n.href} className={`text-[var(--d-muted)] hover:text-[var(--d-ink)] ${dFocus}`}>
                    {n.label}
                  </a>
                ))}
                <a href="#book" className={`${dButton} px-5 py-2.5`}>
                  {site.bookLabel}
                </a>
              </nav>
              <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen} aria-label="Menu" className={`rounded-full p-2 md:hidden ${dFocus}`}>
                {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
              </button>
            </div>
            {menuOpen && (
              <nav aria-label={`${site.name} mobile menu`} className="border-t border-[var(--d-ink)]/10 px-6 py-4 md:hidden">
                {[...nav, { label: site.bookLabel, href: "#book" }].map((n) => (
                  <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="block py-2.5 text-base font-medium">
                    {n.label}
                  </a>
                ))}
              </nav>
            )}
          </header>

          {/* Hero */}
          <section id="top" className="px-6 pb-16 pt-12 md:pt-16">
            <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_1fr]">
              <div>
                <Eyebrow>{site.businessType}</Eyebrow>
                <h1 className={`mt-4 text-[2.6rem] leading-[1.05] md:text-6xl ${h}`}>{site.tagline}</h1>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-[var(--d-muted)]">{site.intro}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#book" className={dButton}>
                    {site.bookLabel} <ArrowRight size={16} aria-hidden="true" />
                  </a>
                  <a href="#services" className={dGhost}>
                    {isClinic ? "Our services" : "See prices"}
                  </a>
                </div>
                <div className="mt-8 flex items-center gap-3 text-sm text-[var(--d-muted)]">
                  <Stars />
                  <span>
                    <strong className="text-[var(--d-ink)]">4.9</strong> from 230+ Google reviews
                  </span>
                </div>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] md:aspect-[5/6]">
                <DemoPhoto photo={site.hero} tone={site.theme.soft} ink={site.theme.ink} priority />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white/90 p-3.5 text-[var(--d-ink)] shadow-lg backdrop-blur">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--d-accent)] text-[var(--d-accent-ink)]">
                    <Clock size={18} aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-tight">
                    <strong>Next opening: tomorrow, {site.times[1]}</strong>
                    <span className="block text-[var(--d-muted)]">Book online in under a minute</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Services */}
          <section id="services" className="scroll-mt-28 bg-[var(--d-surface)] px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <Eyebrow>{isClinic ? "Services" : "Menu & prices"}</Eyebrow>
              <h2 className={`mt-2 text-3xl md:text-4xl ${h}`}>{isClinic ? "How we can help" : "Choose your service"}</h2>
              <div role="tablist" aria-label="Service categories" className="mt-8 flex flex-wrap gap-2">
                {site.services.map((c) => (
                  <button
                    key={c.category}
                    role="tab"
                    type="button"
                    aria-selected={cat === c.category}
                    onClick={() => setCat(c.category)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${dFocus} ${
                      cat === c.category ? "bg-[var(--d-ink)] text-white" : "bg-[var(--d-soft)] text-[var(--d-ink)] hover:brightness-95"
                    }`}
                  >
                    {c.category}
                  </button>
                ))}
              </div>
              <ul className="mt-8 grid gap-4 md:grid-cols-2">
                {site.services
                  .find((c) => c.category === cat)!
                  .items.map((s) => (
                    <li key={s.name} className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--d-ink)]/10 bg-[var(--d-bg)] p-5">
                      <div className="min-w-0">
                        <p className="font-semibold">{s.name}</p>
                        {s.desc && <p className="mt-1 text-sm text-[var(--d-muted)]">{s.desc}</p>}
                        <p className="mt-2 flex items-center gap-3 text-sm">
                          <span className="inline-flex items-center gap-1 text-[var(--d-muted)]">
                            <Clock size={14} aria-hidden="true" /> {s.duration}
                          </span>
                          <span className="font-semibold text-[var(--d-accent)]">{price(s)}</span>
                        </p>
                      </div>
                      <button type="button" onClick={() => pick(s)} className={`${dGhost} shrink-0 px-4 py-2`}>
                        Book
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </section>

          {/* Booking */}
          <section id="book" ref={bookRef} className="scroll-mt-28 px-6 py-20">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <Eyebrow>Online booking</Eyebrow>
                <h2 className={`mt-2 text-3xl md:text-4xl ${h}`}>{site.bookLabel}</h2>
                <p className="mt-3 text-[var(--d-muted)]">Pick a service, a day and a time. You&apos;ll get a reminder on WhatsApp.</p>
              </div>

              <div className="mt-10 overflow-hidden rounded-3xl bg-[var(--d-surface)] shadow-[0_24px_60px_-34px_rgba(0,0,0,0.45)]">
                {/* Progress */}
                <ol className="flex border-b border-[var(--d-ink)]/10 text-xs font-semibold uppercase tracking-wider">
                  {(["service", "time", "details"] as const).map((s, i) => {
                    const idx = ["service", "time", "details", "done"].indexOf(step);
                    const done = idx > i;
                    return (
                      <li key={s} className={`flex flex-1 items-center justify-center gap-2 py-4 ${idx === i ? "text-[var(--d-accent)]" : done ? "text-[var(--d-ink)]" : "text-[var(--d-muted)]/60"}`}>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${done ? "bg-[var(--d-accent)] text-[var(--d-accent-ink)]" : "border border-current"}`}>
                          {done ? <Check size={13} aria-hidden="true" /> : i + 1}
                        </span>
                        <span className="hidden sm:inline">{["Service", "Date & time", "Your details"][i]}</span>
                      </li>
                    );
                  })}
                </ol>

                <div className="p-6 md:p-8">
                  {step === "service" && (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {all.map((s) => (
                        <li key={s.name}>
                          <button
                            type="button"
                            onClick={() => pick(s)}
                            className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--d-ink)]/12 p-4 text-left transition hover:border-[var(--d-accent)] hover:bg-[var(--d-soft)]/50 ${dFocus}`}
                          >
                            <span>
                              <span className="block font-semibold">{s.name}</span>
                              <span className="text-sm text-[var(--d-muted)]">{s.duration}</span>
                            </span>
                            <span className="text-sm font-semibold text-[var(--d-accent)]">{s.price ? money(s.price) : ""}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {step === "time" && service && (
                    <div>
                      <Chosen service={service} price={price(service)} onChange={() => setStep("service")} />
                      <p className="mt-6 text-sm font-semibold">Day</p>
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {days.map((d) => (
                          <button
                            key={d.iso}
                            type="button"
                            onClick={() => {
                              setDay(d.iso);
                              setTime(null);
                            }}
                            aria-pressed={day === d.iso}
                            className={`min-w-[78px] shrink-0 rounded-2xl border px-3 py-3 text-center transition ${dFocus} ${
                              day === d.iso ? "border-[var(--d-accent)] bg-[var(--d-accent)] text-[var(--d-accent-ink)]" : "border-[var(--d-ink)]/12 hover:border-[var(--d-accent)]"
                            }`}
                          >
                            <span className="block text-xs font-semibold uppercase tracking-wide opacity-80">{d.day}</span>
                            <span className="mt-0.5 block text-sm font-semibold">{d.date}</span>
                          </button>
                        ))}
                      </div>
                      <p className="mt-6 text-sm font-semibold">Time</p>
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {site.times.map((t, i) => {
                          const off = taken(t, i);
                          return (
                            <button
                              key={t}
                              type="button"
                              disabled={off}
                              onClick={() => setTime(t)}
                              aria-pressed={time === t}
                              className={`rounded-xl border py-2.5 text-sm font-semibold transition ${dFocus} ${
                                time === t
                                  ? "border-[var(--d-accent)] bg-[var(--d-accent)] text-[var(--d-accent-ink)]"
                                  : off
                                    ? "cursor-not-allowed border-transparent bg-[var(--d-ink)]/5 text-[var(--d-muted)]/50 line-through"
                                    : "border-[var(--d-ink)]/12 hover:border-[var(--d-accent)]"
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-8 flex justify-end">
                        <button type="button" disabled={!time} onClick={() => setStep("details")} className={dButton}>
                          Continue <ArrowRight size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  )}

                  {step === "details" && service && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setStep("done");
                      }}
                    >
                      <Chosen service={service} price={price(service)} when={`${chosenDay?.day}, ${chosenDay?.date} · ${time}`} onChange={() => setStep("time")} />
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-semibold">Full name</span>
                          <input required value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} className={dField} placeholder="Your name" autoComplete="off" />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-sm font-semibold">WhatsApp number</span>
                          <input required value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} className={dField} placeholder="+1 (555) 000-0000" inputMode="tel" autoComplete="off" />
                        </label>
                        {isClinic && (
                          <label className="block sm:col-span-2">
                            <span className="mb-1.5 block text-sm font-semibold">Reason for visit</span>
                            <textarea rows={3} className={dField} placeholder="Tell us briefly how we can help" />
                          </label>
                        )}
                      </div>
                      <p className="mt-4 rounded-xl bg-[var(--d-soft)] px-4 py-3 text-sm text-[var(--d-muted)]">{site.policy}</p>
                      <div className="mt-8 flex items-center justify-between gap-3">
                        <button type="button" onClick={() => setStep("time")} className={`inline-flex items-center gap-1 text-sm font-semibold text-[var(--d-muted)] ${dFocus}`}>
                          <ChevronLeft size={16} aria-hidden="true" /> Back
                        </button>
                        <button type="submit" className={dButton}>
                          Confirm booking
                        </button>
                      </div>
                    </form>
                  )}

                  {step === "done" && service && (
                    <div className="text-center">
                      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--d-accent)] text-[var(--d-accent-ink)]">
                        <Check size={28} aria-hidden="true" />
                      </span>
                      <h3 className={`mt-4 text-2xl ${h}`}>You&apos;re booked, {client.name.split(" ")[0]}!</h3>
                      <p className="mt-2 text-[var(--d-muted)]">
                        {service.name} · {chosenDay?.day}, {chosenDay?.date} at {time}
                      </p>
                      <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-[#EFEAE2] p-4 text-left">
                        <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-[#667781]">Reminder sent on WhatsApp the day before</p>
                        <p className="rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[13.5px] leading-snug text-[#111b21] shadow-sm">{reminder}</p>
                      </div>
                      <p className="mt-6 text-xs text-[var(--d-muted)]">Demo only: no appointment was made and no message was sent.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setStep("service");
                          setService(null);
                          setTime(null);
                        }}
                        className={`${dGhost} mt-6`}
                      >
                        Book another
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Gallery */}
          <section id="gallery" className="scroll-mt-28 bg-[var(--d-surface)] px-6 py-20">
            <div className="mx-auto max-w-6xl">
              <Eyebrow>Gallery</Eyebrow>
              <h2 className={`mt-2 text-3xl md:text-4xl ${h}`}>{isClinic ? "Inside our clinic" : "Our work"}</h2>
              <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {site.gallery.map((p, i) => (
                  <div key={p.src} className="aspect-[4/5] overflow-hidden rounded-2xl">
                    <DemoPhoto photo={p} tone={i % 2 ? site.theme.soft : site.theme.bg} ink={site.theme.ink} />
                  </div>
                ))}
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

function Chosen({ service, price, when, onChange }: { service: ServiceItem; price: string; when?: string; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--d-soft)] px-5 py-4">
      <div>
        <p className="font-semibold">{service.name}</p>
        <p className="text-sm text-[var(--d-muted)]">
          {service.duration} · {price}
          {when ? ` · ${when}` : ""}
        </p>
      </div>
      <button type="button" onClick={onChange} className={`text-sm font-semibold text-[var(--d-accent)] hover:underline ${dFocus}`}>
        Change
      </button>
    </div>
  );
}
