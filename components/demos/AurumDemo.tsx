"use client";

import { useState } from "react";
import Image from "next/image";
import DemoShell, { DemoNote } from "@/components/demos/DemoShell";

const GOLD = "#c9a45c";
const serif = "font-serif";
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a45c]";

const NAV = [
  { label: "Menu", href: "#menu" },
  { label: "Experience", href: "#experience" },
  { label: "Reservations", href: "#reservations" },
  { label: "Visit", href: "#visit" },
];

type Course = { id: string; label: string; items: { name: string; note: string; price: string }[] };

const MENU: Course[] = [
  {
    id: "starters",
    label: "Starters",
    items: [
      { name: "Hudson Valley Foie Gras", note: "Brioche, fig preserve, aged balsamic", price: "28" },
      { name: "Yellowfin Crudo", note: "Blood orange, fennel pollen, olive oil", price: "24" },
      { name: "Roasted Heirloom Beets", note: "Whipped chèvre, pistachio, honey", price: "19" },
      { name: "Wild Mushroom Velouté", note: "Black truffle, chive oil, crème fraîche", price: "21" },
    ],
  },
  {
    id: "mains",
    label: "Mains",
    items: [
      { name: "Dry-Aged Ribeye", note: "Bone marrow butter, pommes purée, jus", price: "68" },
      { name: "Pan-Seared Sea Bass", note: "Saffron beurre blanc, charred leeks", price: "46" },
      { name: "Duck Breast à l'Orange", note: "Confit leg croquette, glazed turnips", price: "52" },
      { name: "Wild Mushroom Risotto", note: "Carnaroli rice, parmesan, thyme", price: "38" },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    items: [
      { name: "Valrhona Chocolate Fondant", note: "Salted caramel, vanilla bean ice cream", price: "18" },
      { name: "Burnt Honey Crème Brûlée", note: "Candied walnuts, sea salt", price: "16" },
      { name: "Seasonal Tarte Tatin", note: "Calvados cream, cinnamon crumble", price: "17" },
    ],
  },
];

const HIGHLIGHTS = [
  { title: "Tasting Menu", text: "Seven courses paired with rare vintages from our cellar of 1,200 labels." },
  { title: "Private Dining", text: "A candlelit salon for up to 24 guests, with its own sommelier and chef's table." },
  { title: "The Garden Patio", text: "Open-air dining among living greenery from May through October." },
];

const TIMES = ["5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"];

export default function AurumDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [course, setCourse] = useState(MENU[0].id);
  const [sent, setSent] = useState<{ name: string; date: string; time: string; guests: string } | null>(null);

  const activeCourse = MENU.find((c) => c.id === course) ?? MENU[0];

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    // Demo only: nothing is sent anywhere.
    setSent({
      name: String(data.get("name") ?? ""),
      date: String(data.get("date") ?? ""),
      time: String(data.get("time") ?? ""),
      guests: String(data.get("guests") ?? ""),
    });
  }

  const label = "mb-2 block text-[11px] uppercase tracking-[0.25em] text-[#a89a85]";
  const field = `w-full border border-[#3a2e22] bg-[#150f0a] px-4 py-3 text-sm text-[#f3ece0] placeholder:text-[#6f6252] ${focus}`;

  return (
    <DemoShell name="Aurum">
      <div className="bg-[#0c0806] text-[#f3ece0]">
        {/* Site nav */}
        <header className="sticky top-11 z-50 border-b border-[#2a2018] bg-[#0c0806]/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <a href="#top" className={`${serif} ${focus}`}>
              <span className="block text-2xl tracking-[0.3em]">AURUM</span>
              <span className="block text-[9px] uppercase tracking-[0.35em] text-[#a89a85]">
                Fine Dining · New York
              </span>
            </a>

            <nav aria-label="Aurum" className="hidden items-center gap-9 md:flex">
              {NAV.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className={`text-xs uppercase tracking-[0.2em] text-[#d9cfbe] transition-colors hover:text-[#c9a45c] ${focus}`}
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <a
              href="#reservations"
              style={{ backgroundColor: GOLD }}
              className={`hidden px-6 py-3 text-xs uppercase tracking-[0.2em] text-[#1a1208] transition-opacity hover:opacity-90 md:inline-block ${focus}`}
            >
              Book a Table
            </a>

            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="aurum-mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
              className={`text-xs uppercase tracking-[0.2em] md:hidden ${focus}`}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>

          {menuOpen && (
            <nav
              id="aurum-mobile-nav"
              aria-label="Aurum mobile"
              className="border-t border-[#2a2018] px-6 py-4 md:hidden"
            >
              <ul className="space-y-1">
                {[...NAV, { label: "Book a Table", href: "#reservations" }].map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block py-3 text-sm uppercase tracking-[0.2em] ${focus}`}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </header>

        <main id="top">
          {/* Hero */}
          <section className="relative flex min-h-[78vh] items-end overflow-hidden">
            <Image
              src="/products/templates/aurum-hero.jpg"
              alt="Aurum dining room with warm wood, hanging plants and an arched feature wall"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0806] via-[#0c0806]/40 to-[#0c0806]/20" />
            <div className="relative mx-auto w-full max-w-6xl px-6 pb-16 md:pb-24">
              <p className="mb-4 text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD }}>
                Fine dining · Est. 2011
              </p>
              <h1 className={`${serif} text-5xl uppercase leading-[1.05] tracking-wide md:text-7xl`}>
                Intimate.
                <br />
                Unmistakably yours.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[#d9cfbe]">
                Seasonal French-American cooking, an award-winning cellar and a room built for
                long, unhurried evenings.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#reservations"
                  style={{ backgroundColor: GOLD }}
                  className={`px-8 py-4 text-xs uppercase tracking-[0.2em] text-[#1a1208] transition-opacity hover:opacity-90 ${focus}`}
                >
                  Reserve a Table
                </a>
                <a
                  href="#menu"
                  className={`border border-[#d9cfbe]/60 px-8 py-4 text-xs uppercase tracking-[0.2em] transition-colors hover:border-[#c9a45c] hover:text-[#c9a45c] ${focus}`}
                >
                  View the Menu
                </a>
              </div>
            </div>
          </section>

          {/* Menu */}
          <section id="menu" className="scroll-mt-32 px-6 py-24">
            <div className="mx-auto max-w-4xl">
              <p className="text-center text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD }}>
                The Menu
              </p>
              <h2 className={`${serif} mt-3 text-center text-4xl md:text-5xl`}>
                Cooked with the seasons
              </h2>

              <div
                role="tablist"
                aria-label="Menu courses"
                className="mt-10 flex justify-center gap-2 border-b border-[#2a2018]"
              >
                {MENU.map((c) => {
                  const selected = c.id === course;
                  return (
                    <button
                      key={c.id}
                      role="tab"
                      type="button"
                      id={`aurum-tab-${c.id}`}
                      aria-selected={selected}
                      aria-controls="aurum-menu-panel"
                      onClick={() => setCourse(c.id)}
                      className={`-mb-px border-b-2 px-5 py-3 text-xs uppercase tracking-[0.25em] transition-colors ${focus} ${
                        selected
                          ? "border-[#c9a45c] text-[#c9a45c]"
                          : "border-transparent text-[#a89a85] hover:text-[#f3ece0]"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              <ul
                role="tabpanel"
                id="aurum-menu-panel"
                aria-labelledby={`aurum-tab-${activeCourse.id}`}
                className="mt-10 space-y-8"
              >
                {activeCourse.items.map((item) => (
                  <li key={item.name} className="flex items-baseline gap-4">
                    <div className="flex-1">
                      <h3 className={`${serif} text-xl`}>{item.name}</h3>
                      <p className="mt-1 text-sm text-[#a89a85]">{item.note}</p>
                    </div>
                    <span className={`${serif} text-lg`} style={{ color: GOLD }}>
                      ${item.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Experience */}
          <section id="experience" className="scroll-mt-32 bg-[#110b07] px-6 py-24">
            <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src="/products/templates/aurum-room.jpg"
                    alt="The Aurum bar and patterned feature wall"
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative mt-10 aspect-[3/4] overflow-hidden">
                  <Image
                    src="/products/templates/aurum-garden.jpg"
                    alt="Greenery and wooden planters on the Aurum garden patio"
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD }}>
                  The Experience
                </p>
                <h2 className={`${serif} mt-3 text-4xl md:text-5xl`}>An evening, composed</h2>
                <p className="mt-6 leading-relaxed text-[#d9cfbe]">
                  From the first pour to the last course, every detail at Aurum is considered:
                  hand-selected ceramics, warm light, and a team that remembers how you take your
                  coffee.
                </p>
                <ul className="mt-8 space-y-6">
                  {HIGHLIGHTS.map((h) => (
                    <li key={h.title} className="border-l-2 pl-5" style={{ borderColor: GOLD }}>
                      <h3 className={`${serif} text-xl`}>{h.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#a89a85]">{h.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Reservations */}
          <section id="reservations" className="scroll-mt-32 px-6 py-24">
            <div className="mx-auto max-w-2xl">
              <p className="text-center text-[11px] uppercase tracking-[0.4em]" style={{ color: GOLD }}>
                Reservations
              </p>
              <h2 className={`${serif} mt-3 text-center text-4xl md:text-5xl`}>Reserve your table</h2>
              <p className="mt-4 text-center text-sm text-[#a89a85]">
                Tables are released 30 days in advance. For parties of 9 or more, please call us.
              </p>

              {sent ? (
                <div
                  role="status"
                  className="mt-10 border border-[#3a2e22] bg-[#150f0a] p-10 text-center"
                >
                  <p className={`${serif} text-3xl`} style={{ color: GOLD }}>
                    Thank you, {sent.name || "guest"}
                  </p>
                  <p className="mt-4 leading-relaxed text-[#d9cfbe]">
                    Your request for {sent.guests} {sent.guests === "1" ? "guest" : "guests"}
                    {sent.date ? ` on ${sent.date}` : ""} at {sent.time} has been received. A
                    confirmation will follow shortly.
                  </p>
                  <p className="mt-4 text-xs text-[#6f6252]">
                    This is a demo. No reservation was made and nothing was sent.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(null)}
                    className={`mt-8 border border-[#3a2e22] px-6 py-3 text-xs uppercase tracking-[0.2em] transition-colors hover:border-[#c9a45c] hover:text-[#c9a45c] ${focus}`}
                  >
                    Make another request
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-10 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="aurum-name" className={label}>
                      Full name
                    </label>
                    <input id="aurum-name" name="name" required autoComplete="name" className={field} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="aurum-email" className={label}>
                      Email
                    </label>
                    <input
                      id="aurum-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className={field}
                    />
                  </div>
                  <div>
                    <label htmlFor="aurum-date" className={label}>
                      Date
                    </label>
                    <input
                      id="aurum-date"
                      name="date"
                      type="date"
                      required
                      className={`${field} [color-scheme:dark]`}
                    />
                  </div>
                  <div>
                    <label htmlFor="aurum-time" className={label}>
                      Time
                    </label>
                    <select id="aurum-time" name="time" required defaultValue="7:00 PM" className={field}>
                      {TIMES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="aurum-guests" className={label}>
                      Guests
                    </label>
                    <select id="aurum-guests" name="guests" required defaultValue="2" className={field}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="aurum-notes" className={label}>
                      Special requests (optional)
                    </label>
                    <textarea
                      id="aurum-notes"
                      name="notes"
                      rows={3}
                      placeholder="Allergies, celebrations, seating preferences"
                      className={`${field} resize-none`}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{ backgroundColor: GOLD }}
                    className={`px-8 py-4 text-xs uppercase tracking-[0.25em] text-[#1a1208] transition-opacity hover:opacity-90 sm:col-span-2 ${focus}`}
                  >
                    Request reservation
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Visit */}
          <section id="visit" className="scroll-mt-32 border-t border-[#2a2018] bg-[#110b07] px-6 py-20">
            <div className="mx-auto grid max-w-6xl gap-10 text-center md:grid-cols-3 md:text-left">
              <div>
                <h2 className={`${serif} text-2xl`}>Find us</h2>
                <address className="mt-4 text-sm not-italic leading-relaxed text-[#a89a85]">
                  128 Mercer Lane
                  <br />
                  New York, NY 10012
                </address>
              </div>
              <div>
                <h2 className={`${serif} text-2xl`}>Hours</h2>
                <ul className="mt-4 space-y-1 text-sm text-[#a89a85]">
                  <li>Tue – Thu · 5:30 PM – 10:00 PM</li>
                  <li>Fri – Sat · 5:30 PM – 11:30 PM</li>
                  <li>Sun · 5:00 PM – 9:30 PM</li>
                  <li>Closed Monday</li>
                </ul>
              </div>
              <div>
                <h2 className={`${serif} text-2xl`}>Contact</h2>
                <ul className="mt-4 space-y-1 text-sm text-[#a89a85]">
                  <li>(212) 555-0142</li>
                  <li>reservations@aurum.example</li>
                </ul>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#2a2018] px-6 py-8 text-center">
          <p className={`${serif} text-lg tracking-[0.3em]`}>AURUM</p>
          <p className="mt-2 text-xs text-[#6f6252]">© 2026 Aurum Fine Dining. Sample restaurant.</p>
          <DemoNote className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#a89a85]" />
        </footer>
      </div>
    </DemoShell>
  );
}
