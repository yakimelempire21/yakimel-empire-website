import Link from "next/link";

/** Shared building blocks for the Command Center screens. */

/** Card surface used across YAKIMEL OS. */
export const glass =
  "border border-os-ink/15 bg-white shadow-[0_1px_0_rgba(14,59,50,0.04),0_12px_32px_-18px_rgba(14,59,50,0.25)]";

export const inputClass =
  "w-full rounded-xl border border-os-ink/20 bg-white px-3.5 py-2.5 text-sm text-os-ink placeholder:text-os-muted/60 focus:border-os-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-os-accent/40";
export const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-os-muted";
export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-os-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-os-accent disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-os-accent";
export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-os-ink/25 bg-white px-4 py-2.5 text-sm font-medium text-os-ink transition-colors hover:border-os-accent hover:bg-os-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-os-accent";

export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-3 inline-block text-sm text-os-muted hover:text-os-ink">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-os-ink md:text-5xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-os-muted">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl ${glass} ${className}`}>{children}</div>;
}

const TONES = {
  blue: "bg-os-lilac text-os-accent-dark",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-os-ink/5 text-os-muted",
  violet: "bg-os-lilac text-os-accent-dark",
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <Card className="px-6 py-14 text-center">
      <p className="font-display text-lg font-bold text-os-ink">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-sm text-os-muted">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}

/** A responsive table wrapper: scrolls sideways on small screens. */
export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-os-ink/15 text-xs uppercase tracking-wider text-os-muted">
            {head.map((h) => (
              <th key={h} className="px-5 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-os-ink/10 text-os-ink">{children}</tbody>
      </table>
    </Card>
  );
}

export function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {required && <span className="text-os-accent"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? undefined}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

export function SelectField({
  label,
  name,
  options,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {required && <span className="text-os-accent"> *</span>}
      </span>
      <select name={name} required={required} defaultValue={defaultValue ?? ""} className={inputClass}>
        {!required && <option value="">—</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
