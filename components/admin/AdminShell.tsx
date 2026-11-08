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
          <div className="absolute inset-0 rounded-full bg-[#2F6FEA]/40 blur-md" aria-hidden="true" />
          <Image src="/yakimel-icon.png" alt="" width={36} height={36} className="relative h-9 w-9" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-bold tracking-[0.12em] text-white">YAKIMEL</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#7f93b8]">Command Center</p>
        </div>
      </Link>

      <nav aria-label="YAKIMEL OS" className="flex-1 space-y-5 overflow-y-auto px-3 pb-6 pt-2 [scrollbar-color:#232a38_transparent] [scrollbar-width:thin]">
        {groups.map((group, gi) => (
          <div key={group.label ?? gi}>
            {group.label && (
              <p className="mb-1.5 px-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[#5d6b86]">{group.label}</p>
            )}
            <ul className="space-y-0.5">
              {group.links.map((link) => {
                const Icon = ICONS[link.icon];
                const active = link.href ? isActive(link.href) : false;
                const inner = (
                  <>
                    <Icon size={17} aria-hidden="true" className={active ? "text-[#4d8dff]" : ""} />
                    <span className="flex-1 truncate">{link.label}</span>
                    {link.dot && <span className={`h-1.5 w-1.5 rounded-full ${DOTS[link.dot]}`} aria-hidden="true" />}
                    {link.badge ? (
                      <span className="rounded-full bg-[#2F6FEA] px-1.5 py-px text-[10px] font-semibold text-white shadow-[0_0_12px_rgba(47,111,234,0.7)]">
                        {link.badge}
                      </span>
                    ) : null}
                    {link.soon && <span className="font-mono text-[9px] uppercase tracking-wider text-[#5d6b86]">Soon</span>}
                  </>
                );
                const base = "flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] transition-colors";
                return (
                  <li key={link.label}>
                    {link.href && !link.soon ? (
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`${base} ${
                          active
                            ? "bg-gradient-to-r from-[#2F6FEA]/25 to-[#2F6FEA]/5 text-white shadow-[inset_2px_0_0_#4d8dff]"
                            : "text-[#a2adc4] hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <span className={`${base} cursor-default text-[#4f5b73]`} aria-disabled="true">
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 print:!hidden border-r border-white/[0.06] bg-[#08090d]/80 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-white/[0.06] bg-[#08090d]">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-4 top-6 text-[#a2adc4]">
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64 print:!pl-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 print:hidden border-b border-white/[0.06] bg-[#07080b]/75 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="text-white lg:hidden">
              <Menu size={22} />
            </button>

            <form action="/admin/search" className="relative flex-1 sm:max-w-xl">
              <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7f93b8]" />
              <input
                name="q"
                type="search"
                placeholder="Search clients, projects, tasks, people…"
                aria-label="Search YAKIMEL OS"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#6b7894] focus:border-[#2F6FEA]/60 focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#2F6FEA]/25"
              />
            </form>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <Link
                href="/admin/notifications"
                aria-label={unread ? `Notifications (${unread} unread)` : "Notifications"}
                className="relative rounded-lg p-2 text-[#a2adc4] transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <Bell size={19} />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2F6FEA] px-1 text-[10px] font-semibold text-white shadow-[0_0_10px_rgba(47,111,234,0.8)]">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>

              <Link
                href="/admin/account"
                className="hidden items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.05] sm:flex"
              >
                <CircleUser size={22} className="text-[#7f93b8]" aria-hidden="true" />
                <span className="text-left leading-tight">
                  <span className="block max-w-[10rem] truncate text-sm font-medium text-white">{user.name}</span>
                  <span className="block text-[11px] text-[#7f93b8]">{user.roleName}</span>
                </span>
              </Link>

              <form action={logout}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  title="Sign out"
                  className="rounded-lg p-2 text-[#a2adc4] transition-colors hover:bg-white/[0.05] hover:text-white"
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
