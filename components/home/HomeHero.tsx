import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import NetworkBackground from "@/components/hero/NetworkBackground";

const PROOF = [
  "Business websites from $699",
  "Private admin dashboard included",
  "Reply within 24–48 business hours",
];

export default function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#050505] pb-20 pt-32 md:pb-28 md:pt-40">
      <div className="absolute inset-0 -z-10 opacity-70">
        <NetworkBackground />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 -z-10 h-[700px] w-[700px] rounded-full opacity-40 blur-[140px]"
        style={{ background: "radial-gradient(circle, rgba(77,141,255,0.45) 0%, transparent 70%)" }}
      />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 md:px-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="animate-[fadeUp_0.8s_ease-out_both]">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#7f93b8]">
            Web · Apps · AI — New York
          </p>
          <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.02] text-[#eef1f6] sm:text-6xl lg:text-7xl">
            Websites and apps that{" "}
            <span className="bg-gradient-to-r from-[#eef1f6] to-[#4d8dff] bg-clip-text text-transparent">
              grow your business.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#a2adc4]">
            We design, build and run websites, online stores, apps and AI tools for small
            businesses, with clear prices and a private dashboard you control.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/consultation"
              className="rounded-full bg-[#4d8dff] px-8 py-4 text-center font-mono text-xs uppercase tracking-widest text-white transition-colors hover:bg-[#3a7ae8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4d8dff]"
            >
              Start Your Project
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-[#2c3a52] px-8 py-4 text-center font-mono text-xs uppercase tracking-widest text-[#eef1f6] transition-colors hover:border-[#4d8dff] hover:bg-[#4d8dff]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4d8dff]"
            >
              See Pricing
            </Link>
          </div>

          <ul className="mt-10 grid gap-3 text-sm text-[#a2adc4] sm:grid-cols-3 sm:gap-6">
            {PROOF.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Check size={16} className="mt-0.5 shrink-0 text-[#4d8dff]" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto hidden w-full max-w-[460px] animate-[fadeIn_1.2s_ease-out_both] lg:block">
          <div className="aspect-square rounded-full border border-[#2c3a52] bg-[#050505] p-8 shadow-[0_0_80px_20px_rgba(77,141,255,0.22)]">
            <Image
              src="/yakimel-logo.png"
              alt="Yakimel Empire LLC"
              width={460}
              height={460}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
