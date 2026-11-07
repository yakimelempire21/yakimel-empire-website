import Link from "next/link";

/** Shared building blocks for the Command Center screens. */

/** Glass panel used across YAKIMEL OS. */
export const glass =
  "border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_24px_60px_-32px_rgba(0,0,0,0.9)]";

export const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#0c0f16] px-3.5 py-2.5 text-sm text-ink-invert placeholder:text-dim-invert/60 focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40";
export const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-dim-invert";
export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-ink-invert transition-colors hover:border-brand hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

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
        <Link href={back.href} className="mb-3 inline-block text-sm text-dim-invert hover:text-ink-invert">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-invert md:text-3xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-dim-invert">{description}</p>}
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
  blue: "bg-brand/15 text-[#8fb3ff]",
  green: "bg-emerald-400/10 text-emerald-300",
  amber: "bg-amber-400/10 text-amber-300",
  red: "bg-red-400/10 text-red-300",
  gray: "bg-white/5 text-dim-invert",
  violet: "bg-violet-400/10 text-violet-300",
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
      <p className="font-display text-lg font-bold text-ink-invert">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-sm text-dim-invert">{body}</p>}
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
          <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-dim-invert">
            {head.map((h) => (
              <th key={h} className="px-5 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-ink-invert">{children}</tbody>
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
        {required && <span className="text-brand"> *</span>}
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
        {required && <span className="text-brand"> *</span>}
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
