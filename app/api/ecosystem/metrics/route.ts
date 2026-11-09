import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { cleanMetrics } from "@/lib/admin/appChecks";
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

  const metrics = cleanMetrics((body as { metrics?: unknown })?.metrics);
  if (!metrics) return NextResponse.json({ error: 'Send { "metrics": { "name": number or short text, … } }' }, { status: 400 });

  await db.insert(t.appMetricSnapshots).values({ appId: app.id, metrics });
  await db.update(t.apps).set({ health: "UP", checkedAt: new Date(), lastError: null, downSince: null }).where(eq(t.apps.id, app.id));
  return NextResponse.json({ ok: true, app: app.slug });
}
