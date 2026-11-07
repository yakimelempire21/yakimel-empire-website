import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { glass } from "@/components/admin/ui";
import { formatMetric, humanize, metricLabel, timeAgo } from "@/lib/admin/format";
import type { AppWithMetrics } from "@/lib/admin/ecosystem";

const STATUS = {
  LIVE: { dot: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]", text: "text-emerald-300" },
  DEVELOPMENT: { dot: "bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]", text: "text-violet-300" },
  MAINTENANCE: { dot: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]", text: "text-amber-300" },
  OFFLINE: { dot: "bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.9)]", text: "text-red-300" },
} as const;

/** Ecosystem tile: status, live metrics (when the app reports them) and progress. */
export default function AppCard({ app }: { app: AppWithMetrics }) {
  const s = STATUS[app.status];
  const metrics = Object.entries(app.metrics ?? {}).slice(0, 4);

  return (
    <Link
      href={`/admin/apps/${app.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-[#2F6FEA]/40 ${glass}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#2F6FEA]/0 blur-3xl transition-colors group-hover:bg-[#2F6FEA]/20"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold text-white">{app.name}</h3>
          <p className={`mt-1 flex items-center gap-2 text-xs font-medium ${s.text}`}>
            <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden="true" />
            {humanize(app.status)}
          </p>
        </div>
        <ArrowUpRight size={18} aria-hidden="true" className="shrink-0 text-[#5d6b86] transition-colors group-hover:text-white" />
      </div>

      {metrics.length > 0 ? (
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
          {metrics.map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] uppercase tracking-wider text-[#7f93b8]">{metricLabel(k)}</dt>
              <dd className="font-display text-lg font-bold text-white">{formatMetric(k, v)}</dd>
            </div>
          ))}
        </dl>
      ) : app.status === "DEVELOPMENT" && app.progressPercent != null ? null : (
        <p className="mt-5 text-sm text-[#7f93b8]">{app.connected ? "Waiting for the first report…" : "Not connected yet"}</p>
      )}

      {app.status === "DEVELOPMENT" && app.progressPercent != null && (
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs text-[#a2adc4]">
            <span>Progress</span>
            <span className="font-semibold text-white">{app.progressPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2F6FEA] to-[#7fa8ff] shadow-[0_0_12px_rgba(77,141,255,0.8)]"
              style={{ width: `${app.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {app.reportedAt && <p className="mt-4 text-[11px] text-[#5d6b86]">Updated {timeAgo(app.reportedAt)}</p>}
    </Link>
  );
}
