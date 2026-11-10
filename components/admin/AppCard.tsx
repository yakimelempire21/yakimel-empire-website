import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { glass } from "@/components/admin/ui";
import { formatMetric, humanize, metricLabel, timeAgo } from "@/lib/admin/format";
import type { AppWithMetrics } from "@/lib/admin/ecosystem";

const STATUS = {
  LIVE: { dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]", text: "text-emerald-700" },
  DEVELOPMENT: { dot: "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]", text: "text-sky-800" },
  MAINTENANCE: { dot: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]", text: "text-amber-700" },
  OFFLINE: { dot: "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.9)]", text: "text-red-700" },
} as const;

/** Ecosystem tile: status, live metrics (when the app reports them) and progress. */
export default function AppCard({ app }: { app: AppWithMetrics }) {
  const s = STATUS[app.status];
  const metrics = Object.entries(app.metrics ?? {}).slice(0, 4);

  return (
    <Link
      href={`/admin/apps/${app.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-os-accent/40 ${glass}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-os-accent/0 blur-3xl transition-colors group-hover:bg-os-accent/20"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold text-os-ink">{app.name}</h3>
          <p className={`mt-1 flex items-center gap-2 text-xs font-medium ${s.text}`}>
            <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden="true" />
            {humanize(app.status)}
            {app.health && (
              <span
                className={`ml-1 rounded-full px-2 py-px text-[10px] font-semibold ${app.health === "UP" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                title={app.checkedAt ? `Checked ${timeAgo(app.checkedAt)}` : undefined}
              >
                {app.health === "UP" ? "Online" : "Offline"}
              </span>
            )}
          </p>
        </div>
        <ArrowUpRight size={18} aria-hidden="true" className="shrink-0 text-os-faint transition-colors group-hover:text-os-ink" />
      </div>

      {metrics.length > 0 ? (
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
          {metrics.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] uppercase tracking-wider text-os-muted">{metricLabel(k)}</dt>
              <dd className="font-display text-lg font-bold text-os-ink">{formatMetric(k, v)}</dd>
            </div>
          ))}
        </dl>
      ) : app.status === "DEVELOPMENT" && app.progressPercent != null ? null : (
        <p className="mt-5 text-sm text-os-muted">{app.connected ? "Waiting for the first report…" : "Not connected yet"}</p>
      )}

      {app.status === "DEVELOPMENT" && app.progressPercent != null && (
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs text-os-muted">
            <span>Progress</span>
            <span className="font-semibold text-os-ink">{app.progressPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-os-ink/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-os-accent to-os-accent shadow-sm"
              style={{ width: `${app.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {app.reportedAt && <p className="mt-4 text-[11px] text-os-faint">Updated {timeAgo(app.reportedAt)}</p>}
    </Link>
  );
}
