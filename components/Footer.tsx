import Image from "next/image";
import Link from "next/link";

const LINKS = [
  { label: "Company", href: "/#about" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "Innovation", href: "/innovation" },
  { label: "About", href: "/#about" },
];

// Brand icons are inline SVG (lucide-react no longer ships brand marks).
// Point these at the company's real profiles.
const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com",
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com",
    path: "M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14c.5-1.88.5-5.8.5-5.8s0-3.92-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z",
  },
];

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bg-dark text-dim-invert py-14 px-6 border-t border-white/10">
      <div className="mx-auto max-w-7xl flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:px-4">
        <div>
          <Image
            src="/yakimel-logo-full.png?v=2"
            alt="Yakimel Empire LLC"
            width={160}
            height={160}
            className="mb-3"
            unoptimized
          />
          <div className="font-mono text-xs">Technology. Innovation. Future.</div>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={`transition-colors hover:text-ink-invert ${focus}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="flex items-center gap-5">
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${s.label} (opens in a new tab)`}
                className={`block transition-colors hover:text-ink-invert ${focus}`}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-10 max-w-7xl flex flex-col gap-2 border-t border-white/10 pt-6 font-mono text-xs md:flex-row md:justify-between md:px-4">
        <div>USA, New York</div>
        <div>© {year} Yakimel Empire LLC. All rights reserved.</div>
      </div>
    </footer>
  );
}
