"use client";

import { MotionConfig } from "framer-motion";

/** People who ask their device for less motion get fades only: no sliding, scaling or parallax. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
