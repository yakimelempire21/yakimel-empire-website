import Link from "next/link";
import { and, asc, count, desc, eq, gte, inArray, ne, notInArray, sql, sum } from "drizzle-orm";
import { ArrowRight, CircleCheck, TriangleAlert } from "lucide-react";
import AppCard from "@/components/admin/AppCard";
import { Badge, Card, glass } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { appsWithLatestMetrics, sumMetric } from "@/lib/admin/ecosystem";
import { formatDate, formatMoney, greeting, humanize, SOURCE_LABELS, statusTone } from "@/lib/admin/format";
import { canAccess, EXECUTIVE_VIEW } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";

const CLOSED = ["COMPLETED", "CANCELLED"] as const;

export default async function Overview({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser("dashboard");
  const { denied } = await searchParams;
  const can = (a: Parameters<typeof canAccess>[1]) => canAccess(user.role, a);
  const executive = EXECUTIVE_VIEW.includes(user.role);

  const [
    [revenue],
    [activeClients],
    [activeProjects],
    [openTickets],
    [pendingTasks],
    [criticalTickets],
    apps,
    recent,
    myTasks,
  ] = await Promise.all([
    db
      .select({ v: sum(t.payments.amount) })
      .from(t.payments)
      .where(gte(t.payments.paidAt, sql`date_trunc('month', now())`)),
    db.select({ n: count() }).from(t.clients).where(eq(t.clients.status, "ACTIVE")),
    db.select({ n: count() }).from(t.projects).where(notInArray(t.projects.status, ["LEAD", ...CLOSED])),
    db.select({ n: count() }).from(t.supportTickets).where(inArray(t.supportTickets.status, ["OPEN", "IN_PROGRESS"])),
    db.select({ n: count() }).from(t.tasks).where(ne(t.tasks.status, "DONE")),
    db
      .select({ n: count() })
      .from(t.supportTickets)
      .where(and(eq(t.supportTickets.priority, "CRITICAL"), inArray(t.supportTickets.status, ["OPEN", "IN_PROGRESS"]))),
    can("apps") || executive ? appsWithLatestMetrics() : Promise.resolve([]),
    can("inbox")
      ? db.query.conversations.findMany({
          orderBy: desc(t.conversations.createdAt),
          limit: 5,
          with: { client: { columns: { fullName: true } } },
        })
      : Promise.resolve([]),
    db.query.tasks.findMany({
      where: and(eq(t.tasks.assigneeId, user.id), ne(t.tasks.status, "DONE")),
      orderBy: [asc(t.tasks.dueDate), desc(t.tasks.createdAt)],
      limit: 6,
      with: { project: { columns: { name: true } } },
    }),
  ]);

  // Company status: anything offline, in maintenance, or critical needs attention.
  const offline = apps.filter((a) => a.status === "OFFLINE");
  const maintenance = apps.filter((a) => a.status === "MAINTENANCE");
  const issues = [
    ...offline.map((a) => `${a.name} is offline`),
    ...maintenance.map((a) => `${a.name} is in maintenance`),
    ...(criticalTickets.n > 0 ? [`${criticalTickets.n} critical ticket${criticalTickets.n > 1 ? "s" : ""}`] : []),
  ];
  const appUsers = sumMetric(apps, "users");

  const kpis = [
    { label: "Revenue", value: formatMoney(revenue.v ?? 0), hint: "This month", href: "/admin/finance", show: can("finance") },
    { label: "Active Clients", value: activeClients.n, href: "/admin/clients?status=ACTIVE", show: can("clients") },
    { label: "Active Projects", value: activeProjects.n, href: "/admin/projects", show: can("projects") },
    {
      label: "App Users",
      value: appUsers === null ? "—" : appUsers.toLocaleString("en-US"),
      hint: appUsers === null ? "Connect your apps" : "Across connected apps",
      href: "/admin/apps",
      show: can("apps") || executive,
    },
    { label: "Open Tickets", value: openTickets.n, href: "/admin/tickets", show: can("tickets") },
    { label: "Pending Tasks", value: pendingTasks.n, href: "/admin/tasks", show: can("tasks") && executive },
  ].filter((k) => k.show);

  const who = executive ? "Yakimel Empire" : user.name.split(" ")[0];

  return (
    <>
      {denied && (
        <p role="alert" className="mb-6 rounded-lg bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
          Your role doesn&apos;t have access to that area.
        </p>
      )}

      {/* Hero */}
      <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#7f93b8]">{formatDate(new Date())}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {greeting()}, <span className="bg-gradient-to-r from-white to-[#7fa8ff] bg-clip-text text-transparent">{who}</span>
          </h1>
        </div>

        {executive || can("apps") ? (
          issues.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">Company Status</p>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
                  <CircleCheck size={15} aria-hidden="true" /> ALL SYSTEMS OPERATIONAL
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber-300/80">Company Status</p>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                <TriangleAlert size={15} aria-hidden="true" /> ATTENTION NEEDED
              </p>
              <p className="mt-0.5 text-xs text-amber-200/80">{issues.join(" · ")}</p>
            </div>
          )
        ) : null}
      </section>

      {/* KPI row */}
      {kpis.length > 0 && (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map((k) => (
            <Link key={k.label} href={k.href} className={`group rounded-2xl p-4 transition-colors hover:border-[#2F6FEA]/40 ${glass}`}>
              <p className="text-xs text-[#7f93b8]">{k.label}</p>
              <p className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">{k.value}</p>
              {k.hint && <p className="mt-1 text-[11px] text-[#5d6b86]">{k.hint}</p>}
            </Link>
          ))}
        </section>
      )}

      {/* Ecosystem */}
      {apps.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#7f93b8]">Your Ecosystem</h2>
            <Link href="/admin/apps" className="inline-flex items-center gap-1 text-sm text-[#a2adc4] hover:text-white">
              App monitoring <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {apps.map((a) => (
              <AppCard key={a.id} app={a} />
            ))}
          </div>
        </section>
      )}

      <section className={`mt-10 grid gap-6 ${can("inbox") ? "xl:grid-cols-2" : ""}`}>
        {can("inbox") && (
          <Card>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <h2 className="font-display font-bold">Latest messages</h2>
              <Link href="/admin/inbox" className="inline-flex items-center gap-1 text-sm text-[#a2adc4] hover:text-white">
                Inbox <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-[#7f93b8]">No messages yet. Website requests will appear here.</p>
            ) : (
              <ul className="divide-y divide-white/[0.05]">
                {recent.map((c) => (
                  <li key={c.id}>
                    <Link href={`/admin/inbox/${c.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03]">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.client?.fullName ?? "Unknown sender"}</p>
                        <p className="truncate text-xs text-[#7f93b8]">
                          {SOURCE_LABELS[c.source]} · {c.subject}
                        </p>
                      </div>
                      <Badge tone={statusTone(c.status)}>{humanize(c.status)}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        <Card>
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <h2 className="font-display font-bold">My tasks</h2>
            <Link href="/admin/tasks?view=mine" className="inline-flex items-center gap-1 text-sm text-[#a2adc4] hover:text-white">
              All tasks <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {myTasks.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[#7f93b8]">Nothing assigned to you. 🎉</p>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {myTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="truncate text-xs text-[#7f93b8]">
                      {task.project?.name ?? "General"}
                      {task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ""}
                    </p>
                  </div>
                  <Badge tone={statusTone(task.status)}>{humanize(task.status)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </>
  );
}
