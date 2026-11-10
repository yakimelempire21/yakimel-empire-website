import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChromeGate from "@/components/ChromeGate";
import WhatsAppButton from "@/components/WhatsAppButton";
import SmoothScroll from "@/components/motion/SmoothScroll";
import MotionProvider from "@/components/motion/MotionProvider";
import { SITE } from "@/lib/site";


const SITE_DESCRIPTION =
  "Yakimel Empire LLC designs and builds websites, online stores, apps and AI tools for small businesses, with clear starting prices and a private dashboard you control.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Yakimel Empire LLC | Websites, Apps & AI for Small Business",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Yakimel Empire LLC | Websites, Apps & AI for Small Business",
    description: SITE_DESCRIPTION,
    type: "website",
    siteName: SITE.name,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-body bg-bg text-ink antialiased min-h-full" suppressHydrationWarning>
        <ChromeGate>
          <Nav />
        </ChromeGate>
        <MotionProvider>{children}</MotionProvider>
        <ChromeGate>
          <Footer />
          <WhatsAppButton />
          <SmoothScroll />
        </ChromeGate>
      </body>
    </html>
  );
}
