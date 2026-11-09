"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { inputClass, labelClass, primaryButton } from "@/components/admin/ui";

type Option = { value: string; label: string };

const TYPE_LABELS: Record<string, string> = {
  CONTRACT: "Contract",
  PROPOSAL: "Proposal",
  SOW: "Statement of Work",
  INVOICE: "Invoice",
  RECEIPT: "Receipt",
  COMPANY: "Company document",
  HR: "HR document",
  OTHER: "Other",
};

export default function UploadForm({
  clients,
  types,
  defaultType,
  storageReady,
}: {
  clients: Option[];
  types: string[];
  defaultType: string;
  storageReady: boolean;
}) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState(defaultType);
  const isContract = ["CONTRACT", "PROPOSAL", "SOW"].includes(type);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/documents", { method: "POST", body: new FormData(e.currentTarget) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      ref.current?.reset();
      setType(defaultType);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={ref} onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1.2fr_0.9fr]">
        <label className="block">
          <span className={labelClass}>Title</span>
          <input name="title" required placeholder="Website contract — Joseph Bakery" className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Type</span>
          <select name="type" value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
            {types.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
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
        <label className="block">
          <span className={labelClass}>Status</span>
          <select name="status" defaultValue="DRAFT" className={inputClass}>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="SIGNED">Signed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
      </div>

      {isContract && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className={labelClass}>Value (USD)</span>
            <input name="value" inputMode="decimal" className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Signed on</span>
            <input name="signedAt" type="date" className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Expires on</span>
            <input name="expiresAt" type="date" className={inputClass} />
          </label>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block">
          <span className={labelClass}>File (max 4 MB){!storageReady && " — storage not set up"}</span>
          <input
            name="file"
            type="file"
            disabled={!storageReady}
            accept=".pdf,.doc,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.webp,.txt,.csv"
            className={`${inputClass} py-2 file:mr-3 file:rounded-md file:border-0 file:bg-os-accent/20 file:px-3 file:py-1 file:text-sm file:text-os-accent disabled:opacity-50`}
          />
        </label>
        <label className="block">
          <span className={labelClass}>…or a link</span>
          <input name="externalUrl" type="url" placeholder="https://drive.google.com/…" className={inputClass} />
        </label>
        <button type="submit" disabled={pending} className={primaryButton}>
          <Upload size={15} aria-hidden="true" /> {pending ? "Saving…" : "Add document"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
