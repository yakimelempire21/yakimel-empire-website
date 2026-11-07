import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { Badge, Card, EmptyState, PageHeader, Table, inputClass, labelClass, secondaryButton } from "@/components/admin/ui";
import { requireUser } from "@/lib/admin/auth";
import { appBySlug } from "@/lib/admin/ecosystem";
import { formatDate, formatMetric, humanize, metricLabel, statusTone, timeAgo } from "@/lib/admin/format";
import { canAccess } from "@/lib/admin/roles";
import { db, tables as t } from "@/lib/db";
import { updateApp } from "../actions";
import ApiKeyPanel from "./ApiKeyPanel";

const STATUSES = ["LIVE", "DEVELOPMENT", "MAINTENANCE", "OFFLINE"] as const;

export default async function AppControlCenter({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser("apps");
  const { slug } = await params;
  const app = await appBySlug(slug);
  if (!app) notFound();

  const [snapshots, tickets] = await Promise.all([
    db
      .select()
      .from(t.appMetricSnapshots)
      .where(eq(t.appMetricSnapshots.appId, app.id))
      .orderBy(desc(t.appMetricSnapshots.capturedAt))
      .limit(10),
    canAccess(user.role, "tickets")
      ? db.select().from(t.supportTickets).where(eq(t.supportTickets.appId, app.id)).orderBy(desc(t.supportTickets.createdAt)).limit(8)
      : Promise.resolve([]),
  ]);
  const latest = (snapshots[0]?.metrics as Record<string, unknown> | undefined) ?? null;
  const metricKeys = [...new Set(snapshots.flatMap((s) => Object.keys((s.metrics as Record<string, unknown>) ?? {})))].slice(0, 6);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.yakimelempire.com";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const endpoint = `${proto}://${host}/api/ecosystem/metrics`;

  return (
    <>
      <PageHeader
        title={`${app.name} Control Center`}
        description={[app.domain, app.department?.name].filter(Boolean).join(" · ") || undefined}
        back={{ href: "/admin/apps", label: "App Monitoring" }}
        action={
          <div className="flex items-center gap-3">
            {app.domain && (
              <a href={`https://${app.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#a2adc4] hover:text-white">
                Open site ↗
              </a>
            )}
            <Badge tone={statusTone(app.status)}>{humanize(app.status)}</Badge>
          </div>
        }
      />

      {/* Live metrics */}
      {latest ? (
        <section className="mb-6">
          <p className="mb-3 text-xs text-[#7f93b8]">Last report {timeAgo(snapshots[0].capturedAt)}</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {Object.entries(latest).map(([k, v]) => (
              <Card key={k} className="p-4">
                <p className="text-xs text-[#7f93b8]">{metricLabel(k)}</p>
                <p className="mt-2 font-display text-2xl font-bold">{formatMetric(k, v)}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <div className="mb-6">
          <EmptyState
            title="No data from this app yet"
            body="Create an API key below and have the app send its numbers. They'll appear here and on the Overview."
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {snapshots.length > 1 && (
            <Table head={["Reported", ...metricKeys.map(metricLabel)]}>
              {snapshots.map((s) => {
                const m = (s.metrics as Record<string, unknown>) ?? {};
                return (
                  <tr key={s.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-[#a2adc4]">{formatDate(s.capturedAt, true)}</td>
                    {metricKeys.map((k) => (
                      <td key={k} className="px-5 py-3">
                        {k in m ? formatMetric(k, m[k]) : "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </Table>
          )}

          <Card className="p-6">
            <h2 className="mb-4 font-display font-bold">Connect {app.name}</h2>
            <ApiKeyPanel appId={app.id} connected={Boolean(app.apiKeyHash)} endpoint={endpoint} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 font-display font-bold">Status</h2>
            <form action={updateApp.bind(null, app.id)} className="space-y-4">
              <label className="block">
                <span className={labelClass}>Status</span>
                <select name="status" defaultValue={app.status} className={inputClass}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {humanize(s)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Development progress (%)</span>
                <input name="progress" type="number" min={0} max={100} defaultValue={app.progressPercent ?? ""} className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Domain</span>
                <input name="domain" defaultValue={app.domain ?? ""} placeholder="digimarketapp.com" className={inputClass} />
              </label>
              <button type="submit" className={secondaryButton}>
                Save
              </button>
            </form>
          </Card>

          {canAccess(user.role, "tickets") && (
            <Card>
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <h2 className="font-display font-bold">Support tickets</h2>
                <Link href={`/admin/tickets/new?app=${app.id}`} className="text-sm text-[#4d8dff] hover:underline">
                  New ticket
                </Link>
              </div>
              {tickets.length === 0 ? (
                <p className="px-5 py-6 text-sm text-[#7f93b8]">No tickets for this app.</p>
              ) : (
                <ul className="divide-y divide-white/[0.05]">
                  {tickets.map((tk) => (
                    <li key={tk.id}>
                      <Link href={`/admin/tickets/${tk.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/[0.03]">
                        <span className="min-w-0 truncate text-sm">
                          <span className="font-mono text-xs text-[#7f93b8]">TKT-{tk.number}</span> {tk.subject}
                        </span>
                        <Badge tone={statusTone(tk.status)}>{humanize(tk.status)}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          <Card className="p-5 text-sm text-[#a2adc4]">
            <p className="font-medium text-white">Coming in the App Control Center phase</p>
            <p className="mt-1">
              Users, subscriptions, payments, content moderation and actions like Suspend User, Verify Seller, Approve
              Product and Refund Order, once {app.name} exposes them to YAKIMEL OS.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
