import Link from "next/link";
import ContactWidget from "@/components/ContactWidget";
import { Reveal } from "@/components/motion/Reveal";

export default function HomeCTA() {
  return (
    <section id="contact" className="scroll-mt-20 bg-bg-dark px-6 py-24 text-ink-invert md:py-32">
      <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-surface px-6 py-16 text-center md:px-16 md:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(47,111,234,0.35),transparent_65%)]"
        />
        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">Let&apos;s Talk</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold md:text-6xl">
            Ready to build what&apos;s next?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-dim-invert">
            Tell us about your business and what you want to build. We&apos;ll reply within 24–48
            business hours with next steps.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/consultation"
              className="rounded-full bg-brand px-8 py-4 font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Start Your Project
            </Link>
            <ContactWidget
              label="Ask a Question"
              className="rounded-full border border-white/20 px-8 py-4 font-medium text-ink-invert transition-colors hover:border-brand hover:bg-brand/10"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
