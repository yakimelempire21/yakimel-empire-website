import Link from "next/link";
import { asc, eq, or } from "drizzle-orm";
import { Badge, EmptyState, PageHeader, Table, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { formatDate, humanize, statusTone } from "@/lib/admin/format";
import { DEPARTMENT_SCOPED, EMPLOYEE_MANAGERS } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";

export default async function EmployeesPage({ searchParams }: { searchParams: Promise<{ denied?: string; department?: string }> }) {
  const user = await requireUser("employees");
  const { denied, department } = await searchParams;
  // Department managers only see their own department; others can filter by one.
  const deptFilter = DEPARTMENT_SCOPED.includes(user.role) ? user.departmentId : department;
  const canManage = EMPLOYEE_MANAGERS.includes(user.role);

  const rows = await db
    .select({
      id: t.employees.id,
      fullName: t.employees.fullName,
      title: t.employees.title,
      email: t.employees.email,
      status: t.employees.status,
      startDate: t.employees.startDate,
      hasLogin: t.employees.userId,
      department: t.departments.name,
      role: t.roles.name,
    })
    .from(t.employees)
    .innerJoin(t.departments, eq(t.departments.id, t.employees.departmentId))
    .innerJoin(t.roles, eq(t.roles.id, t.employees.roleId))
    .where(deptFilter ? or(eq(t.employees.departmentId, deptFilter), eq(t.departments.parentDepartmentId, deptFilter)) : undefined)
    .orderBy(asc(t.employees.fullName));

  return (
    <>
      <PageHeader
        title="Employees"
        description={`${rows.filter((r) => r.status === "ACTIVE").length} active team members`}
        action={
          canManage && (
            <Link href="/admin/employees/new" className={primaryButton}>
              Add employee
            </Link>
          )
        }
      />

      {denied && (
        <p role="alert" className="mb-6 rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-700">
          Only the Owner, Executive Admins and HR can add or edit employees.
        </p>
      )}

      {rows.length === 0 ? (
        <EmptyState title="No employees yet" />
      ) : (
        <Table head={["Name", "Department", "Role", "Status", "Access", "Start date"]}>
          {rows.map((e) => (
            <tr key={e.id} className="hover:bg-os-ink/[0.03]">
              <td className="px-5 py-3.5">
                <Link href={`/admin/employees/${e.id}`} className="font-medium hover:text-os-accent">
                  {e.fullName}
                </Link>
                <p className="text-xs text-os-muted">{e.title ?? e.email ?? ""}</p>
              </td>
              <td className="px-5 py-3.5 text-os-muted">{e.department}</td>
              <td className="px-5 py-3.5">{e.role}</td>
              <td className="px-5 py-3.5">
                <Badge tone={statusTone(e.status)}>{humanize(e.status)}</Badge>
              </td>
              <td className="px-5 py-3.5 text-os-muted">{e.hasLogin ? "Can sign in" : "—"}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-os-muted">{formatDate(e.startDate)}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
