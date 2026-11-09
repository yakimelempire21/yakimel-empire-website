"use client";

/** Wraps a card so a soft blue glow follows the pointer (see .spotlight in globals.css). */
export default function Spotlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`spotlight ${className}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}
