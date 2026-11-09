"use client";

import { useActionState } from "react";
import { Field, SelectField, inputClass, labelClass, primaryButton } from "@/components/admin/ui";
import { addReview, type ReviewFormState } from "./actions";

export default function AddReviewForm({ services }: { services: string[] }) {
  const [state, action, pending] = useActionState<ReviewFormState, FormData>(addReview, undefined);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Client name" name="name" required />
        <Field label="Business" name="company" />
        <Field label="Role" name="role" placeholder="Owner, Manager…" />
        <SelectField
          label="Rating"
          name="rating"
          required
          defaultValue="5"
          options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${"★".repeat(n)} (${n})` }))}
        />
      </div>
      <SelectField label="Service" name="service" options={services.map((s) => ({ value: s, label: s }))} />
      <label className="block">
        <span className={labelClass}>
          Review <span className="text-os-accent">*</span>
        </span>
        <textarea name="body" required rows={4} maxLength={1200} className={inputClass} placeholder="The client's words, exactly as they wrote them" />
      </label>
      <label className="flex items-start gap-3 text-sm text-os-muted">
        <input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 accent-os-accent" />
        The client agreed to have this review, their name and business shown on yakimelempire.com.
      </label>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="text-sm text-emerald-700">Review added and published.</p>}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Saving…" : "Add & publish review"}
      </button>
    </form>
  );
}
