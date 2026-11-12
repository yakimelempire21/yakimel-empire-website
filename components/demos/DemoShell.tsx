import Link from "next/link";
import type { ChatConfig } from "@/lib/demo-sites";
import DemoChat from "./DemoChat";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2FB39A]";

/** Slim Yakimel bar shown on top of every demo, plus the WhatsApp AI assistant. */
export default function DemoShell({
  name,
  service,
  chat,
  chatAccent,
  children,
}: {
  name: string;
  /** Package name passed to the consultation form. */
  service?: string;
  chat?: ChatConfig;
  chatAccent?: string;
  children: React.ReactNode;
}) {
  const href = `/consultation?service=${encodeURIComponent(service ?? name)}`;
  return (
    <>
      <div className="sticky top-0 z-[60] flex h-11 items-center justify-between gap-3 bg-[#0A3329] px-4 text-white md:px-6">
        <Link href="/demo" className={`rounded text-xs font-medium text-[#CDE8E1] transition-colors hover:text-white ${focus}`}>
          ← All demos
        </Link>
        <span className="hidden font-mono text-[10px] uppercase tracking-widest text-[#9CC7BC] sm:block">
          Yakimel Empire demo · {name}
        </span>
        <Link
          href={href}
          className={`rounded-full bg-[#2FB39A] px-3.5 py-1.5 text-xs font-semibold text-[#0A3329] transition-colors hover:bg-[#5fd0b9] ${focus}`}
        >
          Get this for my business
        </Link>
      </div>
      {children}
      {chat && <DemoChat business={name} config={chat} accent={chatAccent} />}
    </>
  );
}

export function DemoNote({ className = "" }: { className?: string }) {
  return <p className={className}>Demo preview: sample content</p>;
}
