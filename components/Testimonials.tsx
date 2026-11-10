import { Star } from "lucide-react";
import { publishedReviews } from "@/lib/reviews";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={16} aria-hidden="true" className={n <= rating ? "fill-amber-400 text-amber-400" : "text-ink-invert/20"} />
      ))}
    </span>
  );
}

/** Real client reviews approved in YAKIMEL OS. Renders nothing until there is at least one. */
export default async function Testimonials({ className = "" }: { className?: string }) {
  const reviews = await publishedReviews(6);
  if (reviews.length === 0) return null;
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section aria-labelledby="testimonials-title" className={`bg-white px-6 py-20 text-ink-invert md:py-24 ${className}`}>
      <div className="mx-auto max-w-7xl md:px-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand">Client reviews</p>
        <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 id="testimonials-title" className="font-display text-3xl font-semibold md:text-5xl">
            What our clients say
          </h2>
          {reviews.length >= 3 && (
            <p className="flex items-center gap-2 text-sm text-dim-invert">
              <Stars rating={Math.round(average)} />
              <span>
                {average.toFixed(1)} average from {reviews.length} reviews
              </span>
            </p>
          )}
        </div>
        <span aria-hidden="true" className="mt-3 block h-1 w-12 rounded bg-brand" />

        <RevealGroup className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <RevealItem key={r.id} className="flex flex-col rounded-2xl border border-ink-invert/15 bg-surface/60 p-6">
              <Stars rating={r.rating} />
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-invert/90">
                <p>“{r.body}”</p>
              </blockquote>
              <footer className="mt-5 border-t border-ink-invert/15 pt-4">
                <p className="font-medium">{r.name}</p>
                {(r.role || r.company) && (
                  <p className="text-sm text-dim-invert">{[r.role, r.company].filter(Boolean).join(", ")}</p>
                )}
              </footer>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
