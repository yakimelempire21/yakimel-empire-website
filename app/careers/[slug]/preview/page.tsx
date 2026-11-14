import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Eye, Pencil } from "lucide-react";
import { requireUser } from "@/lib/admin/auth";
import { db, tables as t } from "@/lib/db";
import JobView from "../JobView";

export const metadata: Metadata = { title: "Job preview | Yakimel Empire", robots: { index: false, follow: false } };

/** What a job looks like on the website, for the team (works for drafts and closed jobs too). */
export default async function JobPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser("employees");
  const [job] = await db.select().from(t.jobs).where(eq(t.jobs.slug, (await params).slug)).limit(1);
  if (!job) notFound();
  const live = job.status === "OPEN";

  return (
    <JobView
      job={job}
      preview={
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Eye size={16} aria-hidden="true" />
            <span>
              <strong>Team preview.</strong>{" "}
              {live ? "This job is live on the website." : `This job is ${job.status === "DRAFT" ? "a draft" : "closed"}: only the team can see this page.`}
            </span>
          </p>
          <div className="flex gap-2">
            <Link
              href={`/admin/hiring/jobs/${job.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:bg-brand-dark"
            >
              <Pencil size={13} aria-hidden="true" /> Edit job
            </Link>
            {live && (
              <Link href={`/careers/${job.slug}`} className="rounded-full border border-amber-400 px-4 py-2 text-xs font-semibold hover:bg-amber-100">
                Public page
              </Link>
            )}
          </div>
        </div>
      }
    />
  );
}
