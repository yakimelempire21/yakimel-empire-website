import { NextResponse } from "next/server";
import { and, count, desc, eq, gt, isNull } from "drizzle-orm";
import { getCurrentUser } from "@/lib/admin/auth";
import { db, tables as t } from "@/lib/db";

/**
 * Unread notifications for the signed-in user. Used by the YAKIMEL OS desktop
 * app to show Windows notifications.
 *
 *   GET /api/admin/notifications?after=<ISO date>
 *   → { unread, items: [{ id, title, body, href, createdAt }] }  (items newer than `after`)
 */
export async function GET(request: Request) {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const afterParam = new URL(request.url).searchParams.get("after");
  const after = afterParam && !Number.isNaN(Date.parse(afterParam)) ? new Date(afterParam) : null;

  const unreadOnly = and(eq(t.notifications.userId, user.id), isNull(t.notifications.readAt));
  const [[{ n }], items] = await Promise.all([
    db.select({ n: count() }).from(t.notifications).where(unreadOnly),
    after
      ? db
          .select({
            id: t.notifications.id,
            title: t.notifications.title,
            body: t.notifications.body,
            href: t.notifications.href,
            createdAt: t.notifications.createdAt,
          })
          .from(t.notifications)
          .where(and(unreadOnly, gt(t.notifications.createdAt, after)))
          .orderBy(desc(t.notifications.createdAt))
          .limit(5)
      : Promise.resolve([]),
  ]);

  return NextResponse.json(
    { unread: n, items, now: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
