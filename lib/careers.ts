import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db, tables as t } from "@/lib/db";

export type Job = typeof t.jobs.$inferSelect;

/** Open roles for yakimelempire.com/careers. Never throws: a database problem shows "no open roles". */
export async function openJobs(): Promise<Job[]> {
  try {
    return await db.select().from(t.jobs).where(eq(t.jobs.status, "OPEN")).orderBy(desc(t.jobs.publishedAt));
  } catch (error) {
    console.error("[careers] could not load jobs:", (error as Error).message);
    return [];
  }
}

export async function openJobBySlug(slug: string): Promise<Job | null> {
  try {
    const [job] = await db
      .select()
      .from(t.jobs)
      .where(and(eq(t.jobs.slug, slug), eq(t.jobs.status, "OPEN")))
      .limit(1);
    return job ?? null;
  } catch (error) {
    console.error("[careers] could not load job:", (error as Error).message);
    return null;
  }
}

/** One item per non-empty line (job descriptions keep lists as plain lines). */
export const lines = (text: string | null | undefined) =>
  (text ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

export const RESUME_TYPES = /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;

/** FAQ text → [{ q, a }]: blocks separated by a blank line, first line is the question. */
export const faqItems = (text: string | null | undefined) =>
  (text ?? "")
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean))
    .filter((b) => b.length >= 2)
    .map(([q, ...a]) => ({ q, a: a.join(" ") }));

/** Short facts shown as chips: location plus each "·"-separated part of the employment type. */
export const jobFacts = (job: { location: string | null; employmentType: string | null }) =>
  [job.location, ...(job.employmentType ?? "").split("·")].map((s) => s?.trim()).filter((s): s is string => Boolean(s));

/** Applicant files we accept. Checked by extension, declared type and the file's first bytes. */
export const RESUME_MAX_LABEL = "4 MB";
export const RESUME_EXTENSIONS = /\.(pdf|docx?)$/i;
