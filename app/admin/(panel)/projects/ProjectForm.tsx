"use client";

import { useActionState } from "react";
import { Field, SelectField, inputClass, labelClass, primaryButton } from "@/components/admin/ui";
import type { FormState } from "./actions";

type Option = { value: string; label: string };
type Project = {
  clientId: string;
  name: string;
  service: string;
  description: string | null;
  budget: string | null;
  deposit: string | null;
  deadline: Date | null;
  departmentId: string | null;
  projectManagerId: string | null;
  status: string;
};

const toInputDate = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : undefined);

export default function ProjectForm({
  action,
  project,
  defaultClientId,
  clients,
  departments,
  managers,
  statuses,
  submitLabel,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  project?: Project;
  defaultClientId?: string;
  clients: Option[];
  departments: Option[];
  managers: Option[];
  statuses: Option[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Client" name="clientId" required options={clients} defaultValue={project?.clientId ?? defaultClientId} />
        <Field label="Project name" name="name" required defaultValue={project?.name} />
        <Field label="Service" name="service" required defaultValue={project?.service} placeholder="Business Website, Shopify…" />
        <SelectField label="Status" name="status" required options={statuses} defaultValue={project?.status ?? "LEAD"} />
        <Field label="Budget (USD)" name="budget" defaultValue={project?.budget} />
        <Field label="Deposit (USD)" name="deposit" defaultValue={project?.deposit} />
        <Field label="Deadline" name="deadline" type="date" defaultValue={toInputDate(project?.deadline ?? null)} />
        <SelectField label="Department" name="departmentId" options={departments} defaultValue={project?.departmentId} />
        <SelectField label="Project manager" name="projectManagerId" options={managers} defaultValue={project?.projectManagerId} />
      </div>
      <label className="block">
        <span className={labelClass}>Description</span>
        <textarea name="description" rows={4} defaultValue={project?.description ?? ""} className={`${inputClass} resize-y`} />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.saved && (
        <p role="status" className="text-sm text-emerald-700">
          Saved.
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
