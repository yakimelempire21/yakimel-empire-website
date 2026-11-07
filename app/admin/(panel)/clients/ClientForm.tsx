"use client";

import { useActionState } from "react";
import { Field, SelectField, inputClass, labelClass, primaryButton } from "@/components/admin/ui";
import type { FormState } from "./actions";

type Client = {
  fullName: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  source: string | null;
  notes: string | null;
  status: string;
};

const STATUS_OPTIONS = [
  { value: "LEAD", label: "Lead" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAST", label: "Past" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function ClientForm({
  action,
  client,
  submitLabel,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  client?: Client;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="fullName" required defaultValue={client?.fullName} />
        <Field label="Email" name="email" type="email" required defaultValue={client?.email} />
        <Field label="Phone" name="phone" defaultValue={client?.phone} />
        <Field label="Company" name="company" defaultValue={client?.company} />
        <Field label="Website" name="website" defaultValue={client?.website} />
        <Field label="Source" name="source" defaultValue={client?.source} placeholder="Referral, Instagram…" />
        <SelectField label="Status" name="status" required options={STATUS_OPTIONS} defaultValue={client?.status ?? "LEAD"} />
      </div>
      <label className="block">
        <span className={labelClass}>Notes</span>
        <textarea name="notes" rows={4} defaultValue={client?.notes ?? ""} className={`${inputClass} resize-y`} />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
