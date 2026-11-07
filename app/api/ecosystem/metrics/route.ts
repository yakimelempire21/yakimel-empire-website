import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { databaseConfigured, db, tables as t } from "@/lib/db";

/**
 * Ecosystem gateway: each Yakimel app reports its numbers here.
 *
 *   POST /api/ecosystem/metrics
 *   Authorization: Bearer yk_live_…   (created in YAKIMEL OS → app → Connect)
 *   { "metrics": { "users": 12450, "orders": 327, "revenue": 4820.5, "errors": 0 } }
 */
export async function POST(request: Request) {
  if (!databaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const token = request.headers.get("authorization")?.match(/^Bearer\s+(yk_live_[A-Za-z0-9_-]{20,})$/)?.[1];
  if (!token) return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 });

  const app = await db.query.apps.findFirst({
    where: eq(t.apps.apiKeyHash, createHash("sha256").update(token).digest("hex")),
    columns: { id: true, slug: true },
  });
  if (!app) return NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const raw = (body as { metrics?: unknown })?.metrics;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return NextResponse.json({ error: 'Send { "metrics": { "name": value, … } }' }, { status: 400 });
  }

  // Keep it small and flat: up to 30 keys, numbers or short strings.
  const metrics: Record<string, number | string> = {};
  for (const [k, v] of Object.entries(raw).slice(0, 30)) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(k)) continue;
    if (typeof v === "number" && Number.isFinite(v)) metrics[k] = v;
    else if (typeof v === "string") metrics[k] = v.slice(0, 80);
  }
  if (Object.keys(metrics).length === 0) return NextResponse.json({ error: "No valid metrics" }, { status: 400 });

  await db.insert(t.appMetricSnapshots).values({ appId: app.id, metrics });
  return NextResponse.json({ ok: true, app: app.slug });
}
