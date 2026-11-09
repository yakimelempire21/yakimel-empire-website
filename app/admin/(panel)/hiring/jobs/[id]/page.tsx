import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { humanize } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";
import JobForm from "../../JobForm";

export default async function EditJobPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireUser("employees");
  const job = await db.query.jobs.findFirst({ where: eq(t.jobs.id, (await params).id) });
  if (!job) notFound();
  const saved = (await searchParams).saved === "1";
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
      <Card className="p-6">
        <JobForm job={job} />
      </Card>
    </>
  );
}
