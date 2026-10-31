import Image from "next/image";
import Link from "next/link";
import ConceptPreview from "@/components/innovation/ConceptPreview";
import { INNOVATION_PAGE, statusLabel, type InnovationProject } from "@/lib/innovation";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const btn = `inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${focus}`;

export default function ProjectCard({ project }: { project: InnovationProject }) {
  const status = statusLabel(project);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-surface/60 p-3 transition-colors duration-300 hover:border-[#c9a45c]/40">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-bg-dark">
        {project.media.type === "image" ? (
          <Image
            src={project.media.src}
            alt={project.media.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <ConceptPreview kind={project.media.kind} />
        )}
        {status && (
          <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-bg-dark/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-ink-invert backdrop-blur-sm">
            {status}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#c9a45c]">
            {project.category}
          </p>
          {project.badge && (
            <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-dim-invert">
              {project.badge}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3">
          {project.logo && (
            // Light tile: the logo artwork is designed for a white background.
            <span className="flex h-10 shrink-0 items-center rounded-lg bg-white px-2">
              <Image
                src={project.logo.src}
                alt={project.logo.alt}
                width={project.logo.width}
                height={project.logo.height}
                sizes="64px"
                className="h-6 w-auto"
              />
            </span>
          )}
          <h3 className="font-display text-xl font-bold text-ink-invert">{project.name}</h3>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-dim-invert">{project.description}</p>

        <div className="mt-auto flex flex-wrap gap-3 pt-5">
          <Link
            href={project.detailsHref}
            className={`${btn} bg-brand text-white hover:bg-brand-dark`}
          >
            {INNOVATION_PAGE.discover}
            <span className="sr-only"> {project.name}</span>
          </Link>
          {project.visit && (
            <a
              href={project.visit.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} border border-white/25 text-ink-invert hover:border-white/60 hover:bg-white/5`}
            >
              {project.visit.label}
              <span className="sr-only"> {project.name} (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
