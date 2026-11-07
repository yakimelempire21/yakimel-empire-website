import { count, eq } from "drizzle-orm";
import { Check } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { humanize } from "@/lib/admin/format";
import { ROLE_ACCESS, ROLE_DEFINITIONS, type Area } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";

const AREAS: Area[] = [
  "dashboard",
  "departments",
  "employees",
  "clients",
  "projects",
  "tasks",
  "apps",
  "inbox",
  "tickets",
  "security",
  "finance",
  "roles",
];
const AREA_LABEL: Partial<Record<Area, string>> = { apps: "Apps", roles: "Users & Roles", tickets: "Tickets", dashboard: "Overview" };

export default async function RolesPage() {
  await requireUser("roles");
  const counts = await db
    .select({ key: t.roles.key, n: count(t.employees.id) })
    .from(t.roles)
    .leftJoin(t.employees, eq(t.employees.roleId, t.roles.id))
    .groupBy(t.roles.key);
  const people = new Map(counts.map((c) => [c.key, c.n]));

  return (
    <>
      <PageHeader
        title="Users & Roles"
        description="What each role can open. Assign roles to people from Employees."
      />

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-[#7f93b8]">
              <th className="px-5 py-3 text-left font-medium">Role</th>
              {AREAS.map((a) => (
                <th key={a} className="px-2 py-3 text-center font-medium">
                  {AREA_LABEL[a] ?? humanize(a)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {ROLE_DEFINITIONS.map((r) => (
              <tr key={r.key}>
                <td className="px-5 py-3.5">
                  <p className="font-medium text-white">{r.name}</p>
                  <p className="text-xs text-[#7f93b8]">
                    {people.get(r.key) ?? 0} {people.get(r.key) === 1 ? "person" : "people"} · {r.description}
                  </p>
                </td>
                {AREAS.map((a) => (
                  <td key={a} className="px-2 py-3.5 text-center">
                    {ROLE_ACCESS[r.key].includes(a) ? (
                      <Check size={16} className="mx-auto text-[#4d8dff]" aria-label="Yes" />
                    ) : (
                      <span className="text-[#3a4458]" aria-label="No">
                        —
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5 text-sm">
          <p className="font-medium text-white">Department Manager</p>
          <p className="mt-1 text-[#a2adc4]">Only sees their own department&apos;s people, projects and tasks.</p>
        </Card>
        <Card className="p-5 text-sm">
          <p className="font-medium text-white">Employee</p>
          <p className="mt-1 text-[#a2adc4]">Only sees tasks assigned to them.</p>
        </Card>
        <Card className="p-5 text-sm">
          <p className="font-medium text-white">Owner protection</p>
          <p className="mt-1 text-[#a2adc4]">Only an Owner / Super Admin can grant the Owner or Executive Admin roles.</p>
        </Card>
      </div>
    </>
  );
}
