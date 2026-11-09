import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, MapPin, Wallet } from "lucide-react";
import { lines, openJobBySlug } from "@/lib/careers";
import { SITE } from "@/lib/site";
import ApplyForm from "./ApplyForm";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const job = await openJobBySlug((await params).slug);
  if (!job) return { title: "Careers | Yakimel Empire" };
  const title = `${job.title} — Careers at Yakimel Empire`;
  return { title, description: job.summary ?? undefined, openGraph: { title, description: job.summary ?? undefined, siteName: SITE.name } };
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const job = await openJobBySlug((await params).slug);
  if (!job) notFound();

  const sections = [
    { title: "What you'll do", items: lines(job.responsibilities) },
    { title: "What we're looking for", items: lines(job.requirements) },
  ].filter((s) => s.items.length > 0);

  // Structured data so the role can appear in Google's job search.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: [job.description, ...sections.map((s) => `${s.title}: ${s.items.join("; ")}`)].join("\n\n"),
    datePosted: (job.publishedAt ?? job.createdAt).toISOString().slice(0, 10),
    employmentType: "CONTRACTOR",
    hiringOrganization: { "@type": "Organization", name: SITE.name, sameAs: SITE.url },
    jobLocationType: /remote/i.test(job.location ?? "") ? "TELECOMMUTE" : undefined,
    applicantLocationRequirements: /remote/i.test(job.location ?? "") ? { "@type": "Country", name: "Worldwide" } : undefined,
  };

  return (
    <main className="min-h-screen bg-bg-dark text-ink-invert">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="relative overflow-hidden border-b border-white/10 pb-12 pt-32 md:pt-36">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(47,111,234,0.28),transparent_65%)]" />
        <div className="relative mx-auto max-w-4xl px-6">
          <Link href="/careers" className="text-sm text-dim-invert hover:text-ink-invert">
            ← All roles
          </Link>
          {job.team && <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-brand">{job.team}</p>}
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">{job.title}</h1>
          <ul className="mt-6 flex flex-wrap gap-3 text-sm">
            {[
              { icon: MapPin, text: job.location },
              { icon: Clock, text: job.employmentType },
              { icon: Wallet, text: job.compensation },
            ]
              .filter((x) => x.text)
              .map((x) => (
                <li key={x.text} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-dim-invert">
                  <x.icon size={14} aria-hidden="true" className="text-brand" /> {x.text}
                </li>
              ))}
          </ul>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[1.3fr_1fr]">
        <article className="space-y-10">
          <p className="whitespace-pre-line text-lg leading-relaxed text-ink-invert/90">{job.description}</p>
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-2xl font-semibold">{s.title}</h2>
              <ul className="mt-5 space-y-3">
                {s.items.map((item) => (
                  <li key={item} className="flex gap-3 text-dim-invert">
                    <Check size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </article>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-surface/70 p-6 md:p-7">
            <h2 className="font-display text-2xl font-semibold">Apply for this role</h2>
            <p className="mt-1 text-sm text-dim-invert">It takes about 3 minutes.</p>
            <ApplyForm jobId={job.id} />
          </div>
        </aside>
      </div>
    </main>
  );
}
