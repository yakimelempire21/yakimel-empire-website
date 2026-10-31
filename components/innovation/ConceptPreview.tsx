import type { ConceptKind } from "@/lib/innovation";
import { INNOVATION_PAGE } from "@/lib/innovation";

const LABELS: Record<ConceptKind, string> = {
  brand: "BrandForge AI",
  ads: "Advertwize",
  services: "Service Business Platform",
  pickup: "Pickup Marketplace",
};

const line = "rounded-full bg-white/15";
const tile = "rounded-lg border border-white/10 bg-white/[0.06]";

function Brand() {
  return (
    <div className="grid h-full grid-cols-5 gap-3 p-5">
      <div className={`${tile} col-span-2 flex flex-col items-center justify-center gap-3 p-3`}>
        <div className="h-14 w-14 rounded-full border-4 border-[#c9a45c]/80 bg-[#2F6FEA]/30" />
        <div className={`${line} h-2 w-3/4`} />
        <div className="flex gap-1.5">
          <span className="h-4 w-4 rounded-full bg-[#2F6FEA]" />
          <span className="h-4 w-4 rounded-full bg-[#c9a45c]" />
          <span className="h-4 w-4 rounded-full bg-white" />
          <span className="h-4 w-4 rounded-full bg-[#0D1330] ring-1 ring-white/30" />
        </div>
      </div>
      <div className="col-span-3 grid grid-rows-2 gap-3">
        <div className={`${tile} flex flex-col justify-center gap-2 p-3`}>
          <div className={`${line} h-2.5 w-2/3`} />
          <div className={`${line} h-2 w-full`} />
          <div className={`${line} h-2 w-5/6`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`${tile} bg-gradient-to-br from-[#2F6FEA]/40 to-transparent`} />
          <div className={`${tile} bg-gradient-to-br from-[#c9a45c]/30 to-transparent`} />
        </div>
      </div>
    </div>
  );
}

function Ads() {
  const bars = [35, 52, 44, 68, 58, 80, 72];
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="flex gap-2">
        <span className="h-5 w-16 rounded-full bg-[#2F6FEA]" />
        <span className="h-5 w-14 rounded-full bg-white/15" />
        <span className="h-5 w-14 rounded-full bg-white/15" />
      </div>
      <div className={`${tile} flex flex-1 items-end gap-2 p-3`}>
        {bars.map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}%` }}
            className={`flex-1 rounded-t ${i === 5 ? "bg-[#c9a45c]" : "bg-[#2F6FEA]/80"}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={`${tile} p-2.5`}>
          <div className={`${line} h-2 w-2/3`} />
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
            <div className="h-full w-3/5 rounded-full bg-[#2F6FEA]" />
          </div>
        </div>
        <div className={`${tile} p-2.5`}>
          <div className={`${line} h-2 w-1/2`} />
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
            <div className="h-full w-2/5 rounded-full bg-[#c9a45c]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Services() {
  const booked = new Set([2, 5, 9, 11, 15, 18]);
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-full bg-[#c9a45c]/70" />
        <div className="flex-1 space-y-1.5">
          <div className={`${line} h-2.5 w-1/2`} />
          <div className={`${line} h-2 w-1/3`} />
        </div>
        <span className="h-6 w-16 rounded-md bg-[#2F6FEA]" />
      </div>
      <div className={`${tile} grid flex-1 grid-cols-7 gap-1.5 p-3`}>
        {Array.from({ length: 21 }, (_, i) => (
          <span
            key={i}
            className={`rounded ${booked.has(i) ? "bg-[#2F6FEA]/80" : "bg-white/10"}`}
          />
        ))}
      </div>
    </div>
  );
}

function Pickup() {
  return (
    <div className="grid h-full grid-cols-5 gap-3 p-5">
      <div className="col-span-3 flex flex-col gap-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${tile} flex flex-1 items-center gap-3 p-2.5`}>
            <span className="h-full aspect-square rounded-md bg-gradient-to-br from-[#2F6FEA]/50 to-[#c9a45c]/40" />
            <div className="flex-1 space-y-1.5">
              <div className={`${line} h-2.5 w-3/4`} />
              <div className={`${line} h-2 w-1/2`} />
            </div>
            <span className="h-5 w-10 rounded-full bg-[#2F6FEA]" />
          </div>
        ))}
      </div>
      <div className={`${tile} col-span-2 flex flex-col items-center justify-center gap-3 p-3`}>
        <svg viewBox="0 0 48 56" className="h-14 w-12" fill="none" aria-hidden="true">
          <path d="M8 18h32l-3 32H11z" stroke="#c9a45c" strokeWidth="3" strokeLinejoin="round" />
          <path d="M16 18v-4a8 8 0 0 1 16 0v4" stroke="#c9a45c" strokeWidth="3" />
        </svg>
        <div className={`${line} h-2 w-3/4`} />
        <div className={`${line} h-2 w-1/2`} />
      </div>
    </div>
  );
}

const SCENES: Record<ConceptKind, () => React.JSX.Element> = {
  brand: Brand,
  ads: Ads,
  services: Services,
  pickup: Pickup,
};

/** Illustrative HTML/CSS mock-up, always labelled so it isn't mistaken for a real product. */
export default function ConceptPreview({ kind }: { kind: ConceptKind }) {
  const Scene = SCENES[kind];
  return (
    <div
      role="img"
      aria-label={`${INNOVATION_PAGE.conceptLabel} of ${LABELS[kind]}. Illustration only, not a screenshot of a working product.`}
      className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#0D1330] via-[#0a1030] to-[#060B1F]"
    >
      <div aria-hidden="true" className="h-full w-full">
        <Scene />
      </div>
      <span className="absolute left-3 top-3 rounded-full border border-[#c9a45c]/50 bg-bg-dark/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#c9a45c] backdrop-blur-sm">
        {INNOVATION_PAGE.conceptLabel}
      </span>
    </div>
  );
}
