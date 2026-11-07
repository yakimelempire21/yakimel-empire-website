import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Yakimel Empire LLC",
  description:
    "Answers to common questions about Yakimel Empire LLC, our services, applications, technology, partnerships and support.",
  openGraph: {
    title: "FAQ | Yakimel Empire LLC",
    description:
      "Answers to common questions about Yakimel Empire LLC, our services, applications, technology, partnerships and support.",
    type: "website",
    siteName: "Yakimel Empire LLC",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
