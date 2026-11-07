"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { audit, requireUser } from "@/lib/admin/auth";
import { db, tables as t } from "@/lib/db";

const STATUSES = ["LIVE", "DEVELOPMENT", "MAINTENANCE", "OFFLINE"] as const;

export async function updateApp(id: string, form: FormData) {
  const user = await requireUser("apps");
  const status = String(form.get("status") ?? "");
  const progressRaw = String(form.get("progress") ?? "").trim();
  const domain = String(form.get("domain") ?? "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "") || null;
  if (!(STATUSES as readonly string[]).includes(status)) return;
  const progress = progressRaw === "" ? null : Math.max(0, Math.min(100, Math.round(Number(progressRaw))));

  const [app] = await db
    .update(t.apps)
    .set({
      status: status as (typeof STATUSES)[number],
      progressPercent: progress === null || Number.isNaN(progress) ? null : progress,
      domain,
    })
    .where(eq(t.apps.id, id))
    .returning({ slug: t.apps.slug });
  await audit(user, "UPDATE", "app", id, { status, progress, domain });
  revalidatePath("/admin", "layout");
  if (app) revalidatePath(`/admin/apps/${app.slug}`);
}

export type KeyState = { key?: string; error?: string } | undefined;

/** Creates (or replaces) the app's API key. The key is shown once and only its hash is stored. */
export async function generateApiKey(id: string, _prev: KeyState): Promise<KeyState> {
  const user = await requireUser("apps");
  if (!["SUPER_ADMIN", "EXECUTIVE", "DEVELOPER"].includes(user.role)) {
    return { error: "Only an Owner, Executive Admin or Developer can create API keys." };
  }
  const key = `yk_live_${randomBytes(24).toString("base64url")}`;
  await db
    .update(t.apps)
    .set({ apiKeyHash: createHash("sha256").update(key).digest("hex") })
    .where(eq(t.apps.id, id));
  await audit(user, "PERMISSION_CHANGE", "app_api_key", id, { action: "generated" });
  revalidatePath("/admin/apps");
  return { key };
}

export async function revokeApiKey(id: string) {
  const user = await requireUser("apps");
  if (!["SUPER_ADMIN", "EXECUTIVE", "DEVELOPER"].includes(user.role)) return;
  const [app] = await db.update(t.apps).set({ apiKeyHash: null }).where(eq(t.apps.id, id)).returning({ slug: t.apps.slug });
  await audit(user, "PERMISSION_CHANGE", "app_api_key", id, { action: "revoked" });
  if (app) revalidatePath(`/admin/apps/${app.slug}`);
}
