import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db, tables as t } from "@/lib/db";
import { ROLE_ACCESS, type Area, type RoleKey } from "./roles";

type Kind = "INBOX" | "TASK" | "TICKET" | "PROJECT" | "SECURITY" | "SYSTEM";
type Note = { kind: Kind; title: string; body?: string | null; href?: string };

/** Sends a notification to specific users (skips nulls and duplicates). */
export async function notifyUsers(userIds: (string | null | undefined)[], note: Note) {
  const ids = [...new Set(userIds.filter((x): x is string => Boolean(x)))];
  if (ids.length === 0) return;
  await db.insert(t.notifications).values(ids.map((userId) => ({ userId, ...note, body: note.body ?? null })));
}

/** Notifies every active team member whose role can open `area`. */
export async function notifyArea(area: Area, note: Note, exceptUserId?: string) {
  const roleKeys = (Object.keys(ROLE_ACCESS) as RoleKey[]).filter((k) => ROLE_ACCESS[k].includes(area));
  const rows = await db
    .select({ userId: t.employees.userId })
    .from(t.employees)
    .innerJoin(t.roles, eq(t.roles.id, t.employees.roleId))
    .where(and(eq(t.employees.status, "ACTIVE"), inArray(t.roles.key, roleKeys)));
  await notifyUsers(
    rows.map((r) => r.userId).filter((id) => id !== exceptUserId),
    note,
  );
}
