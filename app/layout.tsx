import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ChromeGate from "@/components/ChromeGate";
import { SITE } from "@/lib/site";

const display = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

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
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body bg-bg text-ink antialiased min-h-full" suppressHydrationWarning>
        <ChromeGate>
          <Nav />
        </ChromeGate>
        {children}
        <ChromeGate>
          <Footer />
        </ChromeGate>
      </body>
    </html>
  );
}
