"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { audit, requireUser } from "@/lib/admin/auth";
import { TICKET_PRIORITIES, TICKET_STATUSES, str } from "@/lib/admin/format";
import { notifyArea, notifyUsers } from "@/lib/admin/notify";
import { db, tables as t } from "@/lib/db";

export type TicketFormState = { error?: string } | undefined;

const pick = <T extends readonly string[]>(list: T, v: string | null, fallback: T[number]): T[number] =>
  (list as readonly string[]).includes(v ?? "") ? (v as T[number]) : fallback;

export async function createTicket(_prev: TicketFormState, form: FormData): Promise<TicketFormState> {
  const user = await requireUser("tickets");
  const subject = str(form, "subject");
  const description = str(form, "description");
  if (!subject || !description) return { error: "Subject and description are required." };

  const assigneeId = str(form, "assigneeId");
  const priority = pick(TICKET_PRIORITIES, str(form, "priority"), "MEDIUM");
  const [ticket] = await db
    .insert(t.supportTickets)
    .values({
      subject,
      description,
      priority,
      clientId: str(form, "clientId"),
      appId: str(form, "appId"),
      departmentId: str(form, "departmentId"),
      conversationId: str(form, "conversationId"),
      assigneeId,
    })
    .returning({ id: t.supportTickets.id, number: t.supportTickets.number });

  const note = { kind: "TICKET" as const, title: `TKT-${ticket.number}: ${subject}`, href: `/admin/tickets/${ticket.id}` };
  if (assigneeId && assigneeId !== user.id) await notifyUsers([assigneeId], { ...note, body: `${user.name} assigned you a ticket` });
  if (priority === "CRITICAL") await notifyArea("tickets", { ...note, body: "Critical ticket opened" }, user.id);

  await audit(user, "CREATE", "ticket", ticket.id);
  redirect(`/admin/tickets/${ticket.id}`);
}

export async function updateTicket(id: string, form: FormData) {
  const user = await requireUser("tickets");
  const current = await db.query.supportTickets.findFirst({ where: eq(t.supportTickets.id, id) });
  if (!current) return;

  const status = pick(TICKET_STATUSES, str(form, "status"), current.status);
  const priority = pick(TICKET_PRIORITIES, str(form, "priority"), current.priority);
  const assigneeId = form.has("assigneeId") ? str(form, "assigneeId") : current.assigneeId;

  await db.update(t.supportTickets).set({ status, priority, assigneeId }).where(eq(t.supportTickets.id, id));
  if (assigneeId && assigneeId !== current.assigneeId && assigneeId !== user.id) {
    await notifyUsers([assigneeId], {
      kind: "TICKET",
      title: `TKT-${current.number}: ${current.subject}`,
      body: `${user.name} assigned you a ticket`,
      href: `/admin/tickets/${id}`,
    });
  }
  await audit(user, "UPDATE", "ticket", id, { status, priority, assigneeId });
  revalidatePath(`/admin/tickets/${id}`);
  revalidatePath("/admin/tickets");
}
