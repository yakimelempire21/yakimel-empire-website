import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { Badge, Card, PageHeader, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { formatDate, formatMoney, humanize, SOURCE_LABELS, statusTone } from "@/lib/admin/format";
import { canAccess } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";
import { updateClient } from "../actions";
import ClientForm from "../ClientForm";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("clients");
  const { id } = await params;

  const client = await db.query.clients.findFirst({
    where: eq(t.clients.id, id),
    with: {
      projects: { orderBy: desc(t.projects.createdAt) },
      conversations: { orderBy: desc(t.conversations.createdAt) },
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
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="font-display font-bold">Projects</h2>
              {canAccess(user.role, "projects") && (
                <Link href={`/admin/projects/new?client=${client.id}`} className={`${primaryButton} px-3 py-1.5 text-xs`}>
                  New project
                </Link>
              )}
            </div>
            {client.projects.length === 0 ? (
              <p className="px-5 py-6 text-sm text-dim-invert">No projects yet.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {client.projects.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/projects/${p.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-white/[0.03]">
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-dim-invert">
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

          <Card>
            <h2 className="border-b border-white/10 px-5 py-4 font-display font-bold">Messages</h2>
            {client.conversations.length === 0 ? (
              <p className="px-5 py-6 text-sm text-dim-invert">No messages yet.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {client.conversations.map((c) => (
                  <li key={c.id}>
                    <Link href={`/admin/inbox/${c.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-white/[0.03]">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.subject ?? "—"}</p>
                        <p className="text-xs text-dim-invert">
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
