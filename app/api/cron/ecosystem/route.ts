import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { checkAllApps } from "@/lib/admin/appChecks";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Every 15 minutes (vercel.json → crons) YAKIMEL OS checks each app and collects its numbers.
 * Vercel Cron sends "Authorization: Bearer <CRON_SECRET>"; without CRON_SECRET this route refuses to run.
 */
function authorized(request: Request): boolean | null {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return null;
  const got = Buffer.from(request.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

export async function GET(request: Request) {
  const ok = authorized(request);
  if (ok === null) return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const results = await checkAllApps();
  return NextResponse.json({ ran: true, results }, { headers: { "Cache-Control": "no-store" } });
}
