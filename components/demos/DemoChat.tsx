"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import type { ChatConfig } from "@/lib/demo-sites";

type Msg = { from: "bot" | "me"; text: string };

const WA_ICON =
  "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.38 9.38 0 0 1-1.44-5c0-5.19 4.23-9.42 9.43-9.42 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.42 9.42zm8.02-17.44A11.27 11.27 0 0 0 12.05.75C5.8.75.71 5.84.71 12.09c0 2 .52 3.95 1.52 5.66L.62 23.62l6.01-1.58a11.3 11.3 0 0 0 5.41 1.38h.01c6.25 0 11.34-5.09 11.34-11.34 0-3.03-1.18-5.88-3.32-8.02z";

const FALLBACK =
  "Good question! In this demo I only know a few answers, but on your real website I'm trained on your prices, hours and services, and I reply to customers 24/7 in English, French, Spanish and Kreyòl.";

function answer(config: ChatConfig, text: string): string {
  const t = text.toLowerCase();
  const exact = config.qa.find((x) => x.q.toLowerCase() === t);
  if (exact) return exact.a;
  const hit = config.qa.find((x) => x.keywords?.some((k) => t.includes(k.toLowerCase())));
  return hit?.a ?? FALLBACK;
}

/** Scripted WhatsApp-style AI assistant used on every demo (no real AI, no data sent). */
export default function DemoChat({ business, config, accent = "#0F4C3F" }: { business: string; config: ChatConfig; accent?: string }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ from: "bot", text: config.greeting }]);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [nudge, setNudge] = useState(false);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setNudge(true), 2500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  function ask(text: string) {
    const q = text.trim();
    if (!q || typing) return;
    setMsgs((m) => [...m, { from: "me", text: q }]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "bot", text: answer(config, q) }]);
    }, 900);
  }

  const asked = new Set(msgs.filter((m) => m.from === "me").map((m) => m.text));
  const chips = config.qa.filter((x) => !asked.has(x.q));

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3 font-sans">
      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            aria-label={`${business} AI assistant (demo)`}
            className="flex h-[min(560px,calc(100vh-7rem))] w-[min(370px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl bg-[#EFEAE2] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]"
          >
            <header className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
                {business.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{business}</p>
                <p className="text-[11px] text-white/75">{typing ? "typing…" : "AI assistant · replies instantly"}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1.5 hover:bg-white/10">
                <X size={18} aria-hidden="true" />
              </button>
            </header>
            <div ref={list} className="flex-1 space-y-2 overflow-y-auto px-3 py-4" aria-live="polite">
              <p className="mx-auto w-fit rounded-md bg-[#FFF5C4] px-2.5 py-1 text-center text-[10.5px] text-[#5b5130]">
                Demo · sample answers · nothing is sent
              </p>
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <p
                    className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-[13.5px] leading-snug text-[#111b21] shadow-sm ${
                      m.from === "me" ? "rounded-tr-sm bg-[#D9FDD3]" : "rounded-tl-sm bg-white"
                    }`}
                  >
                    {m.text}
                  </p>
                </div>
              ))}
              {typing && (
                <div className="flex">
                  <span className="flex gap-1 rounded-xl rounded-tl-sm bg-white px-3 py-3 shadow-sm" aria-label="Assistant is typing">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8696a0]" style={{ animationDelay: `${d * 120}ms` }} />
                    ))}
                  </span>
                </div>
              )}
            </div>
            {chips.length > 0 && (
              <div className="flex gap-2 overflow-x-auto px-3 pb-2">
                {chips.map((c) => (
                  <button
                    key={c.q}
                    type="button"
                    onClick={() => ask(c.q)}
                    className="shrink-0 rounded-full border border-[#075E54]/25 bg-white px-3 py-1.5 text-xs font-medium text-[#075E54] hover:bg-[#075E54]/5"
                  >
                    {c.q}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(draft);
              }}
              className="flex items-center gap-2 bg-[#F0F2F5] px-3 py-2.5"
            >
              <label htmlFor="demo-chat-input" className="sr-only">
                Message
              </label>
              <input
                id="demo-chat-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-full bg-white px-4 py-2 text-sm text-[#111b21] outline-none placeholder:text-[#8696a0] focus:ring-2 focus:ring-[#25D366]/50"
              />
              <button type="submit" aria-label="Send" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00A884] text-white hover:bg-[#008f6f]">
                <Send size={16} aria-hidden="true" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <AnimatePresence>
          {!open && nudge && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => setOpen(true)}
              className="hidden rounded-2xl rounded-br-sm bg-white px-4 py-2.5 text-left text-sm font-medium text-[#111b21] shadow-xl sm:block"
            >
              Try the AI assistant 👋
              <span className="block text-xs font-normal text-[#667781]">It answers your customers 24/7</span>
            </motion.button>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close AI assistant" : "Open AI assistant demo"}
          aria-expanded={open}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition-transform hover:scale-105"
          style={{ outlineColor: accent }}
        >
          {open ? (
            <X size={24} aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
              <path d={WA_ICON} />
            </svg>
          )}
          {!open && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#FF3B30]" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
