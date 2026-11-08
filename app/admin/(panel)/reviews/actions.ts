"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { audit, requireUser } from "@/lib/admin/auth";
import { str } from "@/lib/admin/format";
import { REVIEW_PAGES } from "@/lib/reviews";
import { db, tables as t } from "@/lib/db";

export type ReviewFormState = { error?: string; ok?: boolean } | undefined;

function refresh() {
  revalidatePath("/admin/reviews");
  for (const page of REVIEW_PAGES) revalidatePath(page);
}

/** Adds a review the team received some other way (email, WhatsApp, Google…). */
export async function addReview(_prev: ReviewFormState, form: FormData): Promise<ReviewFormState> {
  const user = await requireUser("clients");
  const name = str(form, "name");
  const body = str(form, "body");
  const rating = Number(str(form, "rating"));
  const consent = form.get("consent") === "on";
  if (!name || !body) return { error: "Name and review are required." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Choose a rating from 1 to 5." };
  if (!consent) return { error: "Only add reviews the client agreed to share publicly." };

  const [review] = await db
    .insert(t.reviews)
    .values({
      name: name.slice(0, 80),
      body: body.slice(0, 1200),
      rating,
      company: str(form, "company")?.slice(0, 120),
      role: str(form, "role")?.slice(0, 80),
      service: str(form, "service")?.slice(0, 80),
      consent: true,
      status: "APPROVED",
      approvedAt: new Date(),
      source: "team",
    })
    .returning({ id: t.reviews.id });

  await audit(user, "CREATE", "review", review.id);
  refresh();
  return { ok: true };
}

export async function setReviewStatus(id: string, status: "APPROVED" | "HIDDEN") {
  const user = await requireUser("clients");
  const review = await db.query.reviews.findFirst({ where: eq(t.reviews.id, id) });
  if (!review) return;
  // A review is only published when its author agreed to it.
  if (status === "APPROVED" && !review.consent) return;
  await db
    .update(t.reviews)
    .set({ status, approvedAt: status === "APPROVED" ? new Date() : review.approvedAt })
    .where(eq(t.reviews.id, id));
  await audit(user, "UPDATE", "review", id, { status });
  refresh();
}

export async function deleteReview(id: string) {
  const user = await requireUser("clients");
  await db.delete(t.reviews).where(eq(t.reviews.id, id));
  await audit(user, "DELETE", "review", id);
  refresh();
}
