"use client";

import Image from "next/image";
import { useState } from "react";
import ConceptPreview from "@/components/innovation/ConceptPreview";
import { INNOVATION_PAGE, type ConceptKind, type PhotoAsset } from "@/lib/innovation";

/**
 * Illustrative stock photo for a concept project. If the image fails to load,
 * falls back to the labelled CSS mock-up.
 */
export default function ProjectPhoto({
  photo,
  kind,
  sizes,
}: {
  photo: PhotoAsset;
  kind: ConceptKind;
  sizes: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <ConceptPreview kind={kind} />;

  return (
    <>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
      <span className="absolute left-3 top-3 rounded-full border border-[#c9a45c]/50 bg-bg-dark/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#c9a45c] backdrop-blur-sm">
        {INNOVATION_PAGE.photoLabel}
      </span>
    </>
  );
}
