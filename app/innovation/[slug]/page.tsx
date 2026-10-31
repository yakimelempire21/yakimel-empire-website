import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ConceptPreview from "@/components/innovation/ConceptPreview";
import {
  INNOVATION_PAGE,
  getOverviewProject,
  overviewProjects,
} from "@/lib/innovation";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return overviewProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getOverviewProject(slug);
  if (!project) return {};
  const title = `${project.name} | Innovation | Yakimel Empire LLC`;
  return {
    title,
    description: project.description,
    openGraph: { title, description: project.description, type: "website", siteName: "Yakimel Empire LLC" },
  };
}

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default async function InnovationOverviewPage({ params }: Params) {
  const { slug } = await params;
  const project = getOverviewProject(slug);

  if (!project || project.media.type !== "concept") {
    notFound();
  }

  const { overview } = INNOVATION_PAGE;

  return (
    <main className="min-h-screen overflow-x-clip bg-bg-dark text-ink-invert">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-28 md:pt-32">
        <Link
          href="/innovation"
          className={`font-mono text-xs uppercase tracking-widest text-brand transition-opacity hover:opacity-80 ${focus}`}
        >
          {overview.back}
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10">
            <ConceptPreview kind={project.media.kind} />
          </div>

          <div>
            {project.wordmark && (
              // Light panel: the logo artwork is designed for a white background.
              <div className="mb-6 inline-flex rounded-2xl bg-white px-6 py-4">
                <Image
                  src={project.wordmark.src}
                  alt={project.wordmark.alt}
                  width={project.wordmark.width}
                  height={project.wordmark.height}
                  priority
                  sizes="(min-width: 1024px) 280px, 240px"
                  className="h-auto w-56 sm:w-64"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="font-mono text-xs uppercase tracking-widest text-[#c9a45c]">
                {project.category}
              </p>
              {project.badge && (
                <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-dim-invert">
                  {project.badge}
                </span>
              )}
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{project.name}</h1>
            <p className="mt-5 text-lg leading-relaxed text-dim-invert">{project.description}</p>

            <p className="mt-8 text-sm text-dim-invert">{overview.ctaNote}</p>
            <Link
              href={`/consultation?service=${encodeURIComponent(project.name)}`}
              className={`mt-3 inline-flex items-center justify-center rounded-lg bg-brand px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-dark ${focus}`}
            >
              {overview.cta}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold">{overview.audience}</h2>
            <ul className="mt-4 space-y-2">
              {project.audience.map((a) => (
                <li key={a} className="flex items-start gap-3 text-dim-invert">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a45c]" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold">{overview.capabilities}</h2>
            <p className="mt-2 text-sm text-dim-invert">{overview.capabilitiesNote}</p>
            <ul className="mt-4 space-y-2">
              {project.capabilities.map((c) => (
                <li key={c} className="flex items-start gap-3 text-dim-invert">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
