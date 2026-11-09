"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { inputClass, labelClass, primaryButton } from "@/components/admin/ui";
import { addExpense, addSubscription, type FinanceFormState } from "./actions";

type Option = { value: string; label: string };

function useResetOnSave(state: FinanceFormState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.saved) ref.current?.reset();
  }, [state]);
  return ref;
}

export function ExpenseForm({ categories, departments, today }: { categories: string[]; departments: Option[]; today: string }) {
  const [state, action, pending] = useActionState<FinanceFormState, FormData>(addExpense, undefined);
  const ref = useResetOnSave(state);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[0.9fr_1.3fr_1fr_0.8fr]">
        <label className="block">
          <span className={labelClass}>Date</span>
          <input name="date" type="date" required defaultValue={today} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Category</span>
          <select name="category" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Choose…
            </option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Vendor</span>
          <input name="vendor" placeholder="Vercel, Google…" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Amount</span>
          <input name="amount" inputMode="decimal" required placeholder="0.00" className={inputClass} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className={labelClass}>Description</span>
          <input name="description" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Department</span>
          <select name="departmentId" defaultValue="" className={inputClass}>
            <option value="">—</option>
            {departments.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : "Add expense"}
        </button>
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    </form>
  );
}

export function SubscriptionForm({ clients }: { clients: Option[] }) {
  const [state, action, pending] = useActionState<FinanceFormState, FormData>(addSubscription, undefined);
  const ref = useResetOnSave(state);
  const [kind, setKind] = useState<"INCOME" | "EXPENSE">("INCOME");
  return (
    <form ref={ref} action={action} className="space-y-3">
      <div className="flex gap-2" role="radiogroup" aria-label="Type">
        {(["INCOME", "EXPENSE"] as const).map((k) => (
          <label
            key={k}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-sm ${
              kind === k ? "bg-os-accent text-white" : "border border-os-ink/15 text-os-muted"
            }`}
          >
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
            {k === "INCOME" ? "Client plan (income)" : "Company cost (expense)"}
          </label>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.4fr_1.2fr_0.8fr_0.9fr_0.9fr_auto] xl:items-end">
        <label className="block">
          <span className={labelClass}>Name</span>
          <input
            name="name"
            required
            placeholder={kind === "INCOME" ? "Website Maintenance plan" : "Vercel Pro"}
            className={inputClass}
          />
        </label>
        {kind === "INCOME" ? (
          <label className="block">
            <span className={labelClass}>Client</span>
            <select name="clientId" defaultValue="" className={inputClass}>
              <option value="">—</option>
              {clients.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="block">
            <span className={labelClass}>Vendor</span>
            <input name="vendor" className={inputClass} />
          </label>
        )}
        <label className="block">
          <span className={labelClass}>Amount</span>
          <input name="amount" inputMode="decimal" required placeholder="79.00" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Every</span>
          <select name="interval" defaultValue="MONTHLY" className={inputClass}>
            <option value="MONTHLY">Month</option>
            <option value="QUARTERLY">Quarter</option>
            <option value="YEARLY">Year</option>
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Next date</span>
          <input name="nextDate" type="date" className={inputClass} />
        </label>
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : "Add"}
        </button>
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
