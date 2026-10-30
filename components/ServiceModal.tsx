"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { SERVICES_PAGE, consultationHref, type Service } from "@/lib/services";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

type Props = {
  service: Service;
  onClose: () => void;
};

/**
 * Native <dialog>: showModal() traps focus, Escape closes it, and the browser
 * returns focus to the opening button when it closes.
 */
export default function ServiceModal({ service, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${uid}-title`}
      aria-describedby={`${uid}-desc`}
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop targets the <dialog> element itself.
        if (e.target === e.currentTarget) ref.current?.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-white/10 bg-surface p-0 text-ink-invert shadow-2xl backdrop:bg-black/70"
    >
      <div className="p-7">
        <h2 id={`${uid}-title`} className="font-display text-2xl font-bold">
          {service.title}
        </h2>

        <p className="mt-4">
          {service.priceLabel && (
            <span className="mr-2 text-xs uppercase tracking-widest text-dim-invert">
              {service.priceLabel}
            </span>
          )}
          <span className="font-display text-3xl font-bold text-brand">{service.price}</span>
          {service.unit && <span className="ml-1 text-sm text-dim-invert">{service.unit}</span>}
        </p>

        <p id={`${uid}-desc`} className="mt-4 text-sm leading-relaxed text-dim-invert">
          {service.description}
        </p>

        <h3 className="mt-6 font-mono text-xs uppercase tracking-widest text-brand">
          {SERVICES_PAGE.modal.includes}
        </h3>
        <ul className="mt-3 space-y-2">
          {service.details.map((d) => (
            <li key={d} className="flex items-start gap-3 text-sm">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              {d}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={consultationHref(service.title)}
            className={`rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark ${focus}`}
          >
            {SERVICES_PAGE.modal.getStarted}
          </Link>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className={`rounded-lg border border-white/25 px-6 py-2.5 text-sm font-medium transition-colors hover:border-white/60 hover:bg-white/5 ${focus}`}
          >
            {SERVICES_PAGE.modal.close}
          </button>
        </div>
      </div>
    </dialog>
  );
}
