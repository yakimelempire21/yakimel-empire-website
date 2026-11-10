"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const SERVICES = [
  {
    number: "01",
    title: "Web Design & Development",
    image: "/service-web.png",
    tagline: "WE DON'T JUST BUILD WEBSITES. WE BUILD DIGITAL SYSTEMS.",
    list: [
      "Business Websites",
      "Corporate Websites",
      "E-Commerce",
      "Landing Pages",
      "Portfolio Websites",
      "Custom Websites",
      "Website Redesign",
      "Responsive Development",
    ],
    cta: "Explore Web Development",
    accent: "#4d8dff",
  },
  {
    number: "02",
    title: "App Design & Development",
    image: "/service-app.png",
    tagline: null,
    list: [
      "iOS Applications",
      "Android Applications",
      "Web Applications",
      "Business Applications",
      "Marketplace Applications",
      "UI/UX Design",
      "App Prototypes",
    ],
    cta: "Build Your App",
    accent: "#7c6dff",
  },
  {
    number: "03",
    title: "Custom Software",
    image: "/service-software.png",
    tagline: "SOFTWARE BUILT AROUND YOUR BUSINESS.",
    description:
      "Custom platforms and digital systems engineered for performance, scalability, security and growth.",
    cta: "Discuss Your Software",
    accent: "#4dd0ff",
  },
  {
    number: "04",
    title: "AI & Automation",
    image: "/service-ai.png",
    tagline: "INTELLIGENCE BUILT INTO TECHNOLOGY.",
    description: "AI assistants. Automation. Intelligent workflows. Data-driven systems.",
    cta: "Explore AI Solutions",
    accent: "#4d8dff",
  },
];

function ServiceRow({
  service,
  index,
}: {
  service: (typeof SERVICES)[number];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reversed = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-10 py-20 md:flex-row md:gap-16 md:py-32 ${
        reversed ? "md:flex-row-reverse" : ""
      }`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full overflow-hidden rounded-2xl md:w-1/2"
        style={{ boxShadow: `0 0 60px -10px ${service.accent}33` }}
      >
        <Image
          src={service.image}
          alt={service.title}
          width={1536}
          height={1024}
          className="h-auto w-full object-cover"
        />
      </motion.div>

      <div className="w-full px-6 md:w-1/2 md:px-0">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-4 block font-mono text-xs tracking-[0.3em]"
          style={{ color: service.accent }}
        >
          {service.number}
        </motion.span>

        <motion.h3
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.18 }}
          className="mb-5 font-display text-3xl font-bold leading-tight text-ink-invert md:text-4xl"
        >
          {service.title.toUpperCase()}
        </motion.h3>

        {service.tagline && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-6 font-mono text-xs tracking-[0.15em] text-dim-invert"
          >
            {service.tagline}
          </motion.p>
        )}

        {service.description && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-6 text-dim-invert"
          >
            {service.description}
          </motion.p>
        )}

        {service.list && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8 grid grid-cols-2 gap-x-6 gap-y-2"
          >
            {service.list.map((item) => (
              <li key={item} className="text-sm text-dim-invert">
                {item}
              </li>
            ))}
          </motion.ul>
        )}

        <motion.a
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          href="/consultation"
          className="inline-block rounded-full border px-7 py-3 font-mono text-xs uppercase tracking-widest text-ink-invert transition-colors"
          style={{ borderColor: service.accent }}
        >
          {service.cta}
        </motion.a>
      </div>
    </div>
  );
}

export default function ServiceWorlds() {
  return (
    <section id="services" className="bg-bg-dark px-6 py-24 md:px-16">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <p className="mb-4 font-mono text-xs tracking-[0.3em] text-brand">
          THE YAKIMEL TECHNOLOGY ECOSYSTEM
        </p>
        <h2 className="font-display text-3xl font-bold leading-tight text-ink-invert md:text-5xl">
          WE DON&apos;T JUST BUILD WEBSITES.
          <br />
          WE BUILD DIGITAL SYSTEMS.
        </h2>
      </div>

      <div className="mx-auto max-w-6xl divide-y divide-ink-invert/15">
        {SERVICES.map((service, i) => (
          <ServiceRow key={service.number} service={service} index={i} />
        ))}
      </div>
    </section>
  );
}