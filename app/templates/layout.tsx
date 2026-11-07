import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Work | Yakimel Empire LLC",
  description:
    "Website concept designs by Yakimel Empire LLC for construction, hospitality and e-commerce businesses. Every site is built around your business.",
  openGraph: {
    title: "Our Work | Yakimel Empire LLC",
    description:
      "Website concept designs by Yakimel Empire LLC for construction, hospitality and e-commerce businesses. Every site is built around your business.",
    type: "website",
    siteName: "Yakimel Empire LLC",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
