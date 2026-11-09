import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { Badge, Card, EmptyState, PageHeader, Table, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { APPLICATION_STATUSES, APPLICATION_TONES, formatDate, humanize, timeAgo } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";

type Status = (typeof APPLICATION_STATUSES)[number];

export default async function HiringPage({ searchParams }: { searchParams: Promise<{ tab?: string; status?: string; job?: string }> }) {
  await requireUser("employees");
  const params = await searchParams;
  const tab = params.tab === "jobs" ? "jobs" : "applications";
  const status = APPLICATION_STATUSES.find((s) => s === params.status) as Status | undefined;

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
  const newCount = (await db.select({ n: count() }).from(t.jobApplications).where(eq(t.jobApplications.status, "NEW")))[0].n;
  const qs = (extra: Record<string, string | undefined>) => {
    const q = new URLSearchParams(Object.entries({ job: params.job, status, ...extra }).filter(([, v]) => v) as [string, string][]);
    return `/admin/hiring${q.size ? `?${q}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Hiring"
        description="Job posts on yakimelempire.com/careers and the people who apply."
        action={
          <Link href="/admin/hiring/jobs/new" className={primaryButton}>
            New job
          </Link>
        }
      />

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
            {[undefined, ...APPLICATION_STATUSES].map((s) => (
              <Link
                key={s ?? "all"}
                href={qs({ status: s })}
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  s === status ? "bg-os-accent text-white" : "border border-os-ink/15 text-os-muted hover:text-os-ink"
                }`}
              >
                {s ? humanize(s) : "All"}
              </Link>
            ))}
            {params.job && (
              <Link href={qs({ job: undefined })} className="ml-2 text-sm text-os-accent hover:underline">
                {jobs.find((j) => j.id === params.job)?.title ?? "Job"} ✕
              </Link>
            )}
          </div>
          {applications.length === 0 ? (
            <EmptyState
              title="No applications here"
              body={jobs.some((j) => j.status === "OPEN") ? "Share yakimelempire.com/careers to get applicants." : "Open a job (Jobs tab) to publish it on yakimelempire.com/careers."}
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
