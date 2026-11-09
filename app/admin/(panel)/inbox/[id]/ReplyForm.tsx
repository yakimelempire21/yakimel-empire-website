"use client";

import { useActionState, useEffect, useRef } from "react";
import { inputClass, primaryButton } from "@/components/admin/ui";
import { replyToConversation, type ReplyState } from "../actions";

export default function ReplyForm({ id, clientEmail }: { id: string; clientEmail?: string | null }) {
  const [state, action, pending] = useActionState<ReplyState, FormData>(replyToConversation.bind(null, id), undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.sent) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <textarea
        name="body"
        rows={5}
        required
        placeholder={clientEmail ? `Reply to ${clientEmail}…` : "Write a note…"}
        className={`${inputClass} resize-y`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-os-muted">
          <input type="checkbox" name="internal" className="h-4 w-4 accent-os-accent" />
          Internal note (not emailed)
        </label>
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state?.sent && (
        <p role="status" className="text-sm text-emerald-700">
          Saved.
        </p>
      )}
    </form>
  );
}
