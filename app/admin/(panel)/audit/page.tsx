import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Badge, EmptyState, PageHeader, Table } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { formatDate, humanize } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";

const tone = (a: string) =>
  a === "DELETE" || a === "LOGIN_FAILED" ? "red" : a === "PERMISSION_CHANGE" ? "amber" : a === "CREATE" ? "green" : a === "UPDATE" ? "blue" : "gray";

const LINKS: Record<string, string> = {
  client: "/admin/clients/",
  project: "/admin/projects/",
  employee: "/admin/employees/",
  ticket: "/admin/tickets/",
  conversation: "/admin/inbox/",
};

export default async function AuditLogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireUser("security");
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const size = 50;

  const rows = await db
    .select({
      id: t.auditLogs.id,
      action: t.auditLogs.action,
      resource: t.auditLogs.resource,
      resourceId: t.auditLogs.resourceId,
      metadata: t.auditLogs.metadata,
      ip: t.auditLogs.ipAddress,
      createdAt: t.auditLogs.createdAt,
      email: t.users.email,
      name: t.employees.fullName,
    })
    .from(t.auditLogs)
    .leftJoin(t.users, eq(t.users.id, t.auditLogs.userId))
    .leftJoin(t.employees, eq(t.employees.userId, t.auditLogs.userId))
    .orderBy(desc(t.auditLogs.createdAt))
    .limit(size + 1)
    .offset((page - 1) * size);
  const hasMore = rows.length > size;

  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Every sign-in and change made in YAKIMEL OS, newest first."
        back={{ href: "/admin/security", label: "Security Center" }}
      />
      {rows.length === 0 ? (
        <EmptyState title="No activity yet" />
      ) : (
        <Table head={["When", "Who", "Action", "What", "Details"]}>
          {rows.slice(0, size).map((r) => {
            const href = r.resourceId && LINKS[r.resource] ? `${LINKS[r.resource]}${r.resourceId}` : null;
            const meta = r.metadata ? JSON.stringify(r.metadata) : "";
            return (
              <tr key={r.id}>
                <td className="whitespace-nowrap px-5 py-3 text-os-muted">{formatDate(r.createdAt, true)}</td>
                <td className="px-5 py-3">{r.name ?? r.email ?? "System"}</td>
                <td className="px-5 py-3">
                  <Badge tone={tone(r.action)}>{humanize(r.action)}</Badge>
                </td>
                <td className="px-5 py-3 text-os-muted">
                  {href ? (
                    <Link href={href} className="hover:text-os-ink">
                      {humanize(r.resource)}
                    </Link>
                  ) : (
                    humanize(r.resource)
                  )}
                </td>
                <td className="max-w-xs truncate px-5 py-3 font-mono text-xs text-os-muted" title={meta}>
                  {meta || "—"}
                </td>
              </tr>
            );
          })}
        </Table>
      )}
      <div className="mt-4 flex gap-4 text-sm">
        {page > 1 && (
          <Link href={`/admin/audit?page=${page - 1}`} className="text-os-accent hover:underline">
            ← Newer
          </Link>
        )}
        {hasMore && (
          <Link href={`/admin/audit?page=${page + 1}`} className="text-os-accent hover:underline">
            Older →
          </Link>
        )}
      </div>
    </>
  );
}
