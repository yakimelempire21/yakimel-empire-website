import Link from "next/link";
import { Check, Clock, MapPin, ShieldCheck, Wallet } from "lucide-react";
import { lines, type Job } from "@/lib/careers";
import ApplyForm from "./ApplyForm";

/** The job page body, shared by the public page and the team's preview. */
export default function JobView({ job, preview }: { job: Job; preview?: React.ReactNode }) {
  const sections = [
    { title: "What you'll do", items: lines(job.responsibilities) },
    { title: "What we're looking for", items: lines(job.requirements) },
  ].filter((s) => s.items.length > 0);
  const policy = lines(job.policy);

  return (
    <main className="min-h-screen bg-bg-dark text-ink-invert">
      <header className="relative overflow-hidden border-b border-ink-invert/15 pb-12 pt-32 md:pt-36">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.62),transparent_65%)]" />
        <div className="relative mx-auto max-w-4xl px-6">
          {preview}
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
                <li key={x.text} className="inline-flex items-center gap-2 rounded-full border border-ink-invert/15 bg-ink-invert/[0.04] px-4 py-1.5 text-dim-invert">
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
          {policy.length > 0 && (
            <section id="policies" className="rounded-2xl border border-ink-invert/15 bg-surface/70 p-6 md:p-8">
              <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
                <ShieldCheck size={22} aria-hidden="true" className="text-brand" /> Policies &amp; terms
              </h2>
              <p className="mt-1 text-sm text-dim-invert">By applying, you agree to these terms.</p>
              <ol className="mt-5 space-y-3">
                {policy.map((item, i) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-invert/85">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">{i + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </article>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-ink-invert/15 bg-surface/70 p-6 md:p-7">
            <h2 className="font-display text-2xl font-semibold">Apply for this role</h2>
            <p className="mt-1 text-sm text-dim-invert">It takes about 3 minutes.</p>
            {preview && job.status !== "OPEN" ? (
              <p className="mt-5 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-800">
                The form opens when this job is set to Open. Until then, people can&apos;t see or apply to it.
              </p>
            ) : (
              <ApplyForm jobId={job.id} />
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
