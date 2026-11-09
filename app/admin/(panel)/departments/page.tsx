import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { AppWindow, Building2, Coins, Landmark, Layers, Network, Users } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { DEPARTMENT_SCOPED } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";

// Icon and color circle for each department (falls back to the generic one).
const LOOK: Record<string, { icon: typeof Layers; circle: string }> = {
  technology: { icon: Layers, circle: "bg-white" },
  executive: { icon: Landmark, circle: "bg-os-peach" },
  "human-resources": { icon: Users, circle: "bg-os-lilac" },
  finance: { icon: Coins, circle: "bg-os-mint" },
};
const DEFAULT_LOOK = { icon: Network, circle: "bg-os-pink" };

export default async function DepartmentsPage() {
  const user = await requireUser("departments");

  const [departments, headcount, projectCounts, apps, company] = await Promise.all([
    db.select().from(t.departments).orderBy(t.departments.name),
    db
      .select({ departmentId: t.employees.departmentId, n: count() })
      .from(t.employees)
      .where(eq(t.employees.status, "ACTIVE"))
      .groupBy(t.employees.departmentId),
    db.select({ departmentId: t.projects.departmentId, n: count() }).from(t.projects).groupBy(t.projects.departmentId),
    db.select({ departmentId: t.apps.departmentId, name: t.apps.name, slug: t.apps.slug }).from(t.apps).orderBy(t.apps.name),
    db.query.companies.findFirst(),
  ]);

  const people = new Map(headcount.map((h) => [h.departmentId, h.n]));
  const projects = new Map(projectCounts.map((p) => [p.departmentId, p.n]));
  const children = (id: string) => departments.filter((d) => d.parentDepartmentId === id);

  const ORDER = ["technology", "executive", "human-resources", "finance"];
  const rank = (slug: string) => (ORDER.indexOf(slug) === -1 ? ORDER.length : ORDER.indexOf(slug));
  let roots = departments.filter((d) => !d.parentDepartmentId).sort((a, b) => rank(a.slug) - rank(b.slug));
  // Department managers only see their own branch.
  if (DEPARTMENT_SCOPED.includes(user.role)) {
    const own = departments.find((d) => d.id === user.departmentId);
    const root = own?.parentDepartmentId ? departments.find((d) => d.id === own.parentDepartmentId) : own;
    roots = root ? [root] : [];
  }

  const total = (id: string): number => (people.get(id) ?? 0) + children(id).reduce((s, c) => s + total(c.id), 0);

  return (
    <>
      <PageHeader
        title="Departments"
        description={`${company?.legalName ?? "Yakimel Empire LLC"} · ${departments.length} departments and divisions`}
      />

      <div className="mb-6 flex items-center gap-3 font-display text-lg font-bold">
        <Building2 size={20} className="text-os-ink" aria-hidden="true" />
        {(company?.legalName ?? "Yakimel Empire LLC").toUpperCase()}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {roots.map((d) => {
          const subs = children(d.id);
          const deptApps = apps.filter((a) => a.departmentId === d.id);
          return (
            <Card key={d.id} className={`p-6 ${d.slug === "technology" ? "border-os-accent/50! bg-os-lilac!" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-os-ink ${(LOOK[d.slug] ?? DEFAULT_LOOK).circle}`}>
                    {(() => {
                      const Icon = (LOOK[d.slug] ?? DEFAULT_LOOK).icon;
                      return <Icon size={24} aria-hidden="true" />;
                    })()}
                  </span>
                  <div>
                  <h2 className="font-display text-2xl font-bold">{d.name}</h2>
                  {d.description && <p className="mt-1 text-sm text-os-muted">{d.description}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm text-os-ink">
                  <span className="inline-flex items-center gap-1.5" title="Active people">
                    <Users size={15} aria-hidden="true" /> {total(d.id)}
                  </span>
                  <span aria-hidden="true" className="h-4 w-px bg-[#F0533F]" />
                  <span title="Projects">{projects.get(d.id) ?? 0} projects</span>
                </div>
              </div>

              {deptApps.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-2 sm:pl-[4.5rem]">
                  {deptApps.map((a) => (
                    <li key={a.slug}>
                      <Link
                        href={`/admin/apps/${a.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-os-ink shadow-sm hover:bg-os-ink hover:text-white"
                      >
                        <AppWindow size={13} aria-hidden="true" /> {a.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {subs.length > 0 && (
                <ul className="mt-5 space-y-1 border-l border-os-ink/15 pl-4">
                  {subs.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-1 text-sm">
                      <span className="text-os-ink">↳ {s.name}</span>
                      <span className="text-xs text-os-muted">{people.get(s.id) ?? 0} people</span>
                    </li>
                  ))}
                </ul>
              )}

              <Link href={`/admin/employees?department=${d.id}`} className="mt-5 inline-block font-semibold text-os-ink hover:underline sm:ml-[4.5rem]">
                View team →
              </Link>
            </Card>
          );
        })}
      </div>
    </>
  );
}
