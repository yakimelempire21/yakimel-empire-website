"use client";

import { useActionState } from "react";
import { Field, inputClass, labelClass, primaryButton } from "@/components/admin/ui";
import { APPLICATION_STATUSES, humanize } from "@/lib/admin/format";
import { addApplicant, type ApplicantFormState } from "../../actions";

export default function ApplicantForm({ jobs, jobId }: { jobs: { id: string; title: string }[]; jobId?: string }) {
  const [state, action, pending] = useActionState<ApplicantFormState, FormData>(addApplicant, undefined);
  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className={labelClass}>
            Job<span className="text-os-accent"> *</span>
          </span>
          <select name="jobId" required defaultValue={jobId ?? ""} className={inputClass}>
            <option value="" disabled>
              Choose a job…
            </option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Stage</span>
          <select name="status" defaultValue="NEW" className={inputClass}>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </select>
        </label>
        <Field label="Full name" name="fullName" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone / WhatsApp" name="phone" placeholder="+1 …" />
        <Field label="Location" name="location" placeholder="City, country" />
      </div>
      <Field label="Link (LinkedIn, portfolio…)" name="linkUrl" type="url" placeholder="https://" />
      <label className="block">
        <span className={labelClass}>How we found them / notes</span>
        <textarea name="notes" rows={4} className={inputClass} placeholder="Referred by…, met on WhatsApp, interview notes…" />
      </label>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Adding…" : "Add applicant"}
      </button>
    </form>
  );
}
