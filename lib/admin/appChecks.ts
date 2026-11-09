import "server-only";
import { createHmac } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, tables as t } from "@/lib/db";
import { notifyArea } from "./notify";

/**
 * Automatic checks of the Yakimel apps (run by the cron every 15 minutes and by "Refresh now").
 *
 * For each app with a domain or a metrics URL, YAKIMEL OS:
 *  1. asks the app for its numbers  →  GET <metrics URL> with "Authorization: Bearer <connection token>"
 *  2. if that fails, checks that the app's website still answers
 * and notifies the team when an app goes offline or comes back.
 */

type App = typeof t.apps.$inferSelect;
export type CheckResult = { slug: string; health: "UP" | "DOWN" | "SKIPPED"; metrics: boolean; error?: string };

const TIMEOUT_MS = 10_000;

function secret(): string | null {
  return process.env.ECOSYSTEM_SECRET?.trim() || process.env.CRON_SECRET?.trim() || null;
}

/** The token an app must expect from YAKIMEL OS (set it as YAKIMEL_OS_TOKEN in the app). Derived, never stored. */
export function connectionToken(appId: string): string | null {
  const s = secret();
  if (!s) return null;
  return `yk_conn_${createHmac("sha256", s).update(`ecosystem:${appId}`).digest("base64url")}`;
}

export function metricsUrlFor(app: Pick<App, "metricsUrl" | "domain">): string | null {
  if (app.metricsUrl) return app.metricsUrl;
  return app.domain ? `https://${app.domain}/api/yakimel-os/metrics` : null;
}

/** Same rules as the push endpoint: up to 30 flat keys, numbers or short text. */
export function cleanMetrics(raw: unknown): Record<string, number | string> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const metrics: Record<string, number | string> = {};
  for (const [k, v] of Object.entries(raw).slice(0, 30)) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(k)) continue;
    if (typeof v === "number" && Number.isFinite(v)) metrics[k] = v;
    else if (typeof v === "string") metrics[k] = v.slice(0, 80);
  }
  return Object.keys(metrics).length ? metrics : null;
}

async function siteAnswers(domain: string): Promise<boolean> {
  try {
    const res = await fetch(`https://${domain}/`, { method: "GET", redirect: "follow", cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    return res.status < 500;
  } catch {
    return false;
  }
}

export async function checkApp(app: App): Promise<CheckResult> {
  const url = metricsUrlFor(app);
  if (!url) return { slug: app.slug, health: "SKIPPED", metrics: false };

  let metricsOk = false;
  let error: string | undefined;
  const token = connectionToken(app.id);
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) {
      const metrics = cleanMetrics(((await res.json().catch(() => null)) as { metrics?: unknown } | null)?.metrics);
      if (metrics) {
        await db.insert(t.appMetricSnapshots).values({ appId: app.id, metrics });
        metricsOk = true;
      } else error = "The app answered without numbers";
    } else if (res.status === 401 || res.status === 403) error = "Connection token not accepted — check YAKIMEL_OS_TOKEN in the app";
    else if (res.status === 404) error = "The app doesn't have the YAKIMEL OS connection yet";
    else error = `The app answered with error ${res.status}`;
  } catch (e) {
    error = (e as Error).name === "TimeoutError" ? "No answer within 10 seconds" : "Could not reach the app";
  }

  // Numbers received → online. Otherwise the app is online if its website still answers.
  const up = metricsOk || (app.domain ? await siteAnswers(app.domain) : false);
  const health = up ? "UP" : "DOWN";
  const now = new Date();

  await db
    .update(t.apps)
    .set({
      health,
      checkedAt: now,
      lastError: error ?? null,
      downSince: health === "DOWN" ? (app.health === "DOWN" && app.downSince ? app.downSince : now) : null,
    })
    .where(eq(t.apps.id, app.id));

  // Tell the team only when something changes.
  if (app.health === "UP" && health === "DOWN") {
    await notifyArea("apps", { kind: "SYSTEM", title: `${app.name} is offline`, body: error ?? "The app is not answering.", href: `/admin/apps/${app.slug}` });
  } else if (app.health === "DOWN" && health === "UP") {
    await notifyArea("apps", { kind: "SYSTEM", title: `${app.name} is back online`, href: `/admin/apps/${app.slug}` });
  }

  return { slug: app.slug, health, metrics: metricsOk, error };
}

export async function checkAllApps(): Promise<CheckResult[]> {
  const apps = await db.select().from(t.apps);
  return Promise.all(apps.map((a) => checkApp(a).catch((e) => ({ slug: a.slug, health: "DOWN" as const, metrics: false, error: (e as Error).message }))));
}
