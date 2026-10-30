"use client";

import { useEffect, useId, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
  /** Pre-fills the message field each time the modal opens. */
  initialMessage?: string;
};

export function ContactModal({ open, onClose, initialMessage = "" }: ContactModalProps) {
  if (!open) return null;
  return <ContactDialog onClose={onClose} initialMessage={initialMessage} />;
}

function ContactDialog({
  onClose,
  initialMessage,
}: {
  onClose: () => void;
  initialMessage: string;
}) {
  const uid = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [ticketNumber, setTicketNumber] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send");
      }

      setTicketNumber(data.ticketNumber);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const labelClass = "block font-mono text-xs uppercase tracking-widest text-dim mb-1";
  const fieldClass =
    "w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/40";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 px-4 pb-4 md:pb-0"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl text-left"
      >
        <div className="bg-bg-dark text-ink-invert px-6 py-4 flex items-center justify-between">
          <span id={`${uid}-title`} className="font-display font-bold">
            Send us a message
          </span>
          <button
            onClick={onClose}
            className="text-dim-invert hover:text-ink-invert transition-colors text-sm rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Close
          </button>
        </div>

        {status === "sent" ? (
          <div className="p-6 text-center" role="status">
            <p className="font-display font-bold text-lg text-ink mb-2">Message sent</p>
            <p className="text-dim text-sm leading-relaxed mb-2">
              Your ticket number is <span className="font-mono text-brand">{ticketNumber}</span>.
            </p>
            <p className="text-dim text-sm leading-relaxed mb-6">
              A confirmation has been sent to your email. Our team will respond within 24-48 business hours.
            </p>
            <button
              onClick={onClose}
              className="font-mono text-xs uppercase tracking-widest text-brand hover:text-brand-dark transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px" }}
              aria-hidden="true"
            />

            <div>
              <label htmlFor={`${uid}-name`} className={labelClass}>
                Name
              </label>
              <input
                id={`${uid}-name`}
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ color: "#0B1220" }}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor={`${uid}-email`} className={labelClass}>
                Email
              </label>
              <input
                id={`${uid}-email`}
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ color: "#0B1220" }}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor={`${uid}-message`} className={labelClass}>
                Message
              </label>
              <textarea
                id={`${uid}-message`}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                style={{ color: "#0B1220" }}
                className={`${fieldClass} resize-none`}
              />
            </div>

            {status === "error" && (
              <p role="alert" className="text-red-600 text-sm">
                Something went wrong. Please try again or email us directly.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-brand text-white font-medium py-3 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {status === "sending" ? "Sending..." : "Send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ContactWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-brand text-white font-medium px-8 py-4 rounded-full hover:bg-brand-dark transition-colors"
      >
        Start a Conversation
      </button>
      <ContactModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
