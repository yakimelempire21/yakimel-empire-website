"use client";

import { useActionState } from "react";
import { Printer, Send } from "lucide-react";
import { inputClass, labelClass, primaryButton, secondaryButton } from "@/components/admin/ui";
import { recordPayment, sendInvoice, type PaymentState, type SendState } from "../actions";

const METHODS = [
  ["ZELLE", "Zelle"],
  ["CASH_APP", "Cash App"],
  ["CARD", "Card"],
  ["STRIPE", "Stripe"],
  ["PAYPAL", "PayPal"],
  ["BANK_TRANSFER", "Bank transfer"],
  ["CASH", "Cash"],
  ["CHECK", "Check"],
  ["OTHER", "Other"],
];

export function SendAndPrint({ id, canSend }: { id: string; canSend: boolean }) {
  const [state, action, pending] = useActionState<SendState, FormData>(sendInvoice.bind(null, id), undefined);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {canSend && (
          <form action={action}>
            <button type="submit" disabled={pending} className={primaryButton}>
              <Send size={15} aria-hidden="true" /> {pending ? "Sending…" : "Email to client"}
            </button>
          </form>
        )}
        <button type="button" onClick={() => window.print()} className={secondaryButton}>
          <Printer size={15} aria-hidden="true" /> Print / Save PDF
        </button>
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-300">{state.error}</p>}
      {state?.sent && <p role="status" className="text-sm text-emerald-300">Invoice emailed.</p>}
    </div>
  );
}

export function PaymentForm({ id, balance, today }: { id: string; balance: number; today: string }) {
  const [state, action, pending] = useActionState<PaymentState, FormData>(recordPayment.bind(null, id), undefined);
  return (
    <form action={action} key={state?.saved ? `saved-${balance}` : "form"} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelClass}>Amount</span>
          <input name="amount" inputMode="decimal" required defaultValue={balance > 0 ? balance.toFixed(2) : ""} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Date</span>
          <input name="paidAt" type="date" required defaultValue={today} className={inputClass} />
        </label>
      </div>
      <label className="block">
        <span className={labelClass}>Method</span>
        <select name="method" defaultValue="ZELLE" className={inputClass}>
          {METHODS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Reference (optional)</span>
        <input name="reference" placeholder="Confirmation number…" className={inputClass} />
      </label>
      {state?.error && <p role="alert" className="text-sm text-red-300">{state.error}</p>}
      {state?.saved && <p role="status" className="text-sm text-emerald-300">Payment recorded.</p>}
      <button type="submit" disabled={pending} className={`${primaryButton} w-full`}>
        {pending ? "Saving…" : "Record payment"}
      </button>
    </form>
  );
}
