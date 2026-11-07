import { asc, eq } from "drizzle-orm";
import { Card, PageHeader } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { clientOptions, departmentOptions, teamOptions } from "@/lib/admin/lookups";
import { db, tables as t } from "@/lib/db";
import TicketForm from "../TicketForm";

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string; app?: string; client?: string }>;
}) {
  await requireUser("tickets");
  const sp = await searchParams;

  const [clients, departments, team, apps, conversation] = await Promise.all([
    clientOptions(),
    departmentOptions(),
    teamOptions(),
    db.select({ id: t.apps.id, name: t.apps.name }).from(t.apps).orderBy(asc(t.apps.name)),
    sp.conversation
      ? db.query.conversations.findFirst({
          where: eq(t.conversations.id, sp.conversation),
          with: { messages: { limit: 1, orderBy: (m, { asc }) => [asc(m.createdAt)] } },
        })
      : Promise.resolve(undefined),
  ]);

  return (
    <>
      <PageHeader
        title="New support ticket"
        back={conversation ? { href: `/admin/inbox/${conversation.id}`, label: "Back to message" } : { href: "/admin/tickets", label: "Tickets" }}
      />
      <Card className="max-w-3xl p-6">
        <TicketForm
          clients={clients}
          apps={apps.map((a) => ({ value: a.id, label: a.name }))}
          departments={departments}
          team={team}
          defaults={{
            subject: conversation?.subject ?? undefined,
            description: conversation?.messages[0]?.body,
            clientId: conversation?.clientId ?? sp.client,
            appId: sp.app,
            conversationId: conversation?.id,
          }}
        />
      </Card>
    </>
  );
}
