import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { audit, getCurrentUser } from "@/lib/admin/auth";
import { canAccess } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";
import { signedUrl, storageConfigured } from "@/lib/storage";

/** Checks permission, then redirects to a short-lived private download link. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));
  if (!canAccess(user.role, "documents")) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const { id } = await params;
  const doc = await db.query.documents.findFirst({ where: eq(t.documents.id, id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (doc.storagePath && storageConfigured()) {
    await audit(user, "EXPORT", "document", doc.id);
    return NextResponse.redirect(await signedUrl(doc.storagePath, doc.fileName));
  }
  if (doc.externalUrl) return NextResponse.redirect(doc.externalUrl);
  return NextResponse.json({ error: "This document has no file." }, { status: 404 });
}
