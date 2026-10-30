"use client";

import { usePathname } from "next/navigation";
import { hasDemo } from "@/lib/demos";

/**
 * Hides the Yakimel site chrome (Nav / Footer) on built-in demo pages, which
 * are standalone sites with their own top bar and footer.
 */
export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const match = /^\/demo\/([^/]+)/.exec(pathname);
  if (match && hasDemo(match[1])) return null;
  return <>{children}</>;
}
