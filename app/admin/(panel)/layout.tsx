import { redirect } from "next/navigation";
import { and, asc, count, eq, isNull } from "drizzle-orm";
import AdminShell, { type NavGroup, type NavLink } from "@/components/admin/AdminShell";
import { requireUser, signOut } from "@/lib/admin/auth";
import { canAccess, type Area } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";

async function logout() {
  "use server";
  await signOut();
  redirect("/admin/login");
}

const appDot = { LIVE: "green", DEVELOPMENT: "violet", MAINTENANCE: "amber", OFFLINE: "red" } as const;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const can = (a: Area) => canAccess(user.role, a);

  const [[openInbox], [openTickets], [unread], apps] = await Promise.all([
    can("inbox") ? db.select({ n: count() }).from(t.conversations).where(eq(t.conversations.status, "OPEN")) : [{ n: 0 }],
    can("tickets") ? db.select({ n: count() }).from(t.supportTickets).where(eq(t.supportTickets.status, "OPEN")) : [{ n: 0 }],
    db
      .select({ n: count() })
      .from(t.notifications)
      .where(and(eq(t.notifications.userId, user.id), isNull(t.notifications.readAt))),
    can("apps")
      ? db.select({ name: t.apps.name, slug: t.apps.slug, status: t.apps.status }).from(t.apps).orderBy(asc(t.apps.name))
      : [],
  ]);

  // `area` decides visibility; links without an area are planned for later phases.
  const groups: { label?: string; links: (NavLink & { area?: Area })[] }[] = [
    { links: [{ label: "Overview", href: "/admin", icon: "overview", area: "dashboard" }] },
    {
      label: "Company",
      links: [
        { label: "Departments", href: "/admin/departments", icon: "departments", area: "departments" },
        { label: "Employees", href: "/admin/employees", icon: "employees", area: "employees" },
        { label: "Clients", href: "/admin/clients", icon: "clients", area: "clients" },
        { label: "Projects", href: "/admin/projects", icon: "projects", area: "projects" },
        { label: "Tasks", href: "/admin/tasks", icon: "tasks", area: "tasks" },
      ],
    },
    {
      label: "Ecosystem",
      links: apps.map((a) => ({
        label: a.name,
        href: `/admin/apps/${a.slug}`,
        icon: "app" as const,
        dot: appDot[a.status],
        area: "apps" as Area,
      })),
    },
    {
      label: "Communication",
      links: [
        { label: "Inbox", href: "/admin/inbox", icon: "inbox", area: "inbox", badge: openInbox.n },
        { label: "Support Tickets", href: "/admin/tickets", icon: "tickets", area: "tickets", badge: openTickets.n },
        { label: "Notifications", href: "/admin/notifications", icon: "notifications", area: "notifications", badge: unread.n },
      ],
    },
    {
      label: "Business",
      links: [
        { label: "Finance", icon: "finance", soon: true, area: "finance" },
        { label: "Invoices", icon: "invoices", soon: true, area: "finance" },
        { label: "Contracts", icon: "contracts", soon: true, area: "finance" },
        { label: "Documents", icon: "documents", soon: true, area: "finance" },
      ],
    },
    {
      label: "Technology",
      links: [
        { label: "App Monitoring", href: "/admin/apps", icon: "monitoring", area: "apps" },
        { label: "Security Center", href: "/admin/security", icon: "security", area: "security" },
      ],
    },
    {
      label: "Analytics",
      links: [{ label: "Company Analytics", icon: "analytics", soon: true, area: "dashboard" }],
    },
    {
      label: "System",
      links: [
        { label: "Users & Roles", href: "/admin/roles", icon: "roles", area: "roles" },
        { label: "Audit Logs", href: "/admin/audit", icon: "audit", area: "security" },
        { label: "Integrations", icon: "integrations", soon: true, area: "roles" },
        { label: "Settings", icon: "settings", soon: true, area: "roles" },
      ],
    },
  ];

  const visible: NavGroup[] = groups
    .map((g) => ({ label: g.label, links: g.links.filter((l) => !l.area || can(l.area)).map(({ area, ...l }) => (void area, l)) }))
    .filter((g) => g.links.length > 0);

  return (
    <AdminShell groups={visible} user={{ name: user.name, roleName: user.roleName }} unread={unread.n} logout={logout}>
      {children}
    </AdminShell>
  );
}
