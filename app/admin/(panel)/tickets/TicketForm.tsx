"use client";

import { useActionState } from "react";
import { Field, SelectField, inputClass, labelClass, primaryButton } from "@/components/admin/ui";
import { createTicket, type TicketFormState } from "./actions";

type Option = { value: string; label: string };

export default function TicketForm({
  clients,
  apps,
  departments,
  team,
  defaults,
}: {
  clients: Option[];
  apps: Option[];
  departments: Option[];
  team: Option[];
  defaults: { subject?: string; description?: string; clientId?: string; appId?: string; conversationId?: string };
}) {
  const [state, action, pending] = useActionState<TicketFormState, FormData>(createTicket, undefined);
  const priorities = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "CRITICAL", label: "Critical" },
  ];

  return (
    <form action={action} className="space-y-5">
      {defaults.conversationId && <input type="hidden" name="conversationId" value={defaults.conversationId} />}
      <Field label="Subject" name="subject" required defaultValue={defaults.subject} />
      <label className="block">
        <span className={labelClass}>
          Description <span className="text-[#2F6FEA]">*</span>
        </span>
        <textarea name="description" required rows={5} defaultValue={defaults.description} className={`${inputClass} resize-y`} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Priority" name="priority" required options={priorities} defaultValue="MEDIUM" />
        <SelectField label="Assign to" name="assigneeId" options={team} />
        <SelectField label="Client" name="clientId" options={clients} defaultValue={defaults.clientId} />
        <SelectField label="App" name="appId" options={apps} defaultValue={defaults.appId} />
        <SelectField label="Department" name="departmentId" options={departments} />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Creating…" : "Create ticket"}
      </button>
    </form>
  );
}
