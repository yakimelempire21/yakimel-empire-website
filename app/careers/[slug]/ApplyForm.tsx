"use client";

import { useState } from "react";

const input =
  "w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-ink-invert placeholder:text-dim-invert/70 focus:border-brand focus:outline-none";
const label = "mb-1.5 block text-sm font-medium";

export default function ApplyForm({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/careers/apply", { method: "POST", body: new FormData(e.currentTarget) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("sent");
    } catch (err) {
      setError((err as Error).message);
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-5">
        <p className="font-medium text-emerald-300">Application sent. Thank you!</p>
        <p className="mt-1 text-sm text-dim-invert">We&apos;ll review it and get back to you by email.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <input type="hidden" name="jobId" value={jobId} />
      <label className="block">
        <span className={label}>
          Full name <span className="text-brand">*</span>
        </span>
        <input name="fullName" required maxLength={100} autoComplete="name" className={input} />
      </label>
      <label className="block">
        <span className={label}>
          Email <span className="text-brand">*</span>
        </span>
        <input name="email" type="email" required maxLength={200} autoComplete="email" className={input} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Phone / WhatsApp</span>
          <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={input} />
        </label>
        <label className="block">
          <span className={label}>City, country</span>
          <input name="location" maxLength={100} className={input} />
        </label>
      </div>
      <label className="block">
        <span className={label}>LinkedIn, Instagram or portfolio</span>
        <input name="linkUrl" type="url" maxLength={300} placeholder="https://" className={input} />
      </label>
      <label className="block">
        <span className={label}>Why are you a good fit?</span>
        <textarea name="coverLetter" rows={4} maxLength={4000} className={input} placeholder="Tell us about yourself and any sales or marketing experience." />
      </label>
      <label className="block">
        <span className={label}>Résumé (PDF or Word, optional)</span>
        <input
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="block w-full text-sm text-dim-invert file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-ink-invert hover:file:bg-white/15"
        />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-brand px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
