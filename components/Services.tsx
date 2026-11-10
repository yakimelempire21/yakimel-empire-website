import Link from "next/link";

const websiteFeatures = [
  "Business websites",
  "Corporate websites",
  "E-commerce websites",
  "Landing pages",
  "Portfolio websites",
  "Custom websites",
  "Website redesign",
  "Responsive web design",
  "Website maintenance",
];

const appFeatures = [
  "iOS applications",
  "Android applications",
  "Web applications",
  "Business applications",
  "Marketplace applications",
  "Custom applications",
  "UI/UX design",
  "App prototypes",
  "Custom software solutions",
];

export default function Services() {
  return (
    <section id="services" className="bg-bg-dark text-ink-invert py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-widest text-brand mb-3">
          Our Services
        </p>
        <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
          We also build for clients
        </h2>
        <p className="text-dim-invert text-lg max-w-2xl mb-14 leading-relaxed">
          Alongside our own products, Yakimel Empire designs and develops websites and applications for individuals, entrepreneurs, startups, and businesses.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-ink-invert/5 border border-ink-invert/15 rounded-2xl p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-brand mb-3">
              Web Development
            </p>
            <h3 className="font-display font-bold text-2xl mb-4">
              Website Design &amp; Development
            </h3>
            <p className="text-dim-invert leading-relaxed mb-6">
              Hire Yakimel Empire to design and develop a professional website built around your goals, from a simple landing page to a full e-commerce platform.
            </p>

            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 mb-8">
              {websiteFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-dim-invert">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-brand shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/consultation?type=Website"
              className="inline-block bg-brand text-white font-medium px-6 py-3 rounded-full hover:bg-brand-dark transition-colors"
            >
              Request a Website Consultation
            </Link>
          </div>

          <div className="bg-ink-invert/5 border border-ink-invert/15 rounded-2xl p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-brand mb-3">
              App Development
            </p>
            <h3 className="font-display font-bold text-2xl mb-4">
              App Design &amp; Development
            </h3>
            <p className="text-dim-invert leading-relaxed mb-6">
              Bring us your app idea. We design and develop mobile, web, and business applications for individuals, entrepreneurs, startups, and companies.
            </p>

            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 mb-8">
              {appFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-dim-invert">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-brand shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/consultation?type=Mobile App"
              className="inline-block bg-brand text-white font-medium px-6 py-3 rounded-full hover:bg-brand-dark transition-colors"
            >
              Request an App Consultation
            </Link>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/eznob" className="inline-block font-mono text-xs uppercase tracking-widest text-brand hover:text-brand-dark transition-colors">
            Learn more about EZNOB, our development department
          </Link>
        </div>
      </div>
    </section>
  );
}