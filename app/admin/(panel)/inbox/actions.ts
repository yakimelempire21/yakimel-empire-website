"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { audit, requireUser } from "@/lib/admin/auth";
import { CONVERSATION_STATUSES, parseMoney, str } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";
import { createTransport, fromAddress, mailConfigured } from "@/lib/mailer";
import { notifyUsers } from "@/lib/admin/notify";

export async function setConversationStatus(id: string, form: FormData) {
  const user = await requireUser("inbox");
  const status = str(form, "status");
  if (!status || !(CONVERSATION_STATUSES as readonly string[]).includes(status)) return;
  await db
    .update(t.conversations)
    .set({ status: status as (typeof CONVERSATION_STATUSES)[number] })
    .where(eq(t.conversations.id, id));
  await audit(user, "UPDATE", "conversation", id, { status });
  revalidatePath("/admin", "layout");
}

export type ReplyState = { error?: string; sent?: boolean } | undefined;

/** Emails the reply to the client (when Zoho is configured) and logs it in the thread. */
export async function replyToConversation(id: string, _prev: ReplyState, form: FormData): Promise<ReplyState> {
  const user = await requireUser("inbox");
  const body = str(form, "body");
  const internal = form.get("internal") === "on";
  if (!body) return { error: "Write a message first." };

  const conversation = await db.query.conversations.findFirst({
    where: eq(t.conversations.id, id),
    with: { client: true },
  });
  if (!conversation) return { error: "Conversation not found." };

  if (!internal) {
    if (!conversation.client?.email) return { error: "This conversation has no client email." };
    if (!mailConfigured()) return { error: "Email isn't configured (ZOHO_USER / ZOHO_APP_PASSWORD). Save it as an internal note instead." };
    try {
      await createTransport().sendMail({
        from: fromAddress(`${user.name} — Yakimel Empire`),
        to: conversation.client.email,
        subject: `Re: ${conversation.subject ?? "Your request"}${conversation.reference ? ` — ${conversation.reference}` : ""}`,
        text: body,
      });
    } catch (e) {
      console.error("Reply email failed:", e);
      return { error: "The email could not be sent. Please try again." };
    }
  }

  await db.insert(t.messages).values({
    conversationId: id,
    senderName: internal ? `${user.name} (internal note)` : user.name,
    senderEmail: user.email,
    body,
    isInbound: false,
  });
  await db
    .update(t.conversations)
    .set({
      status: internal ? conversation.status : "PENDING",
      assignedToId: conversation.assignedToId ?? user.id,
    })
    .where(eq(t.conversations.id, id));
  await audit(user, "CREATE", "message", id, { internal });
  revalidatePath(`/admin/inbox/${id}`);
  return { sent: true };
}

/** Turns a website project request into a project for that client. */
export async function convertToProject(id: string) {
  const user = await requireUser("projects");
  const conversation = await db.query.conversations.findFirst({ where: eq(t.conversations.id, id) });
  if (!conversation?.clientId) return;

  const details = conversation.details ?? {};
  const type = details["Project type"] ?? "Project";
  const budget = parseMoney(details["Estimated budget"]);

  const [project] = await db
    .insert(t.projects)
    .values({
      clientId: conversation.clientId,
      name: conversation.subject ?? `${type} project`,
      service: type,
      budget,
      status: "CONSULTATION",
      projectManagerId: user.id,
      description: conversation.reference ? `Created from website request ${conversation.reference}.` : null,
    })
    .returning({ id: t.projects.id });
  await db.update(t.conversations).set({ status: "RESOLVED" }).where(eq(t.conversations.id, id));
  await audit(user, "CREATE", "project", project.id, { fromConversation: id });
  redirect(`/admin/projects/${project.id}`);
}

export async function assignConversation(id: string, form: FormData) {
  const user = await requireUser("inbox");
  const assigneeId = str(form, "assigneeId");
  const [c] = await db
    .update(t.conversations)
    .set({ assignedToId: assigneeId, ...(assigneeId ? { status: "ASSIGNED" as const } : {}) })
    .where(eq(t.conversations.id, id))
    .returning({ subject: t.conversations.subject });
  if (assigneeId && assigneeId !== user.id) {
    await notifyUsers([assigneeId], {
      kind: "INBOX",
      title: `${user.name} assigned you a message`,
      body: c?.subject,
      href: `/admin/inbox/${id}`,
    });
  }
  await audit(user, "UPDATE", "conversation", id, { assigneeId });
  revalidatePath("/admin", "layout");
}

export async function togglePriority(id: string) {
  const user = await requireUser("inbox");
  const c = await db.query.conversations.findFirst({ where: eq(t.conversations.id, id), columns: { isPriority: true } });
  if (!c) return;
  await db.update(t.conversations).set({ isPriority: !c.isPriority }).where(eq(t.conversations.id, id));
  await audit(user, "UPDATE", "conversation", id, { isPriority: !c.isPriority });
  revalidatePath(`/admin/inbox/${id}`);
  revalidatePath("/admin/inbox");
}

/** Marks the sender as an active client (they start as a lead). */
export async function convertToClient(id: string) {
  const user = await requireUser("clients");
  const c = await db.query.conversations.findFirst({ where: eq(t.conversations.id, id), columns: { clientId: true } });
  if (!c?.clientId) return;
  await db.update(t.clients).set({ status: "ACTIVE" }).where(eq(t.clients.id, c.clientId));
  await audit(user, "UPDATE", "client", c.clientId, { status: "ACTIVE", fromConversation: id });
  redirect(`/admin/clients/${c.clientId}`);
}
