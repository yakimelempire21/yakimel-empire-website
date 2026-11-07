"use client";

import { useActionState, useState } from "react";
import { Field, SelectField, inputClass, labelClass, primaryButton } from "@/components/admin/ui";
import type { FormState } from "./actions";

type Option = { value: string; label: string };
type Employee = {
  fullName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  departmentId: string;
  roleId: string;
  startDate: Date | null;
  status: string;
};

const toInputDate = (d: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : undefined);

export default function EmployeeForm({
  action,
  employee,
  departments,
  roles,
  statuses,
  submitLabel,
  allowAccess,
  readOnly,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  employee?: Employee;
  departments: Option[];
  roles: Option[];
  statuses: Option[];
  submitLabel: string;
  /** Show the "give Command Center access" option (new employees only). */
  allowAccess?: boolean;
  readOnly?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [access, setAccess] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <fieldset disabled={readOnly} className="space-y-5 disabled:opacity-70">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="fullName" required defaultValue={employee?.fullName} />
          <Field label="Job title" name="title" defaultValue={employee?.title} />
          <Field label="Email" name="email" type="email" required={access} defaultValue={employee?.email} />
          <Field label="Phone" name="phone" defaultValue={employee?.phone} />
          <SelectField label="Department" name="departmentId" required options={departments} defaultValue={employee?.departmentId} />
          <SelectField label="Role" name="roleId" required options={roles} defaultValue={employee?.roleId} />
          <Field label="Start date" name="startDate" type="date" defaultValue={toInputDate(employee?.startDate ?? null)} />
          <SelectField label="Status" name="status" required options={statuses} defaultValue={employee?.status ?? "ACTIVE"} />
        </div>

        {allowAccess && (
          <div className="rounded-xl border border-white/10 p-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="access"
                checked={access}
                onChange={(e) => setAccess(e.target.checked)}
                className="h-4 w-4 accent-[#2F6FEA]"
              />
              Give Command Center access (they can sign in with their email)
            </label>
            {access && (
              <label className="mt-4 block">
                <span className={labelClass}>Temporary password (min. 12 characters)</span>
                <input name="password" type="text" minLength={12} required autoComplete="off" className={inputClass} />
                <span className="mt-1 block text-xs text-dim-invert">Share it privately. They can change it under My account after signing in.</span>
              </label>
            )}
          </div>
        )}
      </fieldset>

      {state?.error && (
        <p role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state?.saved && (
        <p role="status" className="text-sm text-emerald-300">
          Saved.
        </p>
      )}
      {!readOnly && (
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : submitLabel}
        </button>
      )}
    </form>
  );
}
