import { notFound } from "next/navigation";
import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { APPLICATION_STATUSES, APPLICATION_TONES, humanize } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";
import JobForm from "../../JobForm";

export default async function EditJobPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireUser("employees");
  const job = await db.query.jobs.findFirst({ where: eq(t.jobs.id, (await params).id) });
  if (!job) notFound();
  const saved = (await searchParams).saved === "1";
  const perStage = await db
    .select({ status: t.jobApplications.status, n: count() })
    .from(t.jobApplications)
    .where(eq(t.jobApplications.jobId, job.id))
    .groupBy(t.jobApplications.status);
  const total = perStage.reduce((sum, p) => sum + p.n, 0);
  return (
    <>
      <PageHeader
        title={job.title}
        back={{ href: "/admin/hiring?tab=jobs", label: "Hiring" }}
        action={
          <div className="flex items-center gap-3">
            {job.status === "OPEN" && (
              <a href={`/careers/${job.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-os-muted hover:text-os-ink">
                View on website ↗
              </a>
            )}
            <Badge tone={job.status === "OPEN" ? "green" : job.status === "DRAFT" ? "amber" : "gray"}>{humanize(job.status)}</Badge>
          </div>
        }
      />
      {saved && <p className="mb-4 rounded-xl bg-emerald-100 px-4 py-3 text-sm text-emerald-700">Job created.</p>}
      <Card className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
        <p className="font-display text-lg font-bold">
          {total} applicant{total === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap gap-2">
          {APPLICATION_STATUSES.map((s) => (
            <Badge key={s} tone={APPLICATION_TONES[s]}>
              {humanize(s)}: {perStage.find((p) => p.status === s)?.n ?? 0}
            </Badge>
          ))}
        </div>
        <div className="ml-auto flex gap-4 text-sm">
          <Link href={`/admin/hiring?job=${job.id}`} className="text-os-accent hover:underline">
            See pipeline →
          </Link>
          <Link href={`/admin/hiring/applications/new?job=${job.id}`} className="text-os-accent hover:underline">
            Add applicant
          </Link>
        </div>
      </Card>
      <Card className="p-6">
        <JobForm job={job} />
      </Card>
    </>
  );
}
