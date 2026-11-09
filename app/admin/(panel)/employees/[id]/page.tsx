import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { EMPLOYEE_STATUSES, formatDate, humanize, options, statusTone } from "@/lib/admin/format";
import { departmentOptions, roleOptions } from "@/lib/admin/lookups";
import { EMPLOYEE_MANAGERS } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";
import { updateEmployee } from "../actions";
import EmployeeForm from "../EmployeeForm";

export default async function EmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("employees");
  const { id } = await params;

  const employee = await db.query.employees.findFirst({
    where: eq(t.employees.id, id),
    with: { role: true, department: true, user: { columns: { email: true, lastLoginAt: true } } },
  });
  if (!employee) notFound();

  const [departments, roles] = await Promise.all([departmentOptions(), roleOptions()]);
  const canEdit =
    EMPLOYEE_MANAGERS.includes(user.role) && (employee.role.key !== "SUPER_ADMIN" || user.role === "SUPER_ADMIN");
  // Keep the current role selectable even when the editor couldn't assign it.
  const assignable = roles.filter(
    (r) => r.value === employee.roleId || user.role === "SUPER_ADMIN" || !["SUPER_ADMIN", "EXECUTIVE"].includes(r.key),
  );

  return (
    <>
      <PageHeader
        title={employee.fullName}
        description={`${employee.title ?? employee.role.name} · ${employee.department.name}`}
        back={{ href: "/admin/employees", label: "Employees" }}
        action={<Badge tone={statusTone(employee.status)}>{humanize(employee.status)}</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-6">
          <EmployeeForm
            action={updateEmployee.bind(null, employee.id)}
            employee={employee}
            departments={departments}
            roles={assignable}
            statuses={options(EMPLOYEE_STATUSES)}
            submitLabel="Save changes"
            readOnly={!canEdit}
          />
        </Card>

        <Card className="h-fit p-5">
          <h2 className="mb-3 font-display font-bold">Command Center access</h2>
          {employee.user ? (
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-os-muted">Sign-in email</dt>
                <dd>{employee.user.email}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-os-muted">Last sign-in</dt>
                <dd>{formatDate(employee.user.lastLoginAt, true)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-os-muted">Role</dt>
                <dd>{employee.role.name}</dd>
              </div>
              <p className="pt-2 text-xs text-os-muted">{employee.role.description}</p>
            </dl>
          ) : (
            <p className="text-sm text-os-muted">This employee doesn&apos;t have a login yet. Email invitations arrive with the HR update.</p>
          )}
        </Card>
      </div>
    </>
  );
}
