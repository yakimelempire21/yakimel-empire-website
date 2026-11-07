import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { Badge, Card, EmptyState, PageHeader, Table } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { CONVERSATION_STATUSES, formatDate, humanize, SOURCE_LABELS, statusTone } from "@/lib/admin/format";
import { db, tables as t } from "@/lib/db";

type Status = (typeof CONVERSATION_STATUSES)[number];
const SOURCES = [
  "WEBSITE_PROJECT_REQUEST",
  "WEBSITE_INQUIRY",
  "DIGIMARKET_SUPPORT",
  "HEALTHHYR_SUPPORT",
  "EZNOB",
  "INTERNAL_TEAM",
  "SYSTEM_ALERT",
] as const;
type Source = (typeof SOURCES)[number];

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ status?: string; source?: string }> }) {
  await requireUser("inbox");
  const sp = await searchParams;
  const status = (CONVERSATION_STATUSES as readonly string[]).includes(sp.status ?? "") ? (sp.status as Status) : undefined;
  const source = (SOURCES as readonly string[]).includes(sp.source ?? "") ? (sp.source as Source) : undefined;

  const [rows, openBySource] = await Promise.all([
    db.query.conversations.findMany({
      where: and(status ? eq(t.conversations.status, status) : undefined, source ? eq(t.conversations.source, source) : undefined),
      orderBy: [desc(t.conversations.isPriority), desc(t.conversations.createdAt)],
      limit: 200,
      with: { client: { columns: { fullName: true, email: true } } },
    }),
    db
      .select({ source: t.conversations.source, n: count() })
      .from(t.conversations)
      .where(eq(t.conversations.status, "OPEN"))
      .groupBy(t.conversations.source),
  ]);
  const openCount = new Map(openBySource.map((r) => [r.source, r.n]));
  const href = (next: { status?: string; source?: string }) => {
    const p = new URLSearchParams();
    if (next.status) p.set("status", next.status);
    if (next.source) p.set("source", next.source);
    const qs = p.toString();
    return qs ? `/admin/inbox?${qs}` : "/admin/inbox";
  };

  return (
    <>
      <PageHeader title="Inbox" description="One place for every message: website, apps, divisions, team and system alerts." />

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit p-2">
          <nav aria-label="Inbox sources">
            <ul className="space-y-0.5 text-sm">
              {[{ value: undefined, label: "All messages" }, ...SOURCES.map((s) => ({ value: s, label: SOURCE_LABELS[s] }))].map((item) => {
                const active = item.value === source;
                const n = item.value ? (openCount.get(item.value) ?? 0) : [...openCount.values()].reduce((a, b) => a + b, 0);
                return (
                  <li key={item.label}>
                    <Link
                      href={href({ status, source: item.value })}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                        active ? "bg-[#2F6FEA]/20 text-white" : "text-[#a2adc4] hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {item.label}
                      {n > 0 && <span className="text-xs font-semibold text-[#7fa8ff]">{n}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </Card>

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {[{ label: "All", value: undefined }, ...CONVERSATION_STATUSES.map((s) => ({ label: humanize(s), value: s }))].map((tab) => (
              <Link
                key={tab.label}
                href={href({ status: tab.value, source })}
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  tab.value === status ? "bg-[#2F6FEA] text-white" : "border border-white/10 text-[#a2adc4] hover:text-white"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {rows.length === 0 ? (
            <EmptyState
              title="No messages here"
              body="Website contact forms and project requests arrive automatically. App support messages arrive once each app is connected."
            />
          ) : (
            <Table head={["From", "Subject", "Source", "Status", "Received"]}>
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/inbox/${c.id}`} className="font-medium hover:text-[#4d8dff]">
                      {c.isPriority && (
                        <span className="mr-1 text-amber-300" aria-label="Priority">
                          ★
                        </span>
                      )}
                      {c.client?.fullName ?? "Unknown"}
                    </Link>
                    <p className="text-xs text-[#7f93b8]">{c.client?.email}</p>
                  </td>
                  <td className="max-w-xs truncate px-5 py-3.5">
                    <Link href={`/admin/inbox/${c.id}`}>{c.subject ?? "—"}</Link>
                  </td>
                  <td className="px-5 py-3.5 text-[#a2adc4]">{SOURCE_LABELS[c.source]}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={statusTone(c.status)}>{humanize(c.status)}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[#a2adc4]">{formatDate(c.createdAt, true)}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
