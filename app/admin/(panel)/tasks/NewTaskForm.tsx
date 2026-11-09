"use client";

import { useActionState, useEffect, useRef } from "react";
import { inputClass, primaryButton } from "@/components/admin/ui";
import { createTask, type TaskFormState } from "./actions";

type Option = { value: string; label: string };

export default function NewTaskForm({
  team,
  projects,
  canAssign,
}: {
  team: Option[];
  projects: Option[];
  canAssign: boolean;
}) {
  const [state, action, pending] = useActionState<TaskFormState, FormData>(createTask, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.saved) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-3">
      <input name="title" required placeholder="What needs to be done?" aria-label="Task title" className={inputClass} />
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-[1.2fr_1.2fr_0.9fr_1fr_auto]">
        <select name="projectId" defaultValue="" aria-label="Project" className={inputClass}>
          <option value="">No project</option>
          {projects.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        {canAssign ? (
          <select name="assigneeId" defaultValue="" aria-label="Assign to" className={inputClass}>
            <option value="">Unassigned</option>
            {team.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        ) : (
          <div className={`${inputClass} text-os-muted`}>Assigned to me</div>
        )}
        <select name="priority" defaultValue="MEDIUM" aria-label="Priority" className={inputClass}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <input name="dueDate" type="date" aria-label="Deadline" className={inputClass} />
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Adding…" : "Add task"}
        </button>
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
