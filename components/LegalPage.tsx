import { SITE } from "@/lib/site";

export type LegalSection = { heading: string; body: React.ReactNode };

/** Shared layout for the Privacy Policy and Terms of Service pages. */
export default function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-bg-dark px-6 pb-24 pt-32 text-ink-invert">
      <article className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-4 font-mono text-xs text-dim-invert">Last updated: {SITE.legalUpdated}</p>
        <div className="mt-8 text-base leading-relaxed text-dim-invert">{intro}</div>

        <div className="mt-12 space-y-10">
          {sections.map((s, i) => (
            <section key={s.heading}>
              <h2 className="font-display text-xl font-bold text-ink-invert">
                <span className="mr-3 font-mono text-sm text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.heading}
              </h2>
              <div className="mt-3 space-y-3 leading-relaxed text-dim-invert [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
