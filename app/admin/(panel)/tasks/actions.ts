"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { audit, requireUser } from "@/lib/admin/auth";
import { TASK_PRIORITIES, TASK_STATUSES, str } from "@/lib/admin/format";
import { notifyUsers } from "@/lib/admin/notify";
import { OWN_TASKS_ONLY } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";

export type TaskFormState = { error?: string; saved?: boolean } | undefined;

export async function createTask(_prev: TaskFormState, form: FormData): Promise<TaskFormState> {
  const user = await requireUser("tasks");
  const title = str(form, "title");
  if (!title) return { error: "Give the task a title." };

  // Employees can only create tasks for themselves.
  const assigneeId = OWN_TASKS_ONLY.includes(user.role) ? user.id : str(form, "assigneeId");
  const priority = str(form, "priority");
  const due = str(form, "dueDate");

  const [task] = await db
    .insert(t.tasks)
    .values({
      title,
      description: str(form, "description"),
      projectId: str(form, "projectId"),
      departmentId: str(form, "departmentId") ?? user.departmentId,
      assigneeId,
      createdById: user.id,
      dueDate: due ? new Date(`${due}T12:00:00`) : null,
      priority: (TASK_PRIORITIES as readonly string[]).includes(priority ?? "")
        ? (priority as (typeof TASK_PRIORITIES)[number])
        : "MEDIUM",
    })
    .returning({ id: t.tasks.id });

  if (assigneeId && assigneeId !== user.id) {
    await notifyUsers([assigneeId], {
      kind: "TASK",
      title: `${user.name} assigned you a task`,
      body: title,
      href: "/admin/tasks?view=mine",
    });
  }
  await audit(user, "CREATE", "task", task.id);
  revalidatePath("/admin/tasks");
  return { saved: true };
}

export async function updateTaskStatus(taskId: string, form: FormData) {
  const user = await requireUser("tasks");
  const status = str(form, "status");
  if (!status || !(TASK_STATUSES as readonly string[]).includes(status)) return;

  const where = OWN_TASKS_ONLY.includes(user.role)
    ? and(eq(t.tasks.id, taskId), eq(t.tasks.assigneeId, user.id))
    : eq(t.tasks.id, taskId);
  const [task] = await db
    .update(t.tasks)
    .set({ status: status as (typeof TASK_STATUSES)[number] })
    .where(where)
    .returning({ title: t.tasks.title, createdById: t.tasks.createdById, projectId: t.tasks.projectId });
  if (!task) return;

  if (status === "DONE" && task.createdById && task.createdById !== user.id) {
    await notifyUsers([task.createdById], { kind: "TASK", title: `${user.name} completed a task`, body: task.title, href: "/admin/tasks" });
  }
  await audit(user, "UPDATE", "task", taskId, { status });
  revalidatePath("/admin/tasks");
  if (task.projectId) revalidatePath(`/admin/projects/${task.projectId}`);
}
