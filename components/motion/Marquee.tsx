/** An endless, slow-moving strip of words. Pauses on hover; still for reduced motion. */
export default function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-12 pr-12">
      {items.map((t) => (
        <li key={t} className="flex items-center gap-12 whitespace-nowrap">
          <span>{t}</span>
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand" />
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className={`marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}
    >
      <div className="marquee-track flex w-max motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
