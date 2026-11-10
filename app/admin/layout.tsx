import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAKIMEL OS — Command Center",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-os-bg text-os-ink print:bg-white">
      {/* Soft lilac light behind the cards */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden print:hidden">
        <div className="absolute -top-40 left-1/3 h-[520px] w-[720px] rounded-full bg-os-lilac/70 blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full bg-os-lime/40 blur-[140px]" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
