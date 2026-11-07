import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAKIMEL OS — Command Center",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#07080b] text-ink-invert print:bg-white">
      {/* Soft royal-blue glow behind the glass panels */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden print:hidden">
        <div className="absolute -top-40 left-1/3 h-[520px] w-[720px] rounded-full bg-[#2F6FEA]/[0.13] blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full bg-[#4d8dff]/[0.07] blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
