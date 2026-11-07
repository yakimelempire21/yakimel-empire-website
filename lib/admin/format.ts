import type { Tone } from "@/components/admin/ui";

export function formatDate(d: Date | string | null | undefined, withTime = false): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "America/New_York",
  });
}

export function formatMoney(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  return Number(v).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** "IN_PROGRESS" → "In progress" */
export function humanize(v: string): string {
  const s = v.toLowerCase().replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const PROJECT_STATUSES = [
  "LEAD",
  "CONSULTATION",
  "PROPOSAL",
  "CONTRACT",
  "DEPOSIT",
  "DESIGN",
  "DEVELOPMENT",
  "TESTING",
  "CLIENT_REVIEW",
  "COMPLETED",
  "CANCELLED",
] as const;
export const CLIENT_STATUSES = ["LEAD", "ACTIVE", "PAST", "ARCHIVED"] as const;
export const CONVERSATION_STATUSES = ["OPEN", "ASSIGNED", "PENDING", "RESOLVED", "CLOSED"] as const;
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT", "RESOLVED", "CLOSED"] as const;
export const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const EMPLOYEE_STATUSES = ["ACTIVE", "SUSPENDED", "INVITED", "DEACTIVATED"] as const;

export function statusTone(status: string): Tone {
  switch (status) {
    case "OPEN":
    case "LEAD":
    case "TODO":
      return "blue";
    case "ACTIVE":
    case "LIVE":
    case "COMPLETED":
    case "DONE":
    case "RESOLVED":
      return "green";
    case "PENDING":
    case "CONSULTATION":
    case "PROPOSAL":
    case "CONTRACT":
    case "DEPOSIT":
    case "IN_REVIEW":
    case "CLIENT_REVIEW":
    case "MAINTENANCE":
    case "INVITED":
      return "amber";
    case "PAID":
    case "SIGNED":
      return "green";
    case "SENT":
    case "PARTIAL":
    case "DRAFT":
    case "PAUSED":
      return status === "DRAFT" ? "gray" : status === "PAUSED" ? "amber" : "blue";
    case "OVERDUE":
    case "VOID":
    case "EXPIRED":
    case "CANCELLED":
    case "BLOCKED":
    case "OFFLINE":
    case "SUSPENDED":
    case "URGENT":
      return "red";
    case "DESIGN":
    case "DEVELOPMENT":
    case "TESTING":
    case "IN_PROGRESS":
    case "ASSIGNED":
      return "violet";
    default:
      return "gray";
  }
}

export const SOURCE_LABELS: Record<string, string> = {
  WEBSITE_INQUIRY: "Website inquiries",
  WEBSITE_PROJECT_REQUEST: "Project requests",
  DIGIMARKET_SUPPORT: "DigiMarket Support",
  HEALTHHYR_SUPPORT: "HealthHyr Support",
  EZNOB: "EZNOB",
  DREAM_INK_DIGITALS: "Dream Ink Digitals",
  INTERNAL_TEAM: "Internal Team",
  SYSTEM_ALERT: "System Alerts",
};

export const options = (values: readonly string[]) => values.map((v) => ({ value: v, label: humanize(v) }));

/** Reads a trimmed string from FormData; empty → null. */
export function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

/** "$2,000 - $3,000" → "2000" (first amount; ranges use the low end). */
export function parseMoney(v: string | null | undefined): string | null {
  const m = v?.match(/\d[\d,]*(?:\.\d+)?/);
  if (!m) return null;
  const n = m[0].replace(/,/g, "");
  return Number.isNaN(Number(n)) ? null : n;
}

/** "Good morning" / "Good afternoon" / "Good evening" in New York time. */
export function greeting(now: Date = new Date()): string {
  const hour = Number(now.toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/New_York" }));
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** "5 min ago", "3 h ago", "2 days ago". */
export function timeAgo(d: Date | string | null | undefined, now: Date = new Date()): string {
  if (!d) return "never";
  const s = Math.max(0, Math.round((now.getTime() - new Date(d).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const days = Math.floor(s / 86400);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

/** Formats an app metric: numbers get separators, "revenue"-like keys get $. */
export function formatMetric(key: string, value: unknown): string {
  if (typeof value === "number") {
    if (/revenue|sales|payout|commission|amount|mrr/i.test(key)) return formatMoney(value);
    return value.toLocaleString("en-US");
  }
  return String(value ?? "—");
}

/** "jobSeekers" / "job_seekers" → "Job seekers" */
export function metricLabel(key: string): string {
  return humanize(key.replace(/([a-z])([A-Z])/g, "$1_$2"));
}
