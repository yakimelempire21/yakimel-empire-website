"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const input =
  "w-full rounded-lg border border-ink-invert/20 bg-ink-invert/[0.04] px-4 py-3 text-sm text-ink-invert placeholder:text-dim-invert/70 focus:border-brand focus:outline-none";
const label = "mb-1.5 block text-sm font-medium";

export default function ReviewForm({ services, googleReviewUrl }: { services: string[]; googleReviewUrl: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rating) return setError("Please choose a star rating.");
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          company: f.get("company"),
          role: f.get("role"),
          email: f.get("email"),
          service: f.get("service"),
          body: f.get("body"),
          consent: f.get("consent") === "on",
          website: f.get("website"),
          rating,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("sent");
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-10 rounded-2xl border border-ink-invert/15 bg-surface/60 p-8 text-center" role="status">
        <p className="font-display text-2xl font-bold">Thank you!</p>
        <p className="mt-2 text-dim-invert">Your review was sent to our team.</p>
        {googleReviewUrl && rating >= 4 && (
          <>
            <p className="mt-6 text-sm text-dim-invert">Would you also share it on Google? It helps us a lot.</p>
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Review us on Google
            </a>
          </>
        )}
      </div>
    );
  }

  const shown = hover || rating;
  return (
    <form onSubmit={submit} className="mt-10 space-y-6 rounded-2xl border border-ink-invert/15 bg-surface/60 p-6 md:p-8">
      <fieldset>
        <legend className={label}>
          Your rating <span className="text-brand">*</span>
        </legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              className="rounded p-1 focus-visible:outline-2 focus-visible:outline-brand"
            >
              <Star size={34} className={n <= shown ? "fill-amber-400 text-amber-400" : "text-ink-invert/25"} aria-hidden="true" />
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className={label}>
          Your review <span className="text-brand">*</span>
        </span>
        <textarea name="body" required minLength={10} maxLength={1200} rows={5} className={input} placeholder="What did we do for you, and what changed for your business?" />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className={label}>
            Your name <span className="text-brand">*</span>
          </span>
          <input name="name" required maxLength={80} className={input} />
        </label>
        <label className="block">
          <span className={label}>Business name</span>
          <input name="company" maxLength={120} className={input} />
        </label>
        <label className="block">
          <span className={label}>Your role</span>
          <input name="role" maxLength={80} className={input} placeholder="Owner, Manager…" />
        </label>
        <label className="block">
          <span className={label}>What did we do for you?</span>
          <select name="service" className={input} defaultValue="">
            <option value="">Choose…</option>
            {services.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className={label}>Email (never shown)</span>
        <input name="email" type="email" maxLength={200} className={input} />
      </label>

      {/* Honeypot for bots — hidden from people and screen readers. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <label className="flex items-start gap-3 text-sm">
        <input name="consent" type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 accent-brand" />
        <span className="text-dim-invert">
          Yakimel Empire may show my review, first and last name, role and business name on its website.
        </span>
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-brand px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send my review"}
      </button>
    </form>
  );
}
