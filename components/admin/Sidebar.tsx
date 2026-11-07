"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppWindow, Briefcase, Inbox, LayoutDashboard, LogOut, Menu, Users, UserSquare2, X } from "lucide-react";

const ICONS = {
  dashboard: LayoutDashboard,
  inbox: Inbox,
  clients: UserSquare2,
  projects: Briefcase,
  employees: Users,
  apps: AppWindow,
} as const;

export type NavItem = { key: keyof typeof ICONS; label: string; href: string; badge?: number };

export default function Sidebar({
  items,
  user,
  logout,
}: {
  items: NavItem[];
  user: { name: string; roleName: string };
  logout: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-5 py-5" onClick={() => setOpen(false)}>
        <Image src="/yakimel-icon.png" alt="" width={32} height={32} className="h-8 w-8" />
        <div className="leading-tight">
          <p className="font-display text-sm font-bold text-ink-invert">YAKIMEL EMPIRE</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-dim-invert">Command Center</p>
        </div>
      </Link>

      <nav aria-label="Command Center" className="mt-2 flex-1 space-y-1 px-3">
        {items.map((item) => {
          const Icon = ICONS[item.key];
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active ? "bg-brand/15 text-ink-invert" : "text-dim-invert hover:bg-white/5 hover:text-ink-invert"
              }`}
            >
              <Icon size={18} aria-hidden="true" className={active ? "text-brand" : ""} />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">{item.badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium text-ink-invert">{user.name}</p>
        <p className="text-xs text-dim-invert">{user.roleName}</p>
        <form action={logout} className="mt-3">
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-dim-invert transition-colors hover:text-ink-invert"
          >
            <LogOut size={16} aria-hidden="true" /> Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-bg-dark/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/yakimel-icon.png" alt="" width={28} height={28} className="h-7 w-7" />
          <span className="font-display text-sm font-bold text-ink-invert">Command Center</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="text-ink-invert">
          <Menu size={22} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-white/10 bg-[#070c22]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-4 top-5 text-dim-invert"
            >
              <X size={20} />
            </button>
            {nav}
          </aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#070c22] lg:block">{nav}</aside>
    </>
  );
}
