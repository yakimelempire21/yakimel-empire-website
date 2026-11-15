import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Wallet } from "lucide-react";
import { jobFacts, openJobs } from "@/lib/careers";
import { SITE } from "@/lib/site";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

export const revalidate = 300;

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

const title = "Careers — Join Yakimel Empire";
const description = "Open roles at Yakimel Empire LLC. Work remotely with a New York technology company building websites, apps and AI for small businesses.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/careers" },
  openGraph: { title, description, type: "website", siteName: SITE.name },
};

export default async function CareersPage() {
  const jobs = await openJobs();
  return (
    <main className="min-h-screen bg-bg-dark text-ink-invert">
      <header className="relative overflow-hidden border-b border-ink-invert/15 pb-16 pt-32 md:pt-40">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.66),transparent_65%)]" />
        <Reveal className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand">Careers</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-6xl">Build the future of small business with us.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-dim-invert md:text-lg">
            Yakimel Empire builds websites, online stores, apps and AI tools for small businesses in the United States,
            Haiti and the diaspora. Join a small team that moves fast.
          </p>
        </Reveal>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="font-display text-2xl font-semibold md:text-3xl">Open roles</h2>
        {jobs.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-ink-invert/15 bg-surface/60 p-8 text-center">
            <p className="font-medium">No open roles right now.</p>
            <p className="mt-2 text-sm text-dim-invert">
              Want to work with us anyway? Write to{" "}
              <a href={`mailto:${SITE.email}`} className="text-brand hover:underline">
                {SITE.email}
              </a>
              .
            </p>
          </div>
        ) : (
          <RevealGroup className="mt-8 space-y-5">
            {jobs.map((job) => (
              <RevealItem key={job.id}>
                <article className="rounded-2xl border border-ink-invert/15 bg-white p-6 shadow-[0_18px_40px_-32px_rgba(14,59,50,0.5)] md:p-8">
                  {job.team && <p className="font-mono text-xs uppercase tracking-widest text-brand">{job.team}</p>}
                  <h3 className="mt-2 text-balance break-words font-display text-xl font-semibold md:text-2xl">
                    <Link href={`/careers/${job.slug}`} className={`rounded hover:text-brand ${focus}`}>
                      {job.title}
                    </Link>
                  </h3>
                  {job.summary && <p className="mt-3 max-w-2xl leading-relaxed text-ink-invert/85">{job.summary}</p>}
                  <ul className="mt-4 flex flex-wrap gap-2 text-sm" aria-label="Role details">
                    {jobFacts(job).map((fact) => (
                      <li key={fact} className="rounded-full border border-ink-invert/15 bg-bg-dark/50 px-3.5 py-1 text-ink-invert">
                        {fact}
                      </li>
                    ))}
                  </ul>
                  {job.compensation && (
                    <p className="mt-4 flex items-start gap-2 font-semibold text-brand">
                      <Wallet size={18} aria-hidden="true" className="mt-0.5 shrink-0" /> {job.compensation}
                    </p>
                  )}
                  <Link
                    href={`/careers/${job.slug}`}
                    aria-label={`View role and apply: ${job.title}`}
                    className={`group mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark ${focus}`}
                  >
                    View Role &amp; Apply
                    <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                  </Link>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>
    </main>
  );
}
