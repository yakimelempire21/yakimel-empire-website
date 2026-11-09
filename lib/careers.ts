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
