"use client";

import { useActionState } from "react";
import { inputClass, labelClass, primaryButton } from "@/components/admin/ui";
import { changePassword, type PasswordState } from "./actions";

export default function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className={labelClass}>Current password</span>
        <input name="current" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      <label className="block">
        <span className={labelClass}>New password (min. 12 characters)</span>
        <input name="next" type="password" autoComplete="new-password" minLength={12} required className={inputClass} />
      </label>
      <label className="block">
        <span className={labelClass}>Confirm new password</span>
        <input name="confirm" type="password" autoComplete="new-password" minLength={12} required className={inputClass} />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state?.saved && (
        <p role="status" className="text-sm text-emerald-300">
          Password changed. Other devices were signed out.
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
