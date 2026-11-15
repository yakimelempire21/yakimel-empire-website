import Link from "next/link";
import { ArrowDown, Check, ShieldCheck, Wallet } from "lucide-react";
import { faqItems, jobFacts, lines, type Job } from "@/lib/careers";
import ApplyForm from "./ApplyForm";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** The job page body, shared by the public page and the team's preview. */
export default function JobView({ job, preview }: { job: Job; preview?: React.ReactNode }) {
  const sections = [
    { title: "What you'll do", items: lines(job.responsibilities) },
    { title: "What we're looking for", items: lines(job.requirements) },
  ].filter((s) => s.items.length > 0);
  const policy = lines(job.policy);
  const pay = lines(job.compensationDetails);
  const faq = faqItems(job.faq);
  const canApply = !preview || job.status === "OPEN";

  return (
    <main className="min-h-screen bg-bg-dark text-ink-invert">
      <header className="relative overflow-hidden border-b border-ink-invert/15 pb-12 pt-32 md:pt-36">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.62),transparent_65%)]" />
        <div className="relative mx-auto max-w-6xl px-6">
          {preview}
          <Link href="/careers" className={`rounded text-sm text-dim-invert hover:text-ink-invert ${focus}`}>
            ← All roles
          </Link>
          {job.team && <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em] text-brand">{job.team}</p>}
          <h1 className="mt-3 max-w-4xl text-balance break-words font-display text-[2.1rem] font-semibold leading-tight sm:text-4xl md:text-5xl">
            {job.title}
          </h1>
          <ul className="mt-6 flex flex-wrap gap-2.5 text-sm" aria-label="Role details">
            {jobFacts(job).map((fact) => (
              <li key={fact} className="rounded-full border border-ink-invert/20 bg-white/50 px-3 py-1 text-ink-invert sm:px-4 sm:py-1.5">
                {fact}
              </li>
            ))}
          </ul>
          {job.compensation && (
            <p className="mt-5 flex items-start gap-2 text-lg font-semibold text-brand">
              <Wallet size={20} aria-hidden="true" className="mt-1 shrink-0" />
              {job.compensation}
            </p>
          )}
          <a
            href="#apply"
            className={`mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-base font-semibold text-white shadow-[0_14px_30px_-14px_rgba(14,59,50,0.6)] transition-colors hover:bg-brand-dark ${focus}`}
          >
            Apply Now <ArrowDown size={18} aria-hidden="true" />
          </a>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[1.3fr_1fr]">
        <article className="min-w-0 space-y-10">
          <p className="whitespace-pre-line text-lg leading-relaxed text-ink-invert/90">{job.description}</p>

          {pay.length > 0 && (
            <section aria-labelledby="pay-title" className="rounded-2xl border-2 border-brand/25 bg-white p-6 shadow-[0_18px_40px_-30px_rgba(14,59,50,0.5)] md:p-8">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                <Wallet size={18} aria-hidden="true" /> Compensation
              </p>
              <h2 id="pay-title" className="mt-2 font-display text-2xl font-semibold md:text-3xl">
                {pay[0]}
              </h2>
              <ul className="mt-4 space-y-3 text-base leading-relaxed">
                {pay.slice(1).map((line) => (
                  <li key={line} className={/^example/i.test(line) ? "rounded-xl bg-bg-dark/60 px-4 py-3 font-medium" : ""}>
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-2xl font-semibold">{s.title}</h2>
              <ul className="mt-5 space-y-3">
                {s.items.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed text-ink-invert/85">
                    <Check size={18} aria-hidden="true" className="mt-1 shrink-0 text-brand" />
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

          {faq.length > 0 && (
            <section aria-labelledby="faq-title">
              <h2 id="faq-title" className="font-display text-2xl font-semibold">
                Questions
              </h2>
              <div className="mt-5 divide-y divide-ink-invert/15 rounded-2xl border border-ink-invert/15 bg-white/60">
                {faq.map((item) => (
                  <details key={item.q} className="group px-5 py-4 md:px-6">
                    <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 rounded font-medium ${focus}`}>
                      {item.q}
                      <span aria-hidden="true" className="text-xl leading-none text-brand transition-transform group-open:rotate-45 motion-reduce:transition-none">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 leading-relaxed text-ink-invert/85">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside id="apply" className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-ink-invert/15 bg-white p-6 shadow-[0_18px_40px_-30px_rgba(14,59,50,0.5)] md:p-7">
            <h2 className="break-words font-display text-2xl font-semibold">Apply for this role</h2>
            <p className="mt-1 text-sm text-dim-invert">It takes about 3 minutes.</p>
            {canApply ? (
              <ApplyForm jobId={job.id} />
            ) : (
              <p className="mt-5 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900">
                The form opens when this job is set to Open. Until then, people can&apos;t see or apply to it.
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
