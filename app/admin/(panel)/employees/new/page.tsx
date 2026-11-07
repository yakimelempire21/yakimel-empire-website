import { redirect } from "next/navigation";
import { Card, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { EMPLOYEE_STATUSES, options } from "@/lib/admin/format";
import { departmentOptions, roleOptions } from "@/lib/admin/lookups";
import { EMPLOYEE_MANAGERS } from "@/lib/admin/roles";
import { createEmployee } from "../actions";
import EmployeeForm from "../EmployeeForm";

export default async function NewEmployeePage() {
  const user = await requireUser("employees");
  if (!EMPLOYEE_MANAGERS.includes(user.role)) redirect("/admin/employees?denied=1");

  const [departments, roles] = await Promise.all([departmentOptions(), roleOptions()]);
  // Only a Super Admin can hand out Super Admin / Executive.
  const assignable = roles.filter((r) => user.role === "SUPER_ADMIN" || !["SUPER_ADMIN", "EXECUTIVE"].includes(r.key));

  return (
    <>
      <PageHeader title="Add employee" back={{ href: "/admin/employees", label: "Employees" }} />
      <Card className="max-w-3xl p-6">
        <EmployeeForm
          action={createEmployee}
          departments={departments}
          roles={assignable}
          statuses={options(EMPLOYEE_STATUSES)}
          submitLabel="Add employee"
          allowAccess
        />
      </Card>
    </>
  );
}
