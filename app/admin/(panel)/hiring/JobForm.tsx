"use client";

import { useActionState } from "react";
import { Field, inputClass, labelClass, primaryButton } from "@/components/admin/ui";
import { saveJob, type JobFormState } from "./actions";

type Job = {
  id: string;
  title: string;
  team: string | null;
  location: string | null;
  employmentType: string | null;
  compensation: string | null;
  summary: string | null;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  status: string;
};

const Area = ({ label, name, rows, value, hint, required }: { label: string; name: string; rows: number; value?: string | null; hint?: string; required?: boolean }) => (
  <label className="block">
    <span className={labelClass}>
      {label}
      {required && <span className="text-os-accent"> *</span>}
    </span>
    <textarea name={name} rows={rows} defaultValue={value ?? ""} required={required} className={inputClass} />
    {hint && <span className="mt-1 block text-xs text-os-muted">{hint}</span>}
  </label>
);

export default function JobForm({ job }: { job?: Job }) {
  const [state, action, pending] = useActionState<JobFormState, FormData>(saveJob.bind(null, job?.id ?? null), undefined);
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Job title" name="title" required defaultValue={job?.title} />
        <Field label="Team" name="team" defaultValue={job?.team} placeholder="Marketing" />
        <Field label="Location" name="location" defaultValue={job?.location} placeholder="Remote (anywhere)" />
        <Field label="Type" name="employmentType" defaultValue={job?.employmentType} placeholder="Independent contractor · Flexible hours" />
      </div>
      <Field label="Pay" name="compensation" defaultValue={job?.compensation} placeholder="Commission only — 15% of each client's first payment" />
      <Field label="Short summary (shown in the list)" name="summary" defaultValue={job?.summary} />
      <Area label="Description" name="description" rows={5} value={job?.description} required />
      <div className="grid gap-4 md:grid-cols-2">
        <Area label="What they'll do" name="responsibilities" rows={6} value={job?.responsibilities} hint="One item per line." />
        <Area label="What we're looking for" name="requirements" rows={6} value={job?.requirements} hint="One item per line." />
      </div>
      <label className="block max-w-xs">
        <span className={labelClass}>Status</span>
        <select name="status" defaultValue={job?.status ?? "DRAFT"} className={inputClass}>
          <option value="DRAFT">Draft — not on the website</option>
          <option value="OPEN">Open — published on /careers</option>
          <option value="CLOSED">Closed — no longer accepting</option>
        </select>
      </label>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.saved && <p className="text-sm text-emerald-700">Saved.</p>}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Saving…" : job ? "Save job" : "Create job"}
      </button>
    </form>
  );
}
