"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { audit, requireUser } from "@/lib/admin/auth";
import { str } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";

export async function setDocumentStatus(id: string, form: FormData) {
  const user = await requireUser("documents");
  const status = (["DRAFT", "SENT", "SIGNED", "EXPIRED", "ARCHIVED"] as const).find((s) => s === str(form, "status"));
  if (!status) return;
  await db
    .update(t.documents)
    .set({ status, ...(status === "SIGNED" ? { signedAt: new Date() } : {}) })
    .where(eq(t.documents.id, id));
  await audit(user, "UPDATE", "document", id, { status });
  revalidatePath("/admin/documents");
  revalidatePath("/admin/contracts");
}
