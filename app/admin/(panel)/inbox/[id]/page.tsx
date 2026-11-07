import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { Badge, Card, PageHeader, inputClass, secondaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { CONVERSATION_STATUSES, formatDate, humanize, SOURCE_LABELS, statusTone } from "@/lib/admin/format";
import { canAccess } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";
import { teamOptions } from "@/lib/admin/lookups";
import { assignConversation, convertToClient, convertToProject, setConversationStatus, togglePriority } from "../actions";
import ReplyForm from "./ReplyForm";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("inbox");
  const { id } = await params;

  const c = await db.query.conversations.findFirst({
    where: eq(t.conversations.id, id),
    with: { client: true, messages: { orderBy: asc(t.messages.createdAt) } },
  });
  if (!c) notFound();

  const details = Object.entries(c.details ?? {});
  const team = await teamOptions();

  return (
    <>
      <PageHeader
        title={c.subject ?? "Conversation"}
        description={`${SOURCE_LABELS[c.source]}${c.reference ? ` · ${c.reference}` : ""} · ${formatDate(c.createdAt, true)}`}
        back={{ href: "/admin/inbox", label: "Inbox" }}
        action={
          <div className="flex items-center gap-2">
            {c.isPriority && <Badge tone="amber">★ Priority</Badge>}
            <Badge tone={statusTone(c.status)}>{humanize(c.status)}</Badge>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          {c.messages.map((m) => (
            <Card key={m.id} className={`p-5 ${m.isInbound ? "" : "border-brand/30 bg-brand/[0.06]"}`}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium">
                  {m.senderName ?? "Unknown"}
                  {m.senderEmail && <span className="ml-2 text-xs font-normal text-dim-invert">{m.senderEmail}</span>}
                </p>
                <p className="text-xs text-dim-invert">{formatDate(m.createdAt, true)}</p>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-invert/90">{m.body}</p>
            </Card>
          ))}

          <Card className="p-5">
            <h2 className="mb-3 font-display font-bold">Reply</h2>
            <ReplyForm id={c.id} clientEmail={c.client?.email} />
          </Card>
        </div>

        <aside className="space-y-4">
          {c.client && (
            <Card className="p-5">
              <h2 className="mb-3 font-display font-bold">Client</h2>
              <p className="font-medium">{c.client.fullName}</p>
              <p className="text-sm text-dim-invert">
                <a href={`mailto:${c.client.email}`} className="hover:text-ink-invert">
                  {c.client.email}
                </a>
              </p>
              {c.client.phone && <p className="text-sm text-dim-invert">{c.client.phone}</p>}
              {c.client.company && <p className="text-sm text-dim-invert">{c.client.company}</p>}
              {canAccess(user.role, "clients") && (
                <Link href={`/admin/clients/${c.client.id}`} className="mt-3 inline-block text-sm text-brand hover:underline">
                  Open client →
                </Link>
              )}
            </Card>
          )}

          {details.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-3 font-display font-bold">Request details</h2>
              <dl className="space-y-2 text-sm">
                {details.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wider text-dim-invert">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          <Card className="space-y-4 p-5">
            <h2 className="font-display font-bold">Actions</h2>
            <form key={c.status} action={setConversationStatus.bind(null, c.id)} className="flex gap-2">
              <select name="status" defaultValue={c.status} aria-label="Status" className={inputClass}>
                {CONVERSATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {humanize(s)}
                  </option>
                ))}
              </select>
              <button type="submit" className={secondaryButton}>
                Update
              </button>
            </form>

            <form key={c.assignedToId ?? "none"} action={assignConversation.bind(null, c.id)} className="flex gap-2">
              <select name="assigneeId" defaultValue={c.assignedToId ?? ""} aria-label="Assign to" className={inputClass}>
                <option value="">Unassigned</option>
                {team.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <button type="submit" className={secondaryButton}>
                Assign
              </button>
            </form>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <form action={togglePriority.bind(null, c.id)}>
                <button type="submit" className={`${secondaryButton} w-full ${c.isPriority ? "border-amber-400/50 text-amber-300" : ""}`}>
                  {c.isPriority ? "★ Priority" : "☆ Mark priority"}
                </button>
              </form>
              {canAccess(user.role, "tickets") && (
                <Link href={`/admin/tickets/new?conversation=${c.id}`} className={`${secondaryButton} w-full`}>
                  Create ticket
                </Link>
              )}
              {c.client && c.client.status === "LEAD" && canAccess(user.role, "clients") && (
                <form action={convertToClient.bind(null, c.id)}>
                  <button type="submit" className={`${secondaryButton} w-full`}>
                    Convert to client
                  </button>
                </form>
              )}
              {c.clientId && canAccess(user.role, "projects") && (
                <form action={convertToProject.bind(null, c.id)}>
                  <button type="submit" className={`${secondaryButton} w-full`}>
                    Create project
                  </button>
                </form>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
