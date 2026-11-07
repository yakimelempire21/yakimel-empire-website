const STEPS = [
  {
    title: "Tell us your goal",
    body: "Send a project request or book a consultation. We learn about your business, your customers and what you need the site or app to do.",
  },
  {
    title: "Get a clear quote",
    body: "You get a scope, a price and a timeline in writing before any work starts. No surprises.",
  },
  {
    title: "Design & build",
    body: "We design around your brand, build it mobile-first, and share progress so you can give feedback along the way.",
  },
  {
    title: "Launch & grow",
    body: "We launch, show you how to run your dashboard, and stay available for maintenance, updates and new features.",
  },
];

export default function HomeProcess() {
  return (
    <section className="bg-[#05070a] px-6 py-24 text-ink-invert md:py-32">
      <div className="mx-auto max-w-7xl md:px-4">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">How It Works</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold md:text-5xl">
          From idea to launch in four steps.
        </h2>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-[#05070a] p-8">
              <span className="font-mono text-sm text-brand">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-dim-invert">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
