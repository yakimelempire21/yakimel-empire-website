import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, tables as t } from "@/lib/db";

export type AppWithMetrics = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  status: "LIVE" | "DEVELOPMENT" | "MAINTENANCE" | "OFFLINE";
  progressPercent: number | null;
  connected: boolean;
  metrics: Record<string, unknown> | null;
  reportedAt: Date | null;
};

/** Every app with its most recent metrics snapshot (if the app has reported). */
export async function appsWithLatestMetrics(): Promise<AppWithMetrics[]> {
  const apps = await db.query.apps.findMany({
    orderBy: (a, { asc }) => [asc(a.name)],
    with: { metrics: { orderBy: desc(t.appMetricSnapshots.capturedAt), limit: 1 } },
  });
  return apps.map((a) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    domain: a.domain,
    status: a.status,
    progressPercent: a.progressPercent,
    connected: Boolean(a.apiKeyHash),
    metrics: (a.metrics[0]?.metrics as Record<string, unknown> | undefined) ?? null,
    reportedAt: a.metrics[0]?.capturedAt ?? null,
  }));
}

export async function appBySlug(slug: string) {
  return db.query.apps.findFirst({ where: eq(t.apps.slug, slug), with: { department: true } });
}

/** Sums a numeric metric (e.g. "users") across the latest report of every app. */
export function sumMetric(apps: AppWithMetrics[], key: string): number | null {
  const values = apps.map((a) => a.metrics?.[key]).filter((v): v is number => typeof v === "number");
  return values.length ? values.reduce((s, v) => s + v, 0) : null;
}
