"use client";

import { motion, type Variants } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const item: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease } },
};

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section" | "header" | "p" | "span";
};

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0, as = "div" }: Props) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={{ ...item, show: { ...(item.show as object), transition: { duration: 0.8, ease, delay } } }}
    >
      {children}
    </Tag>
  );
}

/** A list whose children (<RevealItem>) appear one after another. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  as = "ul",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  as?: "ul" | "ol" | "div";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ children, className, as = "li" }: { children: React.ReactNode; className?: string; as?: "li" | "div" }) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={item}>
      {children}
    </Tag>
  );
}
