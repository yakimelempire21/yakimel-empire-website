import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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

export const metadata: Metadata = {
  title: "Yakimel Empire LLC | Technology. Innovation. Future.",
  description:
    "Yakimel Empire LLC builds and operates a portfolio of SaaS and marketplace products, end-to-end, from a single desk in Garnerville, New York.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body bg-bg text-ink antialiased min-h-full" suppressHydrationWarning>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
