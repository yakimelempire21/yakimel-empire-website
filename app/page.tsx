import HomeHero from "@/components/home/HomeHero";
import HomeServices from "@/components/home/HomeServices";
import HomeWork from "@/components/home/HomeWork";
import HomeProcess from "@/components/home/HomeProcess";
import HomeFAQ from "@/components/home/HomeFAQ";
import HomeCTA from "@/components/home/HomeCTA";
import Testimonials from "@/components/Testimonials";

// Refresh the reviews section at least every 10 minutes (and right after one is approved).
export const revalidate = 600;

// Lean, sales-focused home page: every section leads to "Start Your Project".
// "About us", "Your website. Your control." and "Our products" live on /about.
export default function Home() {
  return (
    <main>
      <HomeHero />
      <HomeServices />
      <HomeWork />
      <HomeProcess />
      <Testimonials />
      <HomeFAQ />
      <HomeCTA />
    </main>
  );
}
