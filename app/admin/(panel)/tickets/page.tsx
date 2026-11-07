import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { Badge, EmptyState, PageHeader, Table, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { TICKET_STATUSES, formatDate, humanize, statusTone } from "@/lib/admin/format";
import { teamOptions } from "@/lib/admin/lookups";
import { db, tables as t } from "@/lib/db";

const priorityTone = { LOW: "gray", MEDIUM: "blue", HIGH: "amber", CRITICAL: "red" } as const;

export default async function TicketsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireUser("tickets");
  const { status } = await searchParams;
  const filter = (TICKET_STATUSES as readonly string[]).includes(status ?? "")
    ? (status as (typeof TICKET_STATUSES)[number])
    : undefined;

  const [tickets, team] = await Promise.all([
    db.query.supportTickets.findMany({
      where: filter ? eq(t.supportTickets.status, filter) : inArray(t.supportTickets.status, ["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT"]),
      orderBy: desc(t.supportTickets.createdAt),
      limit: 300,
      with: { client: { columns: { fullName: true } }, app: { columns: { name: true } } },
    }),
    teamOptions(),
  ]);
  const names = new Map(team.map((m) => [m.value, m.label]));

  return (
    <>
      <PageHeader
        title="Support Tickets"
        description="Requests from yakimelempire.com, your apps and clients."
        action={
          <Link href="/admin/tickets/new" className={primaryButton}>
            New ticket
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {[{ label: "Active", value: undefined }, ...TICKET_STATUSES.map((s) => ({ label: humanize(s), value: s }))].map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/admin/tickets?status=${tab.value}` : "/admin/tickets"}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              tab.value === filter ? "bg-[#2F6FEA] text-white" : "border border-white/10 text-[#a2adc4] hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {tickets.length === 0 ? (
        <EmptyState title="No tickets here" body="Create a ticket, or turn an inbox message into one with “Create ticket”." />
      ) : (
        <Table head={["Ticket", "Client / App", "Priority", "Status", "Assigned", "Opened"]}>
          {tickets.map((tk) => (
            <tr key={tk.id} className="hover:bg-white/[0.03]">
              <td className="px-5 py-3.5">
                <Link href={`/admin/tickets/${tk.id}`} className="font-medium hover:text-[#4d8dff]">
                  {tk.subject}
                </Link>
                <p className="font-mono text-xs text-[#7f93b8]">TKT-{tk.number}</p>
              </td>
              <td className="px-5 py-3.5 text-[#a2adc4]">{[tk.client?.fullName, tk.app?.name].filter(Boolean).join(" · ") || "—"}</td>
              <td className="px-5 py-3.5">
                <Badge tone={priorityTone[tk.priority]}>{humanize(tk.priority)}</Badge>
              </td>
              <td className="px-5 py-3.5">
                <Badge tone={statusTone(tk.status)}>{humanize(tk.status)}</Badge>
              </td>
              <td className="px-5 py-3.5 text-[#a2adc4]">{tk.assigneeId ? (names.get(tk.assigneeId) ?? "Team member") : "—"}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-[#a2adc4]">{formatDate(tk.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
