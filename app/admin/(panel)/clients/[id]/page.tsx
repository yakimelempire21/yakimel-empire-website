import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { Badge, Card, PageHeader, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { formatDate, formatMoney, humanize, SOURCE_LABELS, statusTone } from "@/lib/admin/format";
import { canAccess } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";
import { updateClient } from "../actions";
import { balance, displayStatus, invoiceNumber } from "@/lib/admin/finance";
import ClientForm from "../ClientForm";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("clients");
  const { id } = await params;

  const client = await db.query.clients.findFirst({
    where: eq(t.clients.id, id),
    with: {
      projects: { orderBy: desc(t.projects.createdAt) },
      conversations: { orderBy: desc(t.conversations.createdAt) },
      invoices: { orderBy: desc(t.invoices.number) },
      documents: { orderBy: desc(t.documents.createdAt) },
    },
  });
  if (!client) notFound();

  return (
    <>
      <PageHeader
        title={client.fullName}
        description={`${client.email} · Client since ${formatDate(client.createdAt)}`}
        back={{ href: "/admin/clients", label: "Clients" }}
        action={<Badge tone={statusTone(client.status)}>{humanize(client.status)}</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <h2 className="mb-5 font-display font-bold">Details</h2>
          <ClientForm action={updateClient.bind(null, client.id)} client={client} submitLabel="Save changes" />
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between border-b border-os-ink/15 px-5 py-4">
              <h2 className="font-display font-bold">Projects</h2>
              {canAccess(user.role, "projects") && (
                <Link href={`/admin/projects/new?client=${client.id}`} className={`${primaryButton} px-3 py-1.5 text-xs`}>
                  New project
                </Link>
              )}
            </div>
            {client.projects.length === 0 ? (
              <p className="px-5 py-6 text-sm text-os-muted">No projects yet.</p>
            ) : (
              <ul className="divide-y divide-os-ink/10">
                {client.projects.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/projects/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-os-ink/[0.03]">
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-os-muted">
                          {p.service} · {formatMoney(p.budget)}
                        </p>
                      </div>
                      <Badge tone={statusTone(p.status)}>{humanize(p.status)}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {canAccess(user.role, "finance") && (
            <Card>
              <div className="flex items-center justify-between border-b border-os-ink/15 px-5 py-4">
                <h2 className="font-display font-bold">Invoices</h2>
                <Link href={`/admin/invoices/new?client=${client.id}`} className={`${primaryButton} px-3 py-1.5 text-xs`}>
                  New invoice
                </Link>
              </div>
              {client.invoices.length === 0 ? (
                <p className="px-5 py-6 text-sm text-os-muted">No invoices yet.</p>
              ) : (
                <ul className="divide-y divide-os-ink/10">
                  {client.invoices.map((inv) => {
                    const s = displayStatus(inv);
                    return (
                      <li key={inv.id}>
                        <Link href={`/admin/invoices/${inv.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-os-ink/[0.03]">
                          <span className="font-mono text-sm">{invoiceNumber(inv.number)}</span>
                          <span className="text-sm">{formatMoney(inv.total)}</span>
                          <span className="text-xs text-os-muted">{s === "PAID" ? "Paid" : `${formatMoney(balance(inv))} due`}</span>
                          <Badge tone={statusTone(s)}>{humanize(s)}</Badge>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          )}

          {canAccess(user.role, "documents") && client.documents.length > 0 && (
            <Card>
              <h2 className="border-b border-os-ink/15 px-5 py-4 font-display font-bold">Contracts & documents</h2>
              <ul className="divide-y divide-os-ink/10">
                {client.documents.map((d) => (
                  <li key={d.id}>
                    <a href={`/admin/documents/${d.id}/download`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-os-ink/[0.03]">
                      <span className="min-w-0 truncate text-sm font-medium">{d.title}</span>
                      <Badge tone={statusTone(d.status)}>{humanize(d.status)}</Badge>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <h2 className="border-b border-os-ink/15 px-5 py-4 font-display font-bold">Messages</h2>
            {client.conversations.length === 0 ? (
              <p className="px-5 py-6 text-sm text-os-muted">No messages yet.</p>
            ) : (
              <ul className="divide-y divide-os-ink/10">
                {client.conversations.map((c) => (
                  <li key={c.id}>
                    <Link href={`/admin/inbox/${c.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-os-ink/[0.03]">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.subject ?? "—"}</p>
                        <p className="text-xs text-os-muted">
                          {SOURCE_LABELS[c.source]} · {formatDate(c.createdAt)}
                        </p>
                      </div>
                      <Badge tone={statusTone(c.status)}>{humanize(c.status)}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
