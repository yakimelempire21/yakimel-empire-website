import Link from "next/link";
import ContactWidget from "@/components/ContactWidget";
import { Reveal } from "@/components/motion/Reveal";

export default function HomeCTA() {
  return (
    <section id="contact" className="scroll-mt-20 bg-white px-6 py-24 text-ink-invert md:py-32">
      <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-brand px-6 text-white shadow-[0_30px_60px_-30px_rgba(14,59,50,0.7)] py-16 text-center md:px-16 md:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(184,226,238,0.25),transparent_65%)]"
        />
        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-widest text-sky">Let&apos;s Talk</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold md:text-6xl">
            Ready to build what&apos;s next?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
            Tell us about your business and what you want to build. We&apos;ll reply within 24–48
            business hours with next steps.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/consultation"
              className="rounded-full bg-white px-8 py-4 font-semibold text-ink transition-colors hover:bg-sky"
            >
              Start Your Project
            </Link>
            <ContactWidget
              label="Ask a Question"
              className="rounded-full border border-white/40 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/10"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
