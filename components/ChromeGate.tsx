"use client";

import { usePathname } from "next/navigation";
import { hasDemo } from "@/lib/demos";

/**
 * Hides the Yakimel site chrome (Nav / Footer) on built-in demo pages and the
 * Command Center, which have their own top bar and layout.
 */
export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // The Command Center (/admin) has its own layout.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  const match = /^\/demo\/([^/]+)/.exec(pathname);
  if (match && hasDemo(match[1])) return null;
  return <>{children}</>;
}
