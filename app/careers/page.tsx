import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { openJobs } from "@/lib/careers";
import { SITE } from "@/lib/site";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

export const revalidate = 300;

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
          <RevealGroup className="mt-8 space-y-4">
            {jobs.map((job) => (
              <RevealItem key={job.id}>
                <Link
                  href={`/careers/${job.slug}`}
                  className="group flex flex-col gap-4 rounded-2xl border border-ink-invert/15 bg-surface/60 p-6 transition-colors hover:border-brand/60 sm:flex-row sm:items-center sm:justify-between md:p-8"
                >
                  <div>
                    {job.team && <p className="font-mono text-xs uppercase tracking-widest text-brand">{job.team}</p>}
                    <h3 className="mt-2 font-display text-xl font-semibold md:text-2xl">{job.title}</h3>
                    {job.summary && <p className="mt-2 max-w-xl text-sm text-dim-invert">{job.summary}</p>}
                    <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-dim-invert">
                      {job.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} aria-hidden="true" /> {job.location}
                        </span>
                      )}
                      {job.employmentType && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={14} aria-hidden="true" /> {job.employmentType}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-ink-invert">
                    View role <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>
    </main>
  );
}
