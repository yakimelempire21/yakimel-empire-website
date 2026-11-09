import Link from "next/link";
import { count, desc, eq, ilike, or, and } from "drizzle-orm";
import { Badge, EmptyState, PageHeader, Table, inputClass, primaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { CLIENT_STATUSES, formatDate, humanize, statusTone } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";

type Status = (typeof CLIENT_STATUSES)[number];

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  await requireUser("clients");
  const { status, q } = await searchParams;
  const filter = (CLIENT_STATUSES as readonly string[]).includes(status ?? "") ? (status as Status) : undefined;
  const search = q?.trim();

  const rows = await db
    .select({
      id: t.clients.id,
      fullName: t.clients.fullName,
      email: t.clients.email,
      company: t.clients.company,
      status: t.clients.status,
      source: t.clients.source,
      createdAt: t.clients.createdAt,
      projectCount: count(t.projects.id),
    })
    .from(t.clients)
    .leftJoin(t.projects, eq(t.projects.clientId, t.clients.id))
    .where(
      and(
        filter ? eq(t.clients.status, filter) : undefined,
        search
          ? or(
              ilike(t.clients.fullName, `%${search}%`),
              ilike(t.clients.email, `%${search}%`),
              ilike(t.clients.company, `%${search}%`),
            )
          : undefined,
      ),
    )
    .groupBy(t.clients.id)
    .orderBy(desc(t.clients.createdAt))
    .limit(300);

  return (
    <>
      <PageHeader
        title="Clients"
        description="Leads and customers. Website requests are added here automatically."
        action={
          <Link href="/admin/clients/new" className={primaryButton}>
            New client
          </Link>
        }
      />

      <form className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input name="q" defaultValue={search} placeholder="Search name, email or company" className={`${inputClass} sm:max-w-sm`} />
        <select name="status" defaultValue={filter ?? ""} aria-label="Status" className={`${inputClass} sm:w-44`}>
          <option value="">All statuses</option>
          {CLIENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg border border-os-ink/20 px-4 py-2.5 text-sm hover:border-os-accent">
          Filter
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No clients found" body={search || filter ? "Try a different search or filter." : "Add your first client, or wait for a website request."} />
      ) : (
        <Table head={["Client", "Company", "Status", "Projects", "Source", "Added"]}>
          {rows.map((c) => (
            <tr key={c.id} className="hover:bg-os-ink/[0.03]">
              <td className="px-5 py-3.5">
                <Link href={`/admin/clients/${c.id}`} className="font-medium hover:text-os-accent">
                  {c.fullName}
                </Link>
                <p className="text-xs text-os-muted">{c.email}</p>
              </td>
              <td className="px-5 py-3.5 text-os-muted">{c.company ?? "—"}</td>
              <td className="px-5 py-3.5">
                <Badge tone={statusTone(c.status)}>{humanize(c.status)}</Badge>
              </td>
              <td className="px-5 py-3.5">{c.projectCount}</td>
              <td className="px-5 py-3.5 text-os-muted">{c.source ?? "—"}</td>
              <td className="whitespace-nowrap px-5 py-3.5 text-os-muted">{formatDate(c.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
