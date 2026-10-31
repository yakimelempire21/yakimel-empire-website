/** Decorative desktop + mobile interface illustration (HTML/CSS/SVG). Not a real product screenshot. */
export default function HeroVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-[4/3] w-full max-w-xl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_45%,rgba(47,111,234,0.35),transparent_65%)]" />

      {/* Desktop window */}
      <div className="absolute left-0 top-[6%] w-[82%] overflow-hidden rounded-2xl border border-white/15 bg-[#0b1230] shadow-[0_30px_80px_-20px_rgba(47,111,234,0.45)]">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="ml-4 h-2 w-1/3 rounded-full bg-white/10" />
        </div>
        <div className="grid grid-cols-[22%_1fr] gap-4 p-4">
          <div className="space-y-2.5">
            <div className="h-6 rounded-md bg-[#2F6FEA]/70" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-2.5 rounded-full bg-white/10" style={{ width: `${90 - i * 9}%` }} />
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-1/3 rounded-full bg-white/25" />
              <div className="h-5 w-14 rounded-full bg-[#c9a45c]/80" />
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="h-14 rounded-lg bg-gradient-to-br from-[#2F6FEA]/50 to-[#2F6FEA]/10" />
              <div className="h-14 rounded-lg bg-gradient-to-br from-[#c9a45c]/40 to-[#c9a45c]/5" />
              <div className="h-14 rounded-lg bg-gradient-to-br from-white/20 to-white/5" />
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <svg viewBox="0 0 200 60" className="h-16 w-full" fill="none">
                <path
                  d="M0 48 L28 38 L56 42 L84 26 L112 32 L140 14 L170 20 L200 6"
                  stroke="#2F6FEA"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <circle cx="200" cy="6" r="4" fill="#c9a45c" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Phone */}
      <div className="absolute bottom-0 right-0 aspect-[9/18] w-[27%] rounded-[1.6rem] border border-white/20 bg-[#0b1230] p-2 shadow-[0_20px_60px_-15px_rgba(47,111,234,0.5)]">
        <div className="mx-auto mb-2 h-1.5 w-1/3 rounded-full bg-white/20" />
        <div className="space-y-2">
          <div className="h-3 w-2/3 rounded-full bg-white/25" />
          <div className="h-12 rounded-lg bg-gradient-to-br from-[#2F6FEA]/60 to-[#2F6FEA]/10" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-md bg-white/15" />
              <span className="h-2 flex-1 rounded-full bg-white/10" />
            </div>
          ))}
          <div className="h-5 rounded-full bg-[#c9a45c]/80" />
        </div>
      </div>
    </div>
  );
}
