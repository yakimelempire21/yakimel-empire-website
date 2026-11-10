"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

const label = "mb-2 block text-[15px] font-semibold text-os-ink";
const field =
  "w-full rounded-xl border border-os-ink/25 bg-white/70 px-4 py-3 text-[15px] text-os-ink shadow-[inset_0_1px_2px_rgba(14,59,50,0.06)] outline-none transition placeholder:text-os-faint focus:border-os-accent focus:bg-white focus:ring-2 focus:ring-os-accent/20";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, undefined);
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className={label}>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          defaultValue={state?.email}
          key={state?.email ?? "email"}
          className={field}
        />
      </label>
      <div>
        <label htmlFor="password" className={label}>
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${field} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-os-ink/80 hover:text-os-ink focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-os-accent"
          >
            {show ? <EyeOff size={21} aria-hidden="true" /> : <Eye size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="!mt-6 w-full rounded-xl bg-[#0B4A35] py-3.5 text-[17px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(11,74,53,0.7)] transition hover:bg-[#083826] disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-os-accent"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
