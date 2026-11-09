import { RefreshCw } from "lucide-react";
import { inputClass, labelClass, primaryButton } from "@/components/admin/ui";
import { formatDate, timeAgo } from "@/lib/admin/format";
import { refreshApp } from "../actions";

type Props = {
  appId: string;
  appName: string;
  health: string | null;
  checkedAt: Date | null;
  downSince: Date | null;
  lastError: string | null;
  metricsUrl: string | null;
  token: string | null;
  canSeeToken: boolean;
};

/** How YAKIMEL OS reaches the app: status of the automatic check, the token to set in the app, "Refresh now". */
export default function ConnectionPanel(p: Props) {
  const status =
    p.health === "UP"
      ? { label: "Online", tone: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" }
      : p.health === "DOWN"
        ? { label: "Offline", tone: "bg-red-100 text-red-700", dot: "bg-red-500" }
        : { label: "Not checked yet", tone: "bg-os-ink/5 text-os-muted", dot: "bg-os-faint" };

  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${status.tone}`}>
            <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
            {status.label}
          </span>
          <p className="mt-2 text-xs text-os-muted">
            {p.checkedAt ? `Checked ${timeAgo(p.checkedAt)} · YAKIMEL OS checks every 15 minutes` : "YAKIMEL OS checks every 15 minutes."}
            {p.health === "DOWN" && p.downSince ? ` · Offline since ${formatDate(p.downSince, true)}` : ""}
          </p>
        </div>
        <form action={refreshApp.bind(null, p.appId)}>
          <button type="submit" className={primaryButton}>
            <RefreshCw size={15} aria-hidden="true" /> Refresh now
          </button>
        </form>
      </div>

      {p.lastError && <p className="rounded-xl bg-amber-100 px-4 py-3 text-amber-800">{p.lastError}</p>}

      <div>
        <p className={labelClass}>Address YAKIMEL OS calls</p>
        <p className="break-all font-mono text-xs text-os-ink">{p.metricsUrl ?? "Add the app's domain (Status → Domain) first."}</p>
      </div>

      {p.canSeeToken &&
        (p.token ? (
          <details className="rounded-xl border border-os-ink/15 bg-os-bg p-4">
            <summary className="cursor-pointer font-medium text-os-ink">Connection token for {p.appName}</summary>
            <p className="mt-3 text-os-muted">
              In {p.appName}&apos;s hosting (Vercel → Settings → Environment Variables), add <code className="font-mono">YAKIMEL_OS_TOKEN</code> with
              this value, then redeploy {p.appName}:
            </p>
            <input readOnly value={p.token} className={`${inputClass} mt-2 font-mono text-xs`} aria-label="Connection token" />
          </details>
        ) : (
          <p className="rounded-xl bg-amber-100 px-4 py-3 text-amber-800">
            Add <code className="font-mono">CRON_SECRET</code> to the yakimel-empire-website project on Vercel to turn on the
            automatic checks and the connection token.
          </p>
        ))}
    </div>
  );
}
