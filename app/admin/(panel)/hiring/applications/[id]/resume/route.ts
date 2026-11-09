import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { audit, getCurrentUser } from "@/lib/admin/auth";
import { canAccess } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";
import { signedUrl, storageConfigured } from "@/lib/storage";

/** Checks permission, then redirects to a short-lived private link to the résumé. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (!canAccess(user.role, "employees")) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const a = await db.query.jobApplications.findFirst({ where: eq(t.jobApplications.id, (await params).id) });
  if (!a?.resumePath || !storageConfigured()) return NextResponse.json({ error: "No résumé" }, { status: 404 });
  await audit(user, "EXPORT", "job_application_resume", a.id);
  return NextResponse.redirect(await signedUrl(a.resumePath, a.resumeName));
}
