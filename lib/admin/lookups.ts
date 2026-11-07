import "server-only";
import { asc, eq, isNotNull, and } from "drizzle-orm";
import { db, tables as t } from "@/lib/db";

/** Dropdown options shared by several admin forms. */

export async function clientOptions() {
  const rows = await db
    .select({ id: t.clients.id, fullName: t.clients.fullName, company: t.clients.company })
    .from(t.clients)
    .orderBy(asc(t.clients.fullName));
  return rows.map((c) => ({ value: c.id, label: c.company ? `${c.fullName} (${c.company})` : c.fullName }));
}

export async function departmentOptions() {
  const rows = await db.select({ id: t.departments.id, name: t.departments.name }).from(t.departments).orderBy(asc(t.departments.name));
  return rows.map((d) => ({ value: d.id, label: d.name }));
}

export async function roleOptions() {
  const rows = await db.select({ id: t.roles.id, name: t.roles.name, key: t.roles.key }).from(t.roles);
  return rows.map((r) => ({ value: r.id, label: r.name, key: r.key }));
}

/** Team members who can sign in (used for managers and task assignees). */
export async function teamOptions() {
  const rows = await db
    .select({ userId: t.employees.userId, fullName: t.employees.fullName })
    .from(t.employees)
    .where(and(isNotNull(t.employees.userId), eq(t.employees.status, "ACTIVE")))
    .orderBy(asc(t.employees.fullName));
  return rows.map((e) => ({ value: e.userId as string, label: e.fullName }));
}
