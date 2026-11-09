"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AppWindow,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CircleUser,
  FileText,
  Handshake,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogOut,
  Menu,
  Plug,
  Receipt,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Star,
  UserSquare2,
  Users,
  Wallet,
  X,
} from "lucide-react";

const ICONS = {
  overview: LayoutDashboard,
  departments: Building2,
  employees: Users,
  clients: UserSquare2,
  projects: Briefcase,
  tasks: ListChecks,
  app: AppWindow,
  inbox: Inbox,
  tickets: LifeBuoy,
  reviews: Star,
  notifications: Bell,
  finance: Wallet,
  invoices: Receipt,
  contracts: Handshake,
  documents: FileText,
  monitoring: Activity,
  security: ShieldCheck,
  analytics: BarChart3,
  roles: KeyRound,
  integrations: Plug,
  audit: ScrollText,
  settings: Settings,
} as const;
export type IconKey = keyof typeof ICONS;

export type NavLink = {
  label: string;
  href?: string;
  icon: IconKey;
  badge?: number;
  /** Small colored dot (used for app status in the Ecosystem group). */
  dot?: "green" | "amber" | "red" | "violet";
  /** Planned for a later phase; shown but not clickable. */
  soon?: boolean;
};
export type NavGroup = { label?: string; links: NavLink[] };

const DOTS = { green: "bg-emerald-400", amber: "bg-amber-400", red: "bg-red-400", violet: "bg-violet-400" };

export default function AdminShell({
  groups,
  user,
  unread,
  logout,
  children,
}: {
  groups: NavGroup[];
  user: { name: string; roleName: string };
  unread: number;
  logout: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 pb-4 pt-5">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-os-lime/40 blur-md" aria-hidden="true" />
          <Image src="/yakimel-icon.png" alt="" width={36} height={36} className="relative h-9 w-9" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-bold tracking-[0.12em] text-white">YAKIMEL</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#c9b6dc]">Command Center</p>
        </div>
      </Link>

      <nav aria-label="YAKIMEL OS" className="flex-1 space-y-5 overflow-y-auto px-3 pb-6 pt-2 [scrollbar-color:#4a2459_transparent] [scrollbar-width:thin]">
        {groups.map((group, gi) => (
          <div key={group.label ?? gi}>
            {group.label && (
              <p className="mb-1.5 px-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#b49fc9]">{group.label}</p>
            )}
            <ul className="space-y-0.5">
              {group.links.map((link) => {
                const Icon = ICONS[link.icon];
                const active = link.href ? isActive(link.href) : false;
                const inner = (
                  <>
                    <Icon size={17} aria-hidden="true" className={active ? "text-os-ink" : ""} />
                    <span className="flex-1 truncate">{link.label}</span>
                    {link.dot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[link.dot]}`} aria-hidden="true" />}
                    {link.badge ? (
                      <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${active ? "bg-os-ink text-os-lime" : "bg-os-lime text-os-ink"}`}>
                        {link.badge}
                      </span>
                    ) : null}
                    {link.soon && <span className="font-mono text-[9px] uppercase tracking-wider text-[#b49fc9]">Soon</span>}
                  </>
                );
                const base = "flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-colors";
                return (
                  <li key={link.label}>
                    {link.href && !link.soon ? (
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`${base} ${
                          active
                            ? "bg-os-lime font-semibold text-os-ink shadow-[0_6px_20px_-8px_rgba(227,242,107,0.6)]"
                            : "text-[#e9def3] hover:bg-white/[0.07] hover:text-white"
                        }`}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <span className={`${base} cursor-default text-[#8f78a3]`} aria-disabled="true">
                        {inner}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 print:!hidden bg-os-side lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-os-ink/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-os-side">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-4 top-6 text-[#e9def3]">
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64 print:!pl-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 print:hidden border-b border-os-ink/10 bg-os-bg/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="text-os-ink lg:hidden">
              <Menu size={22} />
            </button>

            <form action="/admin/search" className="relative flex-1 sm:max-w-xl">
              <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-os-ink" />
              <input
                name="q"
                type="search"
                placeholder="Search clients, projects, tasks, people…"
                aria-label="Search YAKIMEL OS"
                className="w-full rounded-xl border border-os-ink/25 bg-white py-2.5 pl-10 pr-4 text-sm text-os-ink placeholder:text-os-ink/70 focus:border-os-accent focus:outline-none focus:ring-2 focus:ring-os-accent/20"
              />
            </form>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <Link
                href="/admin/notifications"
                aria-label={unread ? `Notifications (${unread} unread)` : "Notifications"}
                className="relative rounded-lg p-2 text-os-ink transition-colors hover:bg-os-ink/5"
              >
                <Bell size={19} />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F0533F] px-1 text-[10px] font-semibold text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>

              <Link
                href="/admin/account"
                className="hidden items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-os-ink/5 sm:flex"
              >
                <CircleUser size={24} className="text-os-ink" aria-hidden="true" />
                <span className="text-left leading-tight">
                  <span className="block max-w-[10rem] truncate text-sm font-semibold text-os-ink">{user.name}</span>
                  <span className="block text-[11px] text-os-muted">{user.roleName}</span>
                </span>
              </Link>

              <form action={logout}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  title="Sign out"
                  className="rounded-lg p-2 text-os-ink transition-colors hover:bg-os-ink/5"
                >
                  <LogOut size={18} />
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10 print:max-w-none print:p-0">{children}</main>
      </div>
    </>
  );
}
