"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Card, primaryButton } from "@/components/admin/ui";

/** Shown inside YAKIMEL OS when a page fails, instead of a blank error screen. */
export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto mt-10 max-w-xl p-8 text-center">
      <TriangleAlert size={32} className="mx-auto text-amber-700" aria-hidden="true" />
      <h1 className="mt-4 font-display text-2xl font-bold text-os-ink">This page couldn&apos;t load</h1>
      <p className="mt-3 text-sm leading-relaxed text-os-muted">
        Usually this means the database needs updating after a new version was deployed. On the computer with the
        project, run <code className="rounded bg-os-ink/10 px-1.5 py-0.5 text-os-ink">npm run db:migrate</code>, then reload.
        If it keeps happening, check Vercel → Logs.
      </p>
      {error.digest && <p className="mt-3 font-mono text-xs text-os-faint">Error {error.digest}</p>}
      <button type="button" onClick={reset} className={`${primaryButton} mt-6`}>
        Try again
      </button>
    </Card>
  );
}
