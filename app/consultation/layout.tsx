import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a Project | Yakimel Empire LLC",
  description:
    "Tell us about your website, online store, app or AI project. Yakimel Empire LLC will follow up within 24-48 business hours.",
  openGraph: {
    title: "Start a Project | Yakimel Empire LLC",
    description:
      "Tell us about your website, online store, app or AI project. Yakimel Empire LLC will follow up within 24-48 business hours.",
    type: "website",
    siteName: "Yakimel Empire LLC",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
