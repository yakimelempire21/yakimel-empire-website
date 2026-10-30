import Link from "next/link";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d8dff]";

/** Slim Yakimel bar shown on top of every template demo. */
export default function DemoShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="sticky top-0 z-[60] flex h-11 items-center justify-between gap-3 bg-[#060B1F] px-4 text-white md:px-6">
        <Link
          href="/products"
          className={`rounded text-xs font-medium text-[#c7d2ee] transition-colors hover:text-white ${focus}`}
        >
          ← Back to products
        </Link>
        <span className="hidden font-mono text-[10px] uppercase tracking-widest text-[#7f93b8] sm:block">
          Demo · {name}
        </span>
        <Link
          href={`/consultation?service=${encodeURIComponent(name)}`}
          className={`rounded-md bg-[#2F6FEA] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1D4ED8] ${focus}`}
        >
          Start a Project
        </Link>
      </div>
      {children}
    </>
  );
}

export function DemoNote({ className = "" }: { className?: string }) {
  return <p className={className}>Demo preview: sample content</p>;
}
