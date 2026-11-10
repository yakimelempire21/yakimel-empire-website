import type { Metadata } from "next";
import HomeAbout from "@/components/home/HomeAbout";
import Expertise from "@/components/Expertise";
import HomeProducts from "@/components/home/HomeProducts";
import HomeCTA from "@/components/home/HomeCTA";
import { SITE } from "@/lib/site";

const title = "About Yakimel Empire — New York technology studio";
const description =
  "Yakimel Empire LLC designs and builds websites, online stores, apps and AI tools for small businesses, and runs its own platforms like DigiMarket.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: { title, description, type: "website", siteName: SITE.name },
};

export default function AboutPage() {
  return (
    <main className="pt-20">
      <HomeAbout />
      <Expertise />
      <HomeProducts />
      <HomeCTA />
    </main>
  );
}
