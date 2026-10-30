"use client";

import { useState } from "react";
import { faqs } from "@/lib/faqs";
import { isExternal, products } from "@/lib/products";

type Message = {
  role: "bot" | "user";
  text: string;
};

type Stage = "chat" | "escalate-form" | "escalate-sent";

function findAnswer(question: string): string | null {
  const q = question.toLowerCase();
  let best: { score: number; answer: string } | null = null;

  for (const item of faqs) {
    const keywords = item.q.toLowerCase().split(" ").filter((w) => w.length > 3);
    const score = keywords.filter((k) => q.includes(k)).length;
    if (score >= 2 && (!best || score > best.score)) {
      best = { score, answer: item.a };
    }
  }

  for (const product of products) {
    const nameWords = product.name.toLowerCase().split(" ");
    const mentioned = nameWords.some((w) => w.length > 2 && q.includes(w));
    if (mentioned) {
      const liveUrl = isExternal(product.detailsUrl) ? product.detailsUrl : product.demoUrl;
      const statusLine =
        product.status === "live"
          ? liveUrl
            ? " It's live now at " + liveUrl + "."
            : " It's available now."
          : " It's coming soon.";
      return product.description + statusLine;
    }
  }

  return best ? best.answer : null;
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("chat");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! I'm the Yakimel Empire assistant. Ask me anything about our company, our applications, or our products." },
  ]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  function openWidget() {
    setOpen(true);
  }

  function closeWidget() {
    setOpen(false);
    setStage("chat");
  }

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const answer = findAnswer(trimmed);
    const botReply: Message = answer
      ? { role: "bot", text: answer }
      : {
          role: "bot",
          text: "I don't have an answer for that yet. Want me to connect you with a real person on our team?",
        };

    setMessages((prev) => [...prev, { role: "user", text: trimmed }, botReply]);
    setInput("");
  }

  async function submitEscalation(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    const conversation = messages.map((m) => (m.role === "bot" ? "Assistant: " : "Me: ") + m.text).join("\n");

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: "Escalated from chatbot.\n\nConversation so far:\n" + conversation,
        }),
      });
      setStage("escalate-sent");
    } catch {
      setStage("escalate-sent");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button onClick={openWidget} className="border border-white/20 text-ink-invert px-6 py-3 rounded-full hover:border-white/40 transition-colors">
        Chat with an Agent
      </button>

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm">
          <div className="w-full bg-white rounded-2xl overflow-hidden shadow-2xl text-left flex flex-col h-[600px] max-h-[75vh] border border-slate-200">
            <div className="bg-bg-dark text-ink-invert px-6 py-4 flex items-center justify-between shrink-0">
              <span className="font-display font-bold">Yakimel Empire Assistant</span>
              <button onClick={closeWidget} className="text-dim-invert hover:text-ink-invert transition-colors text-sm">
                Close
              </button>
            </div>

            {stage === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={
                        m.role === "bot"
                          ? "max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed bg-slate-100 text-ink"
                          : "max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed bg-brand text-white ml-auto"
                      }
                    >
                      {m.text}
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 p-4 space-y-2 shrink-0">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type your question..."
                      className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm text-ink focus:outline-none focus:border-brand"
                    />
                    <button onClick={sendMessage} className="bg-brand text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-brand-dark transition-colors">
                      Send
                    </button>
                  </div>
                  <button
                    onClick={() => setStage("escalate-form")}
                    className="w-full text-center font-mono text-xs uppercase tracking-widest text-dim hover:text-ink transition-colors py-2"
                  >
                    Talk to a real person
                  </button>
                </div>
              </>
            )}

            {stage === "escalate-form" && (
              <form onSubmit={submitEscalation} className="p-6 space-y-4 overflow-y-auto flex-1">
                <button type="button" onClick={() => setStage("chat")} className="font-mono text-xs uppercase tracking-widest text-brand">
                  Back to chat
                </button>
                <p className="text-dim text-sm">Leave your details and our team will follow up by email, along with this conversation.</p>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1">Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-ink focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-dim mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-ink focus:outline-none focus:border-brand"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-brand text-white font-medium py-3 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send to our team"}
                </button>
              </form>
            )}

            {stage === "escalate-sent" && (
              <div className="p-6 text-center flex-1 flex flex-col items-center justify-center">
                <p className="font-display font-bold text-lg text-ink mb-2">Message sent</p>
                <p className="text-dim text-sm leading-relaxed mb-6">
                  A confirmation has been sent to your email. Our team will respond within 24-48 business hours.
                </p>
                <button onClick={closeWidget} className="font-mono text-xs uppercase tracking-widest text-brand hover:text-brand-dark transition-colors">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}