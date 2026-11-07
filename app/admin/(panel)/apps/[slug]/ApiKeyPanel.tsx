"use client";

import { useActionState } from "react";
import { inputClass, primaryButton, secondaryButton } from "@/components/admin/ui";
import { generateApiKey, revokeApiKey, type KeyState } from "../actions";

export default function ApiKeyPanel({ appId, connected, endpoint }: { appId: string; connected: boolean; endpoint: string }) {
  const [state, action, pending] = useActionState<KeyState, FormData>(generateApiKey.bind(null, appId), undefined);
  const key = state?.key ?? "yk_live_…";

  return (
    <div className="space-y-4 text-sm">
      <p className="text-[#a2adc4]">
        Each app sends its numbers (users, orders, revenue, errors…) to YAKIMEL OS with its own secret key. The app keeps
        working on its own; YAKIMEL OS just receives the reports.
      </p>

      {state?.key ? (
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4">
          <p className="mb-2 font-medium text-emerald-300">Copy this key now — it won&apos;t be shown again.</p>
          <input readOnly value={state.key} onFocus={(e) => e.currentTarget.select()} className={`${inputClass} font-mono text-xs`} aria-label="API key" />
        </div>
      ) : (
        <p className={connected ? "text-emerald-300" : "text-[#7f93b8]"}>
          {connected ? "● An API key is active for this app." : "No API key yet."}
        </p>
      )}

      {state?.error && (
        <p role="alert" className="text-red-300">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <form action={action}>
          <button type="submit" disabled={pending} className={primaryButton}>
            {connected ? "Replace key" : "Create API key"}
          </button>
        </form>
        {connected && !state?.key && (
          <form action={revokeApiKey.bind(null, appId)}>
            <button type="submit" className={secondaryButton}>
              Revoke key
            </button>
          </form>
        )}
      </div>

      <details className="rounded-xl border border-white/[0.08] bg-black/30 p-4">
        <summary className="cursor-pointer font-medium text-white">How the app sends its numbers</summary>
        <pre className="mt-3 overflow-x-auto whitespace-pre text-xs leading-relaxed text-[#a2adc4]">{`POST ${endpoint}
Authorization: Bearer ${key}
Content-Type: application/json

{
  "metrics": {
    "users": 12450,
    "orders": 327,
    "revenue": 4820.5,
    "errors": 0
  }
}`}</pre>
        <p className="mt-3 text-xs text-[#7f93b8]">
          Send it on a schedule (for example every 15 minutes) or after important events. Any number or short text works:
          sellers, buyers, jobsPosted, aiGenerations…
        </p>
      </details>
    </div>
  );
}
