"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { audit, hashPassword, requireUser, type CurrentUser } from "@/lib/admin/auth";
import { EMPLOYEE_STATUSES, str } from "@/lib/admin/format";
import { EMPLOYEE_MANAGERS, type RoleKey } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";

export type FormState = { error?: string; saved?: boolean } | undefined;
type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

/** Only a Super Admin can grant Super Admin or Executive. */
const PRIVILEGED: RoleKey[] = ["SUPER_ADMIN", "EXECUTIVE"];

async function requireManager(): Promise<CurrentUser> {
  const user = await requireUser("employees");
  if (!EMPLOYEE_MANAGERS.includes(user.role)) redirect("/admin/employees?denied=1");
  return user;
}

async function checkRole(user: CurrentUser, roleId: string | null): Promise<string | null> {
  if (!roleId) return "Choose a role.";
  const role = await db.query.roles.findFirst({ where: eq(t.roles.id, roleId) });
  if (!role) return "Unknown role.";
  if (PRIVILEGED.includes(role.key as RoleKey) && user.role !== "SUPER_ADMIN") {
    return `Only a Super Admin can assign the ${role.name} role.`;
  }
  return null;
}

function readEmployee(form: FormData) {
  const status = str(form, "status");
  const start = str(form, "startDate");
  return {
    fullName: str(form, "fullName"),
    email: str(form, "email")?.toLowerCase() ?? null,
    phone: str(form, "phone"),
    title: str(form, "title"),
    departmentId: str(form, "departmentId"),
    roleId: str(form, "roleId"),
    startDate: start ? new Date(`${start}T12:00:00`) : null,
    status: (EMPLOYEE_STATUSES as readonly string[]).includes(status ?? "") ? (status as EmployeeStatus) : "ACTIVE",
  };
}

export async function createEmployee(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireManager();
  const data = readEmployee(form);
  if (!data.fullName || !data.departmentId) return { error: "Name and department are required." };
  const roleError = await checkRole(user, data.roleId);
  if (roleError) return { error: roleError };

  const giveAccess = form.get("access") === "on";
  const password = String(form.get("password") ?? "");
  let userId: string | null = null;

  if (giveAccess) {
    if (!data.email) return { error: "An email is required to give Command Center access." };
    if (password.length < 12) return { error: "The temporary password must be at least 12 characters." };
    const existing = await db.query.users.findFirst({ where: eq(t.users.email, data.email) });
    if (existing) return { error: "A login with this email already exists." };
    const [u] = await db
      .insert(t.users)
      .values({ email: data.email, passwordHash: await hashPassword(password) })
      .returning({ id: t.users.id });
    userId = u.id;
  }

  const [row] = await db
    .insert(t.employees)
    .values({
      ...data,
      fullName: data.fullName,
      departmentId: data.departmentId,
      roleId: data.roleId!,
      userId,
    })
    .returning({ id: t.employees.id });
  await audit(user, "CREATE", "employee", row.id, { access: giveAccess });
  redirect(`/admin/employees/${row.id}`);
}

export async function updateEmployee(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireManager();
  const data = readEmployee(form);
  if (!data.fullName || !data.departmentId) return { error: "Name and department are required." };

  const current = await db.query.employees.findFirst({ where: eq(t.employees.id, id), with: { role: true } });
  if (!current) return { error: "Employee not found." };

  if (current.role.key === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
    return { error: "Only a Super Admin can edit a Super Admin." };
  }
  if (current.userId === user.id && (data.roleId !== current.roleId || data.status !== "ACTIVE")) {
    return { error: "You can't change your own role or deactivate yourself." };
  }
  if (data.roleId !== current.roleId) {
    const roleError = await checkRole(user, data.roleId);
    if (roleError) return { error: roleError };
  }

  await db
    .update(t.employees)
    .set({ ...data, fullName: data.fullName, departmentId: data.departmentId, roleId: data.roleId! })
    .where(eq(t.employees.id, id));

  // A non-active employee loses access immediately.
  if (current.userId && data.status !== "ACTIVE") {
    await db.update(t.sessions).set({ revokedAt: new Date() }).where(eq(t.sessions.userId, current.userId));
  }

  await audit(user, data.roleId !== current.roleId ? "PERMISSION_CHANGE" : "UPDATE", "employee", id, {
    status: data.status,
    roleChanged: data.roleId !== current.roleId,
  });
  revalidatePath(`/admin/employees/${id}`);
  return { saved: true };
}
