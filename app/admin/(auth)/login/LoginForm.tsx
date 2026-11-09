"use client";

import { useActionState } from "react";
import { inputClass, labelClass, primaryButton } from "@/components/admin/ui";
import { loginAction, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className={labelClass}>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          defaultValue={state?.email}
          key={state?.email ?? "email"}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className={labelClass}>Password</span>
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${primaryButton} w-full py-3`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
