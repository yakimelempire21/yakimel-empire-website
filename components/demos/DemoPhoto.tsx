"use client";

import { createContext, useContext } from "react";
import { ImageIcon } from "lucide-react";
import type { Photo } from "@/lib/demo-sites";

/** Which demo photo files exist in /public (worked out on the server). */
export const PhotoContext = createContext<Set<string>>(new Set());

/**
 * A demo photo. Shows the real file when it has been added to public/demos/…,
 * otherwise a soft placeholder in the demo's colors, so the page never looks broken.
 */
export default function DemoPhoto({
  photo,
  className = "",
  tone,
  ink,
  label = true,
  priority,
}: {
  photo: Photo;
  className?: string;
  tone: string;
  ink: string;
  label?: boolean;
  priority?: boolean;
}) {
  const have = useContext(PhotoContext);
  if (have.has(photo.src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo.src}
        alt={photo.alt}
        loading={priority ? "eager" : "lazy"}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={photo.alt}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 20% 10%, ${tone}, transparent 60%), radial-gradient(90% 80% at 90% 100%, ${ink}22, transparent 60%), ${tone}`,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18]"
        style={{ backgroundImage: `radial-gradient(${ink} 1px, transparent 1px)`, backgroundSize: "18px 18px" }}
      />
      {label && (
        <span className="relative flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium backdrop-blur" style={{ color: ink }}>
          <ImageIcon size={14} aria-hidden="true" />
          {photo.alt}
        </span>
      )}
    </div>
  );
}
