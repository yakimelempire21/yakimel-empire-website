import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { Badge, Card, PageHeader, inputClass, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import {
  PROJECT_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  formatDate,
  formatMoney,
  humanize,
  options,
  statusTone,
} from "@/lib/admin/format";
import { clientOptions, departmentOptions, teamOptions } from "@/lib/admin/lookups";
import { db, tables as t } from "@/lib/db";
import { DEPARTMENT_SCOPED } from "@/lib/admin/roles";
import { addTask, setTaskStatus, updateProject } from "../actions";
import ProjectForm from "../ProjectForm";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("projects");
  const { id } = await params;

  const project = await db.query.projects.findFirst({
    where: eq(t.projects.id, id),
    with: { client: true, tasks: { orderBy: [asc(t.tasks.status), asc(t.tasks.dueDate)] } },
  });
  if (!project) notFound();
  if (DEPARTMENT_SCOPED.includes(user.role) && project.departmentId !== user.departmentId) notFound();

  const [clients, departments, team] = await Promise.all([clientOptions(), departmentOptions(), teamOptions()]);
  const teamName = new Map(team.map((m) => [m.value, m.label]));
  const done = project.tasks.filter((x) => x.status === "DONE").length;

  return (
    <>
      <PageHeader
        title={project.name}
        description={`${project.service} · ${project.client.fullName} · Budget ${formatMoney(project.budget)}`}
        back={{ href: "/admin/projects", label: "Projects" }}
        action={<Badge tone={statusTone(project.status)}>{humanize(project.status)}</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="font-display font-bold">Tasks</h2>
            <span className="text-sm text-dim-invert">
              {done}/{project.tasks.length} done
            </span>
          </div>

          <form action={addTask.bind(null, project.id)} className="space-y-2 border-b border-white/10 p-4">
            <input name="title" required placeholder="Add a task…" aria-label="Task title" className={inputClass} />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_1.3fr_1.2fr_auto]">
              <select name="priority" defaultValue="MEDIUM" aria-label="Priority" className={inputClass}>
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {humanize(p)}
                  </option>
                ))}
              </select>
              <select name="assigneeId" defaultValue="" aria-label="Assignee" className={inputClass}>
                <option value="">Unassigned</option>
                {team.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <input name="dueDate" type="date" aria-label="Due date" className={inputClass} />
              <button type="submit" className={primaryButton}>
                Add
              </button>
            </div>
          </form>

          {project.tasks.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-dim-invert">No tasks yet.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {project.tasks.map((task) => (
                <li key={task.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${task.status === "DONE" ? "text-dim-invert line-through" : ""}`}>{task.title}</p>
                    <p className="text-xs text-dim-invert">
                      {task.assigneeId ? teamName.get(task.assigneeId) ?? "Team member" : "Unassigned"}
                      {task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ""}
                    </p>
                  </div>
                  <Badge tone={task.priority === "URGENT" || task.priority === "HIGH" ? "red" : "gray"}>{humanize(task.priority)}</Badge>
                  <form key={`${task.id}-${task.status}`} action={setTaskStatus.bind(null, task.id, project.id)} className="flex gap-1.5">
                    <select name="status" defaultValue={task.status} aria-label="Task status" className={`${inputClass} py-1.5 text-xs`}>
                      {TASK_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {humanize(s)}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="rounded-lg border border-white/15 px-2.5 text-xs hover:border-brand">
                      Set
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display font-bold">Project details</h2>
            <Link href={`/admin/clients/${project.clientId}`} className="text-sm text-brand hover:underline">
              Open client →
            </Link>
          </div>
          <ProjectForm
            action={updateProject.bind(null, project.id)}
            project={project}
            clients={clients}
            departments={departments}
            managers={team}
            statuses={options(PROJECT_STATUSES)}
            submitLabel="Save changes"
          />
        </Card>
      </div>
    </>
  );
}
