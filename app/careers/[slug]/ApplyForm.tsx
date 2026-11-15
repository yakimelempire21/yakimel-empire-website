"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const MAX_BYTES = 4 * 1024 * 1024;
const FILE_OK = /\.(pdf|docx?)$/i;
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Field = "fullName" | "email" | "linkUrl" | "resume";
type Errors = Partial<Record<Field, string>>;

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const label = "mb-1.5 block text-sm font-medium text-ink-invert";
const inputBase = `w-full rounded-lg border bg-white px-4 py-3 text-base text-ink-invert placeholder:text-dim-invert/70 focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 sm:text-sm`;
const input = (bad?: string) => `${inputBase} ${bad ? "border-red-600" : "border-ink-invert/25"}`;

function validate(form: HTMLFormElement): Errors {
  const data = new FormData(form);
  const text = (k: string) => String(data.get(k) ?? "").trim();
  const errors: Errors = {};
  if (!text("fullName")) errors.fullName = "Enter your full name.";
  if (!text("email")) errors.email = "Enter your email address.";
  else if (!EMAIL_OK.test(text("email"))) errors.email = "Enter a valid email address, like name@example.com.";
  const link = text("linkUrl");
  if (link && !/^https?:\/\/\S+\.\S+/i.test(link)) errors.linkUrl = "Enter a full link that starts with https://";
  const file = data.get("resume");
  if (file instanceof File && file.size > 0) {
    if (!FILE_OK.test(file.name)) errors.resume = "Upload your résumé as a PDF or Word file (.pdf, .doc or .docx).";
    else if (file.size > MAX_BYTES) errors.resume = "Your résumé is larger than 4 MB. Please upload a smaller file.";
  }
  return errors;
}

/** Application form for one job. Sends to /api/careers/apply; nothing is shown as sent until the server confirms. */
export default function ApplyForm({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  function focusFirst(found: Errors) {
    const first = (["fullName", "email", "linkUrl", "resume"] as Field[]).find((f) => found[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current) return; // no double submissions
    const form = e.currentTarget;
    const found = validate(form);
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length) {
      focusFirst(found);
      return;
    }

    busy.current = true;
    setStatus("sending");
    try {
      const res = await fetch("/api/careers/apply", { method: "POST", body: new FormData(form) });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string; field?: Field; confirmationSent?: boolean };
      if (!res.ok || !data.success) {
        if (data.field) {
          const fieldErrors = { [data.field]: data.error || "Please check this field." };
          setErrors(fieldErrors);
          focusFirst(fieldErrors);
        } else {
          setFormError(data.error || "Your application could not be sent. Please try again.");
        }
        setStatus("idle");
        return;
      }
      setConfirmationSent(Boolean(data.confirmationSent));
      setStatus("sent");
    } catch {
      setFormError("Your application could not be sent. Check your connection and try again. Your answers are still here.");
      setStatus("idle");
    } finally {
      busy.current = false;
    }
  }

  if (status === "sent") {
    return (
      <div role="status" tabIndex={-1} ref={(el) => el?.focus()} className="mt-6 rounded-xl border border-emerald-700/25 bg-emerald-50 p-5 focus:outline-none">
        <p className="flex items-start gap-2 font-semibold text-emerald-900">
          <CheckCircle2 size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
          Application received. Thank you for your interest in joining Yakimel Empire.
        </p>
        {confirmationSent && <p className="mt-2 text-sm text-emerald-900/80">We also sent a confirmation to your email.</p>}
      </div>
    );
  }

  const err = (f: Field) =>
    errors[f] ? (
      <p id={`${f}-error`} className="mt-1.5 text-sm font-medium text-red-700">
        {errors[f]}
      </p>
    ) : null;
  const a11y = (f: Field, hint?: string) => ({
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby": [errors[f] ? `${f}-error` : "", hint ?? ""].filter(Boolean).join(" ") || undefined,
  });
  const sending = status === "sending";

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="mt-6 space-y-4" aria-busy={sending}>
      <input type="hidden" name="jobId" value={jobId} />
      <p className="text-xs text-dim-invert">
        Fields marked <span className="text-red-700">*</span> are required.
      </p>
      <div>
        <label htmlFor="fullName" className={label}>
          Full name <span className="text-red-700" aria-hidden="true">*</span>
        </label>
        <input id="fullName" name="fullName" required maxLength={100} autoComplete="name" className={input(errors.fullName)} {...a11y("fullName")} />
        {err("fullName")}
      </div>
      <div>
        <label htmlFor="email" className={label}>
          Email <span className="text-red-700" aria-hidden="true">*</span>
        </label>
        <input id="email" name="email" type="email" inputMode="email" required maxLength={200} autoComplete="email" className={input(errors.email)} {...a11y("email")} />
        {err("email")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={label}>
            Phone / WhatsApp <span className="font-normal text-dim-invert">(optional)</span>
          </label>
          <input id="phone" name="phone" type="tel" inputMode="tel" maxLength={40} autoComplete="tel" className={input()} />
        </div>
        <div>
          <label htmlFor="location" className={label}>
            City, country
          </label>
          <input id="location" name="location" maxLength={100} autoComplete="address-level2" placeholder="Miami, USA" className={input()} />
        </div>
      </div>
      <div>
        <label htmlFor="linkUrl" className={label}>
          LinkedIn, Instagram or portfolio <span className="font-normal text-dim-invert">(optional)</span>
        </label>
        <input id="linkUrl" name="linkUrl" type="url" inputMode="url" maxLength={300} placeholder="https://" className={input(errors.linkUrl)} {...a11y("linkUrl")} />
        {err("linkUrl")}
      </div>
      <div>
        <label htmlFor="coverLetter" className={label}>
          Why are you a good fit?
        </label>
        <textarea id="coverLetter" name="coverLetter" rows={4} maxLength={4000} className={input()} />
      </div>
      <div>
        <label htmlFor="resume" className={label}>
          Résumé <span className="font-normal text-dim-invert">(optional)</span>
        </label>
        <input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={() => errors.resume && setErrors((x) => ({ ...x, resume: undefined }))}
          className={`block w-full rounded-lg text-sm text-dim-invert file:mr-3 file:rounded-lg file:border-0 file:bg-bg-dark file:px-4 file:py-2 file:text-sm file:font-medium file:text-ink-invert hover:file:bg-sky ${focus}`}
          {...a11y("resume", "resume-hint")}
        />
        <p id="resume-hint" className="mt-1.5 text-xs text-dim-invert">
          PDF or Word, up to 4 MB.
        </p>
        {err("resume")}
      </div>
      {/* Spam trap: hidden from people, filled in by bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {formError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {formError}
        </p>
      )}
      <p className="text-xs leading-relaxed text-dim-invert">
        We use the information you send only to review your application. See our{" "}
        <Link href="/privacy" className={`font-medium text-brand underline underline-offset-2 ${focus}`}>
          Privacy Policy
        </Link>
        .
      </p>
      <button
        type="submit"
        disabled={sending}
        className={`w-full rounded-full bg-brand px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70 ${focus}`}
      >
        {sending ? "Sending…" : "Submit application"}
      </button>
      <p className="sr-only" aria-live="polite">
        {sending ? "Sending your application." : ""}
      </p>
    </form>
  );
}
