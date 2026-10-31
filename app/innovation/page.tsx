import type { Metadata } from "next";
import Link from "next/link";
import HeroVisual from "@/components/innovation/HeroVisual";
import ProjectCard from "@/components/innovation/ProjectCard";
import { INNOVATION_PAGE, innovationProjects } from "@/lib/innovation";

export const metadata: Metadata = {
  title: INNOVATION_PAGE.metaTitle,
  description: INNOVATION_PAGE.metaDescription,
  openGraph: {
    title: INNOVATION_PAGE.metaTitle,
    description: INNOVATION_PAGE.metaDescription,
    type: "website",
    siteName: "Yakimel Empire LLC",
  },
};

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function InnovationPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-bg-dark text-ink-invert">
      <header className="relative overflow-hidden border-b border-white/10 pb-12 pt-28 md:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(ellipse_at_top_right,rgba(47,111,234,0.25),transparent_65%)]"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 md:px-10 lg:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#c9a45c]">
              {INNOVATION_PAGE.eyebrow}
            </p>
            <h1 className="mt-3 max-w-xl font-display text-4xl font-bold leading-tight md:text-6xl">
              {INNOVATION_PAGE.title}
            </h1>
            <p className="mt-4 max-w-lg text-base text-dim-invert md:text-lg">
              {INNOVATION_PAGE.description}
            </p>
            <a
              href={INNOVATION_PAGE.heroCta.href}
              className={`mt-8 inline-flex items-center justify-center rounded-lg bg-brand px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark ${focus}`}
            >
              {INNOVATION_PAGE.heroCta.label} <span aria-hidden="true">&nbsp;↓</span>
            </a>
          </div>
          <HeroVisual />
        </div>
      </header>

      <section id="projects" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-14 md:px-10">
        <h2 className="font-display text-3xl font-bold md:text-4xl">{INNOVATION_PAGE.gridTitle}</h2>
        <span aria-hidden="true" className="mt-3 block h-1 w-12 rounded bg-[#c9a45c]" />
        <p className="mt-4 text-dim-invert">{INNOVATION_PAGE.gridSubtitle}</p>

        <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {innovationProjects.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            {INNOVATION_PAGE.closing.title}
          </h2>
          <p className="mt-4 text-dim-invert">{INNOVATION_PAGE.closing.description}</p>
          <Link
            href={INNOVATION_PAGE.closing.href}
            className={`mt-8 inline-flex items-center justify-center rounded-lg bg-brand px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark ${focus}`}
          >
            {INNOVATION_PAGE.closing.button}
          </Link>
        </div>
      </section>
    </main>
  );
}
