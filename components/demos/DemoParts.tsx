"use client";

import { Clock, MapPin, Phone, Star } from "lucide-react";
import type { DemoSite } from "@/lib/demo-sites";

/** Theme colors as CSS variables, so every demo part can use bg-[var(--d-…)]. */
export function themeVars(site: DemoSite): React.CSSProperties {
  const t = site.theme;
  return {
    "--d-bg": t.bg,
    "--d-surface": t.surface,
    "--d-ink": t.ink,
    "--d-muted": t.muted,
    "--d-accent": t.accent,
    "--d-accent-ink": t.accentInk,
    "--d-soft": t.soft,
  } as React.CSSProperties;
}

export const dFocus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--d-accent)]";
export const dButton = `inline-flex items-center justify-center gap-2 rounded-full bg-[var(--d-accent)] px-6 py-3 text-sm font-semibold text-[var(--d-accent-ink)] transition hover:brightness-110 disabled:opacity-50 ${dFocus}`;
export const dGhost = `inline-flex items-center justify-center gap-2 rounded-full border border-[var(--d-ink)]/20 px-6 py-3 text-sm font-semibold text-[var(--d-ink)] transition hover:bg-[var(--d-soft)] ${dFocus}`;
export const dField = `w-full rounded-xl border border-[var(--d-ink)]/15 bg-white px-4 py-3 text-sm text-[var(--d-ink)] outline-none placeholder:text-[var(--d-muted)]/60 focus:border-[var(--d-accent)] focus:ring-2 focus:ring-[var(--d-accent)]/20`;

export const money = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

export function heading(site: DemoSite) {
  return site.theme.font === "serif" ? "font-serif font-medium tracking-tight" : "font-display font-bold tracking-tight";
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--d-accent)]">{children}</p>;
}

export function Stars({ size = 15 }: { size?: number }) {
  return (
    <span className="flex gap-0.5 text-[#F5A524]" aria-label="5 out of 5 stars">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} fill="currentColor" strokeWidth={0} aria-hidden="true" />
      ))}
    </span>
  );
}

export function Reviews({ site }: { site: DemoSite }) {
  return (
    <section id="reviews" className="scroll-mt-28 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Eyebrow>Reviews</Eyebrow>
        <h2 className={`mt-2 text-3xl md:text-4xl ${heading(site)}`}>What our clients say</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {site.reviews.map((r) => (
            <figure key={r.name} className="rounded-2xl bg-[var(--d-surface)] p-6 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)]">
              <Stars />
              <blockquote className="mt-4 text-[15px] leading-relaxed">“{r.text}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-[var(--d-muted)]">{r.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Visit({ site }: { site: DemoSite }) {
  return (
    <section id="visit" className="scroll-mt-28 bg-[var(--d-soft)] px-6 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
        <div>
          <Eyebrow>{site.kind === "store" ? "Contact" : "Visit us"}</Eyebrow>
          <h2 className={`mt-2 text-3xl md:text-4xl ${heading(site)}`}>{site.kind === "store" ? "We're here to help" : "Come see us"}</h2>
          <ul className="mt-8 space-y-4 text-[15px]">
            <li className="flex gap-3">
              <MapPin size={20} className="mt-0.5 shrink-0 text-[var(--d-accent)]" aria-hidden="true" />
              {site.location}
            </li>
            <li className="flex gap-3">
              <Phone size={20} className="mt-0.5 shrink-0 text-[var(--d-accent)]" aria-hidden="true" />
              {site.phone}
            </li>
          </ul>
        </div>
        <div className="rounded-2xl bg-[var(--d-surface)] p-6">
          <p className="flex items-center gap-2 font-semibold">
            <Clock size={18} className="text-[var(--d-accent)]" aria-hidden="true" /> Hours
          </p>
          <dl className="mt-4 divide-y divide-[var(--d-ink)]/10 text-[15px]">
            {site.hours.map(([d, h]) => (
              <div key={d} className="flex justify-between gap-4 py-3">
                <dt className="text-[var(--d-muted)]">{d}</dt>
                <dd className="font-medium">{h}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export function DemoFooter({ site }: { site: DemoSite }) {
  return (
    <footer className="bg-[var(--d-ink)] px-6 py-10 text-center text-sm text-white/70">
      <p className={`text-lg text-white ${heading(site)}`}>{site.name}</p>
      <p className="mt-2">{site.location}</p>
      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-white/45">Demo preview · sample business · nothing is booked or charged</p>
      <p className="mt-2 text-xs text-white/45">Website + AI assistant by Yakimel Empire</p>
    </footer>
  );
}

/** Next `n` days as {iso, day, date} for the booking/pickup pickers. */
export function nextDays(n: number) {
  const out: { iso: string; day: string; date: string }[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    out.push({
      iso: x.toISOString().slice(0, 10),
      day: i === 0 ? "Today" : i === 1 ? "Tomorrow" : x.toLocaleDateString("en-US", { weekday: "short" }),
      date: x.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }
  return out;
}
