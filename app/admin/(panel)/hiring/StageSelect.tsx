"use client";

import { useRef, useTransition } from "react";
import { APPLICATION_STATUSES, humanize } from "@/lib/admin/format";
import { updateApplication } from "./actions";

/** Small stage dropdown that saves as soon as it changes (used on the pipeline board). */
export default function StageSelect({ id, status, name }: { id: string; status: string; name: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();
  return (
    <form ref={form} action={(fd) => start(() => updateApplication(id, fd))}>
      <label className="sr-only" htmlFor={`stage-${id}`}>
        Move {name} to stage
      </label>
      <select
        id={`stage-${id}`}
        name="status"
        defaultValue={status}
        disabled={pending}
        onChange={() => form.current?.requestSubmit()}
        className="w-full cursor-pointer rounded-lg border border-os-ink/15 bg-os-bg/60 px-2 py-1.5 text-xs font-medium text-os-ink focus:border-os-accent focus:outline-none disabled:opacity-60"
      >
        {APPLICATION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {pending ? "Saving…" : humanize(s)}
          </option>
        ))}
      </select>
    </form>
  );
}
