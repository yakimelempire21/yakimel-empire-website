import HomeHero from "@/components/home/HomeHero";
import HomeServices from "@/components/home/HomeServices";
import Expertise from "@/components/Expertise";
import HomeWork from "@/components/home/HomeWork";
import HomeProducts from "@/components/home/HomeProducts";
import HomeProcess from "@/components/home/HomeProcess";
import HomeAbout from "@/components/home/HomeAbout";
import HomeFAQ from "@/components/home/HomeFAQ";
import HomeCTA from "@/components/home/HomeCTA";
import Testimonials from "@/components/Testimonials";

// Refresh the reviews section at least every 10 minutes (and right after one is approved).
export const revalidate = 600;

// Lean, sales-focused home page. The older long-form sections (Mission,
// Values, Ecosystem, Why Us…) are still in components/ if you want them
// on a separate About page later.
export default function Home() {
  return (
    <main>
      <HomeHero />
      <HomeServices />
      <Expertise />
      <HomeWork />
      <HomeProducts />
      <HomeProcess />
      <HomeAbout />
      <Testimonials />
      <HomeFAQ />
      <HomeCTA />
    </main>
  );
}
