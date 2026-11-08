import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db, tables as t } from "@/lib/db";

export type PublicReview = {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  rating: number;
  body: string;
};

/** Approved reviews whose authors agreed to be shown. Never throws: no reviews → []. */
export async function publishedReviews(limit = 6): Promise<PublicReview[]> {
  try {
    return await db
      .select({
        id: t.reviews.id,
        name: t.reviews.name,
        company: t.reviews.company,
        role: t.reviews.role,
        rating: t.reviews.rating,
        body: t.reviews.body,
      })
      .from(t.reviews)
      .where(and(eq(t.reviews.status, "APPROVED"), eq(t.reviews.consent, true)))
      .orderBy(desc(t.reviews.approvedAt))
      .limit(limit);
  } catch (error) {
    console.error("[reviews] could not load reviews:", (error as Error).message);
    return [];
  }
}

/** Pages that show reviews; refreshed whenever a review is approved, hidden or removed. */
export const REVIEW_PAGES = ["/", "/pricing"];

export const REVIEW_SERVICES = [
  "AI Business Package",
  "Clinic Package",
  "Shopify Store Rebuild",
  "Website",
  "Mobile or web app",
  "WhatsApp AI Assistant",
  "EZNOB business services",
  "Other",
];
