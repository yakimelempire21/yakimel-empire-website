import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { REVIEW_SERVICES } from "@/lib/reviews";
import ReviewForm from "./ReviewForm";

export const metadata: Metadata = {
  title: "Leave a Review | Yakimel Empire",
  description: "Tell us about your experience working with Yakimel Empire.",
  robots: { index: false, follow: false },
};

export default function ReviewPage() {
  return (
    <main className="min-h-screen bg-bg-dark px-6 pb-20 pt-28 text-ink-invert md:pt-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.66),transparent_65%)]"
      />
      <div className="relative mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand">Your feedback</p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">How did we do?</h1>
        <p className="mt-4 text-base text-dim-invert md:text-lg">
          Thank you for working with {SITE.name}. Your review takes two minutes and helps other business owners decide
          with confidence.
        </p>
        <ReviewForm services={REVIEW_SERVICES} googleReviewUrl={SITE.googleReviewUrl} />
      </div>
    </main>
  );
}
