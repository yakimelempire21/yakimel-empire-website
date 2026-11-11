import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { Badge, Card, EmptyState, PageHeader, Table, primaryButton, secondaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { APPLICATION_STATUSES, APPLICATION_TONES, formatDate, humanize, timeAgo } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";
import StageSelect from "./StageSelect";

type Status = (typeof APPLICATION_STATUSES)[number];

export default async function HiringPage({ searchParams }: { searchParams: Promise<{ tab?: string; status?: string; job?: string; view?: string }> }) {
  await requireUser("employees");
  const params = await searchParams;
  const tab = params.tab === "jobs" ? "jobs" : "applications";
  const status = APPLICATION_STATUSES.find((s) => s === params.status) as Status | undefined;
  const view = params.view === "list" ? "list" : "board";

  const [jobs, perJob, applications] = await Promise.all([
    db.select().from(t.jobs).orderBy(desc(t.jobs.createdAt)),
    db.select({ jobId: t.jobApplications.jobId, n: count() }).from(t.jobApplications).groupBy(t.jobApplications.jobId),
    db.query.jobApplications.findMany({
      where: (a, { and, eq: e }) => and(status ? e(a.status, status) : undefined, params.job ? e(a.jobId, params.job) : undefined),
      orderBy: desc(t.jobApplications.createdAt),
      limit: 300,
      with: { job: { columns: { title: true } } },
    }),
  ]);
  const counts = new Map(perJob.map((p) => [p.jobId, p.n]));
  const perStage = await db
    .select({ status: t.jobApplications.status, n: count() })
    .from(t.jobApplications)
    .where(params.job ? eq(t.jobApplications.jobId, params.job) : undefined)
    .groupBy(t.jobApplications.status);
  const stageCounts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, perStage.find((p) => p.status === s)?.n ?? 0])) as Record<Status, number>;
  const totalApplicants = APPLICATION_STATUSES.reduce((sum, s) => sum + stageCounts[s], 0);
  const newCount = stageCounts.NEW;
  const qs = (extra: Record<string, string | undefined>) => {
    const q = new URLSearchParams(Object.entries({ job: params.job, status, view: view === "list" ? "list" : undefined, ...extra }).filter(([, v]) => v) as [string, string][]);
    return `/admin/hiring${q.size ? `?${q}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Hiring"
        description="Job posts on yakimelempire.com/careers and the people who apply."
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/hiring/applications/new${params.job ? `?job=${params.job}` : ""}`} className={secondaryButton}>
              Add applicant
            </Link>
            <Link href="/admin/hiring/jobs/new" className={primaryButton}>
              New job
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[
          { label: "Open jobs", value: jobs.filter((j) => j.status === "OPEN").length },
          { label: "Applicants", value: totalApplicants },
          { label: "New", value: stageCounts.NEW },
          { label: "Interviewing", value: stageCounts.INTERVIEW + stageCounts.OFFER },
          { label: "Hired", value: stageCounts.HIRED },
        ].map((x) => (
          <Card key={x.label} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-os-muted">{x.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-os-ink">{x.value}</p>
          </Card>
        ))}
      </div>

      <div className="mb-6 flex gap-6 border-b border-os-ink/10 text-sm">
        {[
          { id: "applications", label: `Applications${newCount ? ` (${newCount} new)` : ""}`, href: "/admin/hiring" },
          { id: "jobs", label: `Jobs (${jobs.length})`, href: "/admin/hiring?tab=jobs" },
        ].map((x) => (
          <Link
            key={x.id}
            href={x.href}
            className={`-mb-px border-b-2 pb-3 ${tab === x.id ? "border-os-ink font-semibold text-os-ink" : "border-transparent text-os-muted hover:text-os-ink"}`}
          >
            {x.label}
          </Link>
        ))}
      </div>

      {tab === "jobs" ? (
        jobs.length === 0 ? (
          <EmptyState title="No jobs yet" body="Create a job post. When it's Open, it appears on yakimelempire.com/careers." />
        ) : (
          <Table head={["Job", "Status", "Applications", "Location", "Created"]}>
            {jobs.map((j) => (
              <tr key={j.id} className="hover:bg-os-ink/[0.03]">
                <td className="px-5 py-3.5">
                  <Link href={`/admin/hiring/jobs/${j.id}`} className="font-medium hover:text-os-accent">
                    {j.title}
                  </Link>
                  <p className="text-xs text-os-muted">{j.team ?? "—"}</p>
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone={j.status === "OPEN" ? "green" : j.status === "DRAFT" ? "amber" : "gray"}>{humanize(j.status)}</Badge>
                </td>
                <td className="px-5 py-3.5">
                  <Link href={`/admin/hiring?job=${j.id}`} className="hover:text-os-accent">
                    {counts.get(j.id) ?? 0}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-os-muted">{j.location ?? "—"}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-os-muted">{formatDate(j.createdAt)}</td>
              </tr>
            ))}
          </Table>
        )
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <div className="mr-2 inline-flex rounded-full border border-os-ink/15 bg-white p-0.5 text-sm">
              {(["board", "list"] as const).map((v) => (
                <Link
                  key={v}
                  href={qs({ view: v === "list" ? "list" : undefined, status: v === "board" ? undefined : status })}
                  className={`rounded-full px-3.5 py-1 ${view === v ? "bg-os-ink text-white" : "text-os-muted hover:text-os-ink"}`}
                >
                  {v === "board" ? "Pipeline" : "List"}
                </Link>
              ))}
            </div>
            {view === "list" &&
              [undefined, ...APPLICATION_STATUSES].map((s) => (
                <Link
                  key={s ?? "all"}
                  href={qs({ status: s })}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    s === status ? "bg-os-accent text-white" : "border border-os-ink/15 text-os-muted hover:text-os-ink"
                  }`}
                >
                  {s ? `${humanize(s)} (${stageCounts[s]})` : `All (${totalApplicants})`}
                </Link>
              ))}
            {jobs.length > 1 && (
              <form action="/admin/hiring" className="ml-auto">
                {view === "list" && <input type="hidden" name="view" value="list" />}
                <label className="sr-only" htmlFor="job-filter">Job</label>
                <select id="job-filter" name="job" defaultValue={params.job ?? ""} className="rounded-full border border-os-ink/15 bg-white px-3 py-1.5 text-sm">
                  <option value="">All jobs</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
                <button type="submit" className="ml-2 text-sm text-os-accent hover:underline">Filter</button>
              </form>
            )}
            {params.job && (
              <Link href={qs({ job: undefined })} className="text-sm text-os-accent hover:underline">
                {jobs.find((j) => j.id === params.job)?.title ?? "Job"} ✕
              </Link>
            )}
          </div>
          {applications.length === 0 && !status ? (
            <EmptyState
              title="No applicants yet"
              body={jobs.some((j) => j.status === "OPEN") ? "Share yakimelempire.com/careers, or add someone by hand with “Add applicant”." : "Open a job (Jobs tab) to publish it on yakimelempire.com/careers, or add someone by hand with “Add applicant”."}
            />
          ) : view === "board" ? (
            <div className="-mx-1 overflow-x-auto pb-3">
              <div className="grid min-w-[1080px] grid-cols-6 gap-3 px-1">
                {APPLICATION_STATUSES.map((s) => {
                  const list = applications.filter((a) => a.status === s);
                  return (
                    <section key={s} aria-label={humanize(s)} className="flex min-h-[260px] flex-col rounded-2xl border border-os-ink/10 bg-os-ink/[0.03] p-2.5">
                      <header className="mb-2 flex items-center justify-between px-1.5 pt-1">
                        <Badge tone={APPLICATION_TONES[s]}>{humanize(s)}</Badge>
                        <span className="text-xs font-semibold text-os-muted">{stageCounts[s]}</span>
                      </header>
                      <ul className="space-y-2">
                        {list.map((a) => (
                          <li key={a.id} className="rounded-xl border border-os-ink/10 bg-white p-3 shadow-[0_6px_16px_-12px_rgba(14,59,50,0.35)]">
                            <Link href={`/admin/hiring/applications/${a.id}`} className="block font-semibold leading-snug text-os-ink hover:text-os-accent">
                              {a.fullName}
                            </Link>
                            <p className="mt-0.5 truncate text-xs text-os-muted">{a.job?.title}</p>
                            <p className="mb-2 mt-0.5 text-xs text-os-faint">
                              {a.location ? `${a.location} · ` : ""}
                              {timeAgo(a.createdAt)}
                            </p>
                            <StageSelect id={a.id} status={a.status} name={a.fullName} />
                          </li>
                        ))}
                        {list.length === 0 && <li className="px-1.5 py-4 text-center text-xs text-os-faint">Nobody here</li>}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>
          ) : null}
          {view === "board" || (applications.length === 0 && !status) ? null : applications.length === 0 ? (
            <EmptyState
              title="No applications here"
              body="Nobody is at this stage right now."
            />
          ) : (
            <Table head={["Applicant", "Job", "Location", "Status", "Applied"]}>
              {applications.map((a) => (
                <tr key={a.id} className="hover:bg-os-ink/[0.03]">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/hiring/applications/${a.id}`} className="font-medium hover:text-os-accent">
                      {a.fullName}
                    </Link>
                    <p className="text-xs text-os-muted">{a.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-os-muted">{a.job?.title}</td>
                  <td className="px-5 py-3.5 text-os-muted">{a.location ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={APPLICATION_TONES[a.status]}>{humanize(a.status)}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-os-muted">{timeAgo(a.createdAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </>
      )}
      <Card className="mt-6 p-5 text-sm text-os-muted">
        Public page: <span className="select-all font-mono text-os-ink">https://www.yakimelempire.com/careers</span>
      </Card>
    </>
  );
}
