import { desc } from "drizzle-orm";
import { Card, EmptyState, PageHeader, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { db, tables as t } from "@/lib/db";
import ApplicantForm from "./ApplicantForm";

export default async function NewApplicantPage({ searchParams }: { searchParams: Promise<{ job?: string }> }) {
  await requireUser("employees");
  const jobs = await db.select({ id: t.jobs.id, title: t.jobs.title }).from(t.jobs).orderBy(desc(t.jobs.createdAt));
  const { job } = await searchParams;
  return (
    <>
      <PageHeader
        title="Add applicant"
        description="For someone who applied by WhatsApp, email or referral instead of the website."
        back={{ href: "/admin/hiring", label: "Hiring" }}
      />
      {jobs.length === 0 ? (
        <EmptyState
          title="Create a job first"
          body="Applicants are tracked per job."
          action={
            <a href="/admin/hiring/jobs/new" className={primaryButton}>
              New job
            </a>
          }
        />
      ) : (
        <Card className="max-w-3xl p-6">
          <ApplicantForm jobs={jobs} jobId={jobs.some((j) => j.id === job) ? job : undefined} />
        </Card>
      )}
    </>
  );
}
