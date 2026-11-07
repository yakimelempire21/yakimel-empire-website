"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { and, eq, isNull, ne } from "drizzle-orm";
import { audit, hashPassword, requireUser, SESSION_COOKIE } from "@/lib/admin/auth";
import { db, tables as t } from "@/lib/db";

export type PasswordState = { error?: string; saved?: boolean } | undefined;

export async function changePassword(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  const user = await requireUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (next.length < 12) return { error: "The new password must be at least 12 characters." };
  if (next !== confirm) return { error: "The new passwords don't match." };

  const row = await db.query.users.findFirst({ where: eq(t.users.id, user.id) });
  if (!row || !(await bcrypt.compare(current, row.passwordHash))) return { error: "Your current password is incorrect." };

  await db.update(t.users).set({ passwordHash: await hashPassword(next) }).where(eq(t.users.id, user.id));

  // Sign out every other device; keep this one.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const thisSession = token ? createHash("sha256").update(token).digest("hex") : "";
  await db
    .update(t.sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(t.sessions.userId, user.id), isNull(t.sessions.revokedAt), ne(t.sessions.tokenHash, thisSession)));

  await audit(user, "UPDATE", "password", user.id);
  return { saved: true };
}
