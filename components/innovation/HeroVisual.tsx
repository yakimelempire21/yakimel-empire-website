import Image from "next/image";
import { INNOVATION_PAGE } from "@/lib/innovation";

/** Hero image: a laptop and phone over a soft blue glow (transparent PNG). Decorative, not a product screenshot. */
export default function HeroVisual() {
  const { hero } = INNOVATION_PAGE;
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <Image
        src={hero.src}
        alt={hero.alt}
        width={hero.width}
        height={hero.height}
        priority
        sizes="(min-width: 1024px) 576px, 100vw"
        className="h-auto w-full"
      />
    </div>
  );
}
