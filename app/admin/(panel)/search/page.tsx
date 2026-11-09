import Link from "next/link";
import { and, eq, ilike, or } from "drizzle-orm";
import { Card, EmptyState, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { humanize } from "@/lib/admin/format";
import { canAccess, OWN_TASKS_ONLY } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";

type Hit = { href: string; title: string; sub: string };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser("dashboard");
  const q = (await searchParams).q?.trim().slice(0, 80) ?? "";
  const like = `%${q.replace(/[%_]/g, "\\$&")}%`;
  const can = (a: Parameters<typeof canAccess>[1]) => canAccess(user.role, a);

  const groups: { label: string; hits: Hit[] }[] = [];
  if (q.length >= 2) {
    const [clients, projects, tasks, employees, conversations, tickets] = await Promise.all([
      can("clients")
        ? db
            .select()
            .from(t.clients)
            .where(or(ilike(t.clients.fullName, like), ilike(t.clients.email, like), ilike(t.clients.company, like)))
            .limit(8)
        : [],
      can("projects")
        ? db
            .select()
            .from(t.projects)
            .where(or(ilike(t.projects.name, like), ilike(t.projects.service, like)))
            .limit(8)
        : [],
      can("tasks")
        ? db
            .select()
            .from(t.tasks)
            .where(
              OWN_TASKS_ONLY.includes(user.role)
                ? and(ilike(t.tasks.title, like), eq(t.tasks.assigneeId, user.id))
                : ilike(t.tasks.title, like),
            )
            .limit(8)
        : [],
      can("employees")
        ? db
            .select()
            .from(t.employees)
            .where(or(ilike(t.employees.fullName, like), ilike(t.employees.email, like), ilike(t.employees.title, like)))
            .limit(8)
        : [],
      can("inbox")
        ? db
            .select()
            .from(t.conversations)
            .where(or(ilike(t.conversations.subject, like), ilike(t.conversations.reference, like)))
            .limit(8)
        : [],
      can("tickets") ? db.select().from(t.supportTickets).where(ilike(t.supportTickets.subject, like)).limit(8) : [],
    ]);

    groups.push(
      { label: "Clients", hits: clients.map((c) => ({ href: `/admin/clients/${c.id}`, title: c.fullName, sub: [c.email, c.company].filter(Boolean).join(" · ") })) },
      { label: "Projects", hits: projects.map((p) => ({ href: `/admin/projects/${p.id}`, title: p.name, sub: `${p.service} · ${humanize(p.status)}` })) },
      { label: "Tasks", hits: tasks.map((x) => ({ href: x.projectId ? `/admin/projects/${x.projectId}` : "/admin/tasks", title: x.title, sub: humanize(x.status) })) },
      { label: "Employees", hits: employees.map((e) => ({ href: `/admin/employees/${e.id}`, title: e.fullName, sub: e.title ?? e.email ?? "" })) },
      { label: "Messages", hits: conversations.map((c) => ({ href: `/admin/inbox/${c.id}`, title: c.subject ?? "Message", sub: c.reference ?? "" })) },
      { label: "Tickets", hits: tickets.map((x) => ({ href: `/admin/tickets/${x.id}`, title: x.subject, sub: `TKT-${x.number} · ${humanize(x.status)}` })) },
    );
  }
  const found = groups.filter((g) => g.hits.length > 0);

  return (
    <>
      <PageHeader title={q ? `Results for “${q}”` : "Search"} description="Clients, projects, tasks, people, messages and tickets." />
      {q.length < 2 ? (
        <EmptyState title="Type at least 2 characters" body="Use the search bar at the top of any page." />
      ) : found.length === 0 ? (
        <EmptyState title="Nothing found" body="Try a name, an email, a company or a ticket number." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {found.map((g) => (
            <Card key={g.label}>
              <h2 className="border-b border-os-ink/10 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-os-muted">
                {g.label}
              </h2>
              <ul className="divide-y divide-os-ink/10">
                {g.hits.map((h, i) => (
                  <li key={`${h.href}-${i}`}>
                    <Link href={h.href} className="block px-5 py-3 hover:bg-os-ink/[0.03]">
                      <p className="text-sm font-medium">{h.title}</p>
                      {h.sub && <p className="text-xs text-os-muted">{h.sub}</p>}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
