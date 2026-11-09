import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Badge, Card, PageHeader, inputClass, labelClass, secondaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { TICKET_PRIORITIES, TICKET_STATUSES, formatDate, humanize, statusTone } from "@/lib/admin/format";
import { teamOptions } from "@/lib/admin/lookups";
import { db, tables as t } from "@/lib/db";
import { updateTicket } from "../actions";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("tickets");
  const { id } = await params;

  const ticket = await db.query.supportTickets.findFirst({
    where: eq(t.supportTickets.id, id),
    with: { client: true, app: true, department: true, conversation: { columns: { id: true, reference: true } } },
  });
  if (!ticket) notFound();
  const team = await teamOptions();

  return (
    <>
      <PageHeader
        title={ticket.subject}
        description={`TKT-${ticket.number} · Opened ${formatDate(ticket.createdAt, true)}`}
        back={{ href: "/admin/tickets", label: "Tickets" }}
        action={<Badge tone={statusTone(ticket.status)}>{humanize(ticket.status)}</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="p-6">
          <h2 className="mb-3 font-display font-bold">Description</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-os-ink">{ticket.description}</p>
          {ticket.conversation && (
            <Link href={`/admin/inbox/${ticket.conversation.id}`} className="mt-5 inline-block text-sm text-os-accent hover:underline">
              Open the original message {ticket.conversation.reference ? `(${ticket.conversation.reference})` : ""} →
            </Link>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <form key={`${ticket.status}-${ticket.priority}-${ticket.assigneeId}`} action={updateTicket.bind(null, ticket.id)} className="space-y-4">
              <label className="block">
                <span className={labelClass}>Status</span>
                <select name="status" defaultValue={ticket.status} className={inputClass}>
                  {TICKET_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {humanize(s)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Priority</span>
                <select name="priority" defaultValue={ticket.priority} className={inputClass}>
                  {TICKET_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {humanize(p)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Assigned to</span>
                <select name="assigneeId" defaultValue={ticket.assigneeId ?? ""} className={inputClass}>
                  <option value="">Unassigned</option>
                  {team.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className={secondaryButton}>
                Update ticket
              </button>
            </form>
          </Card>

          <Card className="space-y-3 p-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-os-muted">Client</p>
              {ticket.client ? (
                <Link href={`/admin/clients/${ticket.client.id}`} className="hover:text-os-accent">
                  {ticket.client.fullName} · {ticket.client.email}
                </Link>
              ) : (
                <p>—</p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-os-muted">App</p>
              {ticket.app ? (
                <Link href={`/admin/apps/${ticket.app.slug}`} className="hover:text-os-accent">
                  {ticket.app.name}
                </Link>
              ) : (
                <p>—</p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-os-muted">Department</p>
              <p>{ticket.department?.name ?? "—"}</p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
