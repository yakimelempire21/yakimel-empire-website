"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SelectField, inputClass, labelClass, primaryButton } from "@/components/admin/ui";
import { createInvoice, type InvoiceFormState } from "./actions";

type Option = { value: string; label: string };
type Item = { description: string; quantity: string; unitPrice: string };

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function InvoiceForm({
  clients,
  projects,
  presets,
  defaults,
}: {
  clients: Option[];
  projects: (Option & { clientId: string })[];
  presets: { label: string; price: string }[];
  defaults: { clientId?: string; projectId?: string; issueDate: string; dueDate: string };
}) {
  const [state, action, pending] = useActionState<InvoiceFormState, FormData>(createInvoice, undefined);
  const [clientId, setClientId] = useState(defaults.clientId ?? "");
  const [items, setItems] = useState<Item[]>([{ description: "", quantity: "1", unitPrice: "" }]);

  const total = useMemo(() => items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0), [items]);
  const update = (index: number, patch: Partial<Item>) => setItems((list) => list.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  const addPreset = (p: { label: string; price: string }) =>
    setItems((list) => {
      const blank = list.findIndex((i) => !i.description && !i.unitPrice);
      const item = { description: p.label, quantity: "1", unitPrice: p.price };
      return blank === -1 ? [...list, item] : list.map((it, i) => (i === blank ? item : it));
    });

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className={labelClass}>
            Client <span className="text-os-accent">*</span>
          </span>
          <select name="clientId" required value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
            <option value="">Choose a client</option>
            {clients.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <SelectField
          label="Project"
          name="projectId"
          options={projects.filter((p) => !clientId || p.clientId === clientId)}
          defaultValue={defaults.projectId}
        />
        <label className="block">
          <span className={labelClass}>
            Issue date <span className="text-os-accent">*</span>
          </span>
          <input name="issueDate" type="date" required defaultValue={defaults.issueDate} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Due date</span>
          <input name="dueDate" type="date" defaultValue={defaults.dueDate} className={inputClass} />
        </label>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={`${labelClass} mb-0`}>Quick add:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => addPreset(p)}
              className="rounded-full border border-os-ink/15 px-3 py-1 text-xs text-os-muted hover:border-os-accent/60 hover:text-os-ink"
            >
              {p.label} · {money(Number(p.price))}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-os-ink/15">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-os-ink/15 text-xs uppercase tracking-wider text-os-muted">
                <th className="px-3 py-2.5 text-left font-medium">Description</th>
                <th className="w-24 px-3 py-2.5 text-left font-medium">Qty</th>
                <th className="w-36 px-3 py-2.5 text-left font-medium">Unit price</th>
                <th className="w-32 px-3 py-2.5 text-right font-medium">Amount</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-os-ink/10 last:border-0">
                  <td className="px-3 py-2">
                    <input
                      value={item.description}
                      onChange={(e) => update(i, { description: e.target.value })}
                      placeholder="Business website — 5 pages"
                      aria-label={`Line ${i + 1} description`}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={item.quantity}
                      onChange={(e) => update(i, { quantity: e.target.value })}
                      inputMode="decimal"
                      aria-label={`Line ${i + 1} quantity`}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={item.unitPrice}
                      onChange={(e) => update(i, { unitPrice: e.target.value })}
                      inputMode="decimal"
                      placeholder="0.00"
                      aria-label={`Line ${i + 1} unit price`}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium">{money((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}</td>
                  <td className="px-2 py-2">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setItems((list) => list.filter((_, idx) => idx !== i))}
                        aria-label={`Remove line ${i + 1}`}
                        className="text-os-muted hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setItems((list) => [...list, { description: "", quantity: "1", unitPrice: "" }])}
            className="inline-flex items-center gap-1.5 text-sm text-os-accent hover:underline"
          >
            <Plus size={15} aria-hidden="true" /> Add line
          </button>
          <p className="text-lg">
            Total <span className="ml-2 font-display text-2xl font-bold">{money(total)}</span>
          </p>
        </div>
      </div>

      <label className="block">
        <span className={labelClass}>Notes / payment instructions</span>
        <textarea
          name="notes"
          rows={3}
          defaultValue="Thank you for your business! Payment accepted by Zelle, card or bank transfer."
          className={`${inputClass} resize-y`}
        />
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Creating…" : "Create invoice"}
      </button>
    </form>
  );
}
