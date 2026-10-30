"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { consultationHref, services, type Service } from "@/lib/services";
import ServiceModal from "@/components/ServiceModal";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
const button = `inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark ${focus}`;

export default function ServicesGrid() {
  const [open, setOpen] = useState<Service | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  function closeModal() {
    setOpen(null);
    // Return focus to the button that opened the dialog.
    opener.current?.focus();
  }

  return (
    <>
      <ul className="grid gap-5 min-[900px]:grid-cols-2">
        {services.map((s) => (
          <li key={s.slug}>
            <article className="flex h-full flex-col gap-5 rounded-2xl border border-white/10 bg-surface/60 p-4 transition-colors duration-300 hover:border-brand/50 sm:flex-row">
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-bg-dark sm:w-[42%]">
                <Image
                  src={s.image}
                  alt={`${s.title} illustration`}
                  fill
                  sizes="(min-width: 900px) 20vw, (min-width: 640px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col">
                <h3 className="font-display text-xl font-bold text-ink-invert">{s.title}</h3>

                <div className="mt-3">
                  {s.priceLabel && (
                    <p className="text-xs uppercase tracking-widest text-dim-invert">
                      {s.priceLabel}
                    </p>
                  )}
                  <p className="font-display text-3xl font-bold text-brand">
                    {s.price}
                    {s.unit && (
                      <span className="ml-1 text-base font-medium text-dim-invert">{s.unit}</span>
                    )}
                  </p>
                </div>

                <p className="mt-3 text-sm leading-snug text-dim-invert">{s.description}</p>

                <div className="mt-auto pt-5">
                  {s.action === "link" ? (
                    <Link href={consultationHref(s.title)} className={button}>
                      {s.buttonLabel}
                      <span className="sr-only"> for {s.title}</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={button}
                      aria-haspopup="dialog"
                      onClick={(e) => {
                        opener.current = e.currentTarget;
                        setOpen(s);
                      }}
                    >
                      {s.buttonLabel}
                      <span className="sr-only"> for {s.title}</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      {open && <ServiceModal service={open} onClose={closeModal} />}
    </>
  );
}
