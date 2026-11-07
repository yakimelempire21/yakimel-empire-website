"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { audit, requireUser } from "@/lib/admin/auth";
import { PROJECT_STATUSES, TASK_PRIORITIES, TASK_STATUSES, parseMoney, str } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";
import { notifyUsers } from "@/lib/admin/notify";

type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type FormState = { error?: string; saved?: boolean } | undefined;

const date = (v: string | null) => (v ? new Date(`${v}T12:00:00`) : null);

function readProject(form: FormData) {
  const status = str(form, "status");
  return {
    clientId: str(form, "clientId"),
    name: str(form, "name"),
    service: str(form, "service"),
    description: str(form, "description"),
    budget: parseMoney(str(form, "budget")),
    deposit: parseMoney(str(form, "deposit")),
    deadline: date(str(form, "deadline")),
    departmentId: str(form, "departmentId"),
    projectManagerId: str(form, "projectManagerId"),
    status: (PROJECT_STATUSES as readonly string[]).includes(status ?? "") ? (status as ProjectStatus) : "LEAD",
  };
}

export async function createProject(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("projects");
  const data = readProject(form);
  if (!data.clientId || !data.name || !data.service) return { error: "Client, project name and service are required." };

  const [row] = await db
    .insert(t.projects)
    .values({ ...data, clientId: data.clientId, name: data.name, service: data.service })
    .returning({ id: t.projects.id });
  await db.update(t.clients).set({ status: "ACTIVE" }).where(and(eq(t.clients.id, data.clientId), eq(t.clients.status, "LEAD")));
  await audit(user, "CREATE", "project", row.id);
  redirect(`/admin/projects/${row.id}`);
}

export async function updateProject(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("projects");
  const data = readProject(form);
  if (!data.clientId || !data.name || !data.service) return { error: "Client, project name and service are required." };

  await db
    .update(t.projects)
    .set({ ...data, clientId: data.clientId, name: data.name, service: data.service })
    .where(eq(t.projects.id, id));
  await audit(user, "UPDATE", "project", id, { status: data.status });
  revalidatePath(`/admin/projects/${id}`);
  return { saved: true };
}

export async function addTask(projectId: string, form: FormData) {
  const user = await requireUser("projects");
  const title = str(form, "title");
  if (!title) return;
  const priority = str(form, "priority");
  const assigneeId = str(form, "assigneeId");
  const project = await db.query.projects.findFirst({ where: eq(t.projects.id, projectId), columns: { name: true, departmentId: true } });
  const [row] = await db
    .insert(t.tasks)
    .values({
      projectId,
      title,
      assigneeId,
      createdById: user.id,
      departmentId: project?.departmentId ?? null,
      dueDate: date(str(form, "dueDate")),
      priority: (TASK_PRIORITIES as readonly string[]).includes(priority ?? "")
        ? (priority as (typeof TASK_PRIORITIES)[number])
        : "MEDIUM",
    })
    .returning({ id: t.tasks.id });
  if (assigneeId && assigneeId !== user.id) {
    await notifyUsers([assigneeId], {
      kind: "TASK",
      title: `${user.name} assigned you a task`,
      body: `${title}${project ? ` · ${project.name}` : ""}`,
      href: `/admin/projects/${projectId}`,
    });
  }
  await audit(user, "CREATE", "task", row.id, { projectId });
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function setTaskStatus(taskId: string, projectId: string, form: FormData) {
  const user = await requireUser("projects");
  const status = str(form, "status");
  if (!status || !(TASK_STATUSES as readonly string[]).includes(status)) return;
  await db
    .update(t.tasks)
    .set({ status: status as (typeof TASK_STATUSES)[number] })
    .where(and(eq(t.tasks.id, taskId), eq(t.tasks.projectId, projectId)));
  await audit(user, "UPDATE", "task", taskId, { status });
  revalidatePath(`/admin/projects/${projectId}`);
}
