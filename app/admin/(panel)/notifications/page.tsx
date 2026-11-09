import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, desc, eq, isNull } from "drizzle-orm";
import { Bell, Briefcase, Inbox, LifeBuoy, ListChecks, ShieldCheck } from "lucide-react";
import { Card, EmptyState, PageHeader, secondaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { timeAgo } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";

const ICON = { INBOX: Inbox, TASK: ListChecks, TICKET: LifeBuoy, PROJECT: Briefcase, SECURITY: ShieldCheck, SYSTEM: Bell };

async function markAllRead() {
  "use server";
  const user = await requireUser("notifications");
  await db
    .update(t.notifications)
    .set({ readAt: new Date() })
    .where(and(eq(t.notifications.userId, user.id), isNull(t.notifications.readAt)));
  revalidatePath("/admin", "layout");
}

/** Marks one notification read, then opens what it points to. */
async function openNotification(id: string) {
  "use server";
  const user = await requireUser("notifications");
  const [n] = await db
    .update(t.notifications)
    .set({ readAt: new Date() })
    .where(and(eq(t.notifications.id, id), eq(t.notifications.userId, user.id)))
    .returning({ href: t.notifications.href });
  revalidatePath("/admin", "layout");
  redirect(n?.href?.startsWith("/admin") ? n.href : "/admin/notifications");
}

export default async function NotificationsPage() {
  const user = await requireUser("notifications");
  const items = await db
    .select()
    .from(t.notifications)
    .where(eq(t.notifications.userId, user.id))
    .orderBy(desc(t.notifications.createdAt))
    .limit(100);
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : "You're all caught up"}
        action={
          unread > 0 && (
            <form action={markAllRead}>
              <button type="submit" className={secondaryButton}>
                Mark all as read
              </button>
            </form>
          )
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          body="You'll be notified about new website requests, tasks assigned to you, tickets and important alerts."
        />
      ) : (
        <Card>
          <ul className="divide-y divide-os-ink/10">
            {items.map((n) => {
              const Icon = ICON[n.kind];
              return (
                <li key={n.id}>
                  <form action={openNotification.bind(null, n.id)}>
                    <button type="submit" className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-os-ink/[0.03]">
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          n.readAt ? "bg-os-ink/[0.04] text-os-muted" : "bg-os-accent/15 text-os-accent"
                        }`}
                      >
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm ${n.readAt ? "text-os-muted" : "font-semibold text-os-ink"}`}>{n.title}</span>
                        {n.body && <span className="block truncate text-xs text-os-muted">{n.body}</span>}
                      </span>
                      <span className="shrink-0 text-xs text-os-faint">{timeAgo(n.createdAt)}</span>
                      {!n.readAt && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-os-accent" aria-label="Unread" />}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
      <p className="mt-4 text-xs text-os-faint">
        Showing your latest 100. <Link href="/admin" className="hover:text-os-ink">Back to overview</Link>
      </p>
    </>
  );
}
