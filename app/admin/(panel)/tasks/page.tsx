import Link from "next/link";
import { and, asc, desc, eq, ne, type SQL } from "drizzle-orm";
import { Badge, Card, EmptyState, PageHeader, inputClass } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { TASK_STATUSES, formatDate, humanize } from "@/lib/admin/format";
import { teamOptions } from "@/lib/admin/lookups";
import { DEPARTMENT_SCOPED, OWN_TASKS_ONLY } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";
import { updateTaskStatus } from "./actions";
import NewTaskForm from "./NewTaskForm";

const VIEWS = [
  { id: "open", label: "Open" },
  { id: "mine", label: "Assigned to me" },
  { id: "done", label: "Done" },
  { id: "all", label: "All" },
] as const;

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const user = await requireUser("tasks");
  const { view: viewParam } = await searchParams;
  const ownOnly = OWN_TASKS_ONLY.includes(user.role);
  const view = ownOnly ? "mine" : (VIEWS.find((v) => v.id === viewParam)?.id ?? "open");

  const filters: SQL[] = [];
  if (view === "mine" || ownOnly) filters.push(eq(t.tasks.assigneeId, user.id));
  if (view === "open" || view === "mine") filters.push(ne(t.tasks.status, "DONE"));
  if (view === "done") filters.push(eq(t.tasks.status, "DONE"));
  if (DEPARTMENT_SCOPED.includes(user.role)) filters.push(eq(t.tasks.departmentId, user.departmentId));

  const [tasks, team, projects] = await Promise.all([
    db.query.tasks.findMany({
      where: filters.length ? and(...filters) : undefined,
      orderBy: [asc(t.tasks.status), asc(t.tasks.dueDate), desc(t.tasks.createdAt)],
      limit: 300,
      with: { project: { columns: { id: true, name: true } } },
    }),
    teamOptions(),
    ownOnly
      ? Promise.resolve([])
      : db
          .select({ id: t.projects.id, name: t.projects.name })
          .from(t.projects)
          .where(ne(t.projects.status, "COMPLETED"))
          .orderBy(t.projects.name),
  ]);
  const names = new Map(team.map((m) => [m.value, m.label]));
  // Plain JS date comparison, done once per request.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <>
      <PageHeader title="Tasks" description="Assign work, set deadlines and track progress across the company." />

      <Card className="mb-6 p-5">
        <NewTaskForm team={team} projects={projects.map((p) => ({ value: p.id, label: p.name }))} canAssign={!ownOnly} />
      </Card>

      {!ownOnly && (
        <div className="mb-5 flex flex-wrap gap-2">
          {VIEWS.map((v) => (
            <Link
              key={v.id}
              href={`/admin/tasks?view=${v.id}`}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                view === v.id ? "bg-os-accent text-white" : "border border-os-ink/15 text-os-muted hover:text-os-ink"
              }`}
            >
              {v.label}
            </Link>
          ))}
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState title="No tasks here" body="Add a task above. Tasks created inside a project show up here too." />
      ) : (
        <Card>
          <ul className="divide-y divide-os-ink/10">
            {tasks.map((task) => {
              const overdue = task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < today;
              return (
                <li key={task.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${task.status === "DONE" ? "text-os-muted line-through" : ""}`}>{task.title}</p>
                    <p className="text-xs text-os-muted">
                      {task.project ? (
                        <Link href={`/admin/projects/${task.project.id}`} className="hover:text-os-ink">
                          {task.project.name}
                        </Link>
                      ) : (
                        "General"
                      )}
                      {" · "}
                      {task.assigneeId ? (names.get(task.assigneeId) ?? "Team member") : "Unassigned"}
                      {task.dueDate && (
                        <span className={overdue ? "text-red-700" : ""}>
                          {" · "}
                          {overdue ? "Overdue " : "Due "}
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge tone={task.priority === "URGENT" || task.priority === "HIGH" ? "red" : "gray"}>{humanize(task.priority)}</Badge>
                  <form key={`${task.id}-${task.status}`} action={updateTaskStatus.bind(null, task.id)} className="flex gap-1.5">
                    <select name="status" defaultValue={task.status} aria-label="Task status" className={`${inputClass} py-1.5 text-xs`}>
                      {TASK_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {humanize(s)}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="rounded-lg border border-os-ink/20 px-2.5 text-xs hover:border-os-accent">
                      Set
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}
