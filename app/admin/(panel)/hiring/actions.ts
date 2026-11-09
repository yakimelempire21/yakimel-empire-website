"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { audit, requireUser } from "@/lib/admin/auth";
import { APPLICATION_STATUSES, str } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";

export type JobFormState = { error?: string; saved?: boolean } | undefined;

const JOB_STATUSES = ["DRAFT", "OPEN", "CLOSED"] as const;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "role";

function refreshCareers(slug?: string) {
  revalidatePath("/careers");
  if (slug) revalidatePath(`/careers/${slug}`);
  revalidatePath("/admin/hiring");
}

/** Creates (id = null) or updates a job post. */
export async function saveJob(id: string | null, _prev: JobFormState, form: FormData): Promise<JobFormState> {
  const user = await requireUser("employees");
  const title = str(form, "title");
  const description = str(form, "description");
  if (!title || !description) return { error: "Title and description are required." };
  const status = JOB_STATUSES.find((s) => s === str(form, "status")) ?? "DRAFT";

  const values = {
    title: title.slice(0, 120),
    team: str(form, "team"),
    location: str(form, "location"),
    employmentType: str(form, "employmentType"),
    compensation: str(form, "compensation"),
    summary: str(form, "summary"),
    description,
    responsibilities: str(form, "responsibilities"),
    requirements: str(form, "requirements"),
    status,
  };

  if (id) {
    const current = await db.query.jobs.findFirst({ where: eq(t.jobs.id, id) });
    if (!current) return { error: "This job no longer exists." };
    await db
      .update(t.jobs)
      .set({ ...values, publishedAt: status === "OPEN" ? (current.publishedAt ?? new Date()) : current.publishedAt })
      .where(eq(t.jobs.id, id));
    await audit(user, "UPDATE", "job", id, { status });
    refreshCareers(current.slug);
    return { saved: true };
  }

  let slug = slugify(title);
  if (await db.query.jobs.findFirst({ where: eq(t.jobs.slug, slug), columns: { id: true } })) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  const [job] = await db
    .insert(t.jobs)
    .values({ ...values, slug, publishedAt: status === "OPEN" ? new Date() : null })
    .returning({ id: t.jobs.id });
  await audit(user, "CREATE", "job", job.id);
  refreshCareers(slug);
  redirect(`/admin/hiring/jobs/${job.id}?saved=1`);
}

export async function updateApplication(id: string, form: FormData) {
  const user = await requireUser("employees");
  const status = APPLICATION_STATUSES.find((s) => s === str(form, "status"));
  const notes = form.has("notes") ? (str(form, "notes") ?? null) : undefined;
  await db
    .update(t.jobApplications)
    .set({ ...(status ? { status } : {}), ...(notes !== undefined ? { notes } : {}) })
    .where(eq(t.jobApplications.id, id));
  await audit(user, "UPDATE", "job_application", id, { status });
  revalidatePath("/admin/hiring");
  revalidatePath(`/admin/hiring/applications/${id}`);
}
