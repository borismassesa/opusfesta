"use client";

import { motion } from "motion/react";

import ProductInsightsCard from "@/components/shadcn-studio/blocks/widget-product-insights";

const ProductMetrics = () => {
  return (
    <div className="relative flex min-h-97 flex-1 items-center justify-center overflow-hidden">
      <motion.svg
        width="550px"
        height="550px"
        viewBox="0 0 550 550"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute"
        initial="hidden"
        animate="visible"
      >
        <motion.circle
          strokeOpacity={0.8}
          cx="275"
          cy="275"
          r="240"
          fill="color-mix(in oklab, var(--primary) 05%, transparent)"
          variants={{
            visible: {
              scale: [0.96, 1.12, 0.96],
              transition: {
                scale: { delay: 0.72, duration: 2.75, repeat: Infinity, ease: "easeOut" },
              },
            },
          }}
        />
        <motion.circle
          strokeOpacity={0.8}
          cx="275"
          cy="275"
          r="205"
          fill="color-mix(in oklab, var(--primary) 05%, transparent)"
          variants={{
            visible: {
              scale: [0.96, 1.12, 0.96],
              transition: {
                scale: { delay: 0.54, duration: 2.75, repeat: Infinity, ease: "easeOut" },
              },
            },
          }}
        />
        <motion.circle
          strokeOpacity={0.8}
          cx="275"
          cy="275"
          r="170"
          fill="color-mix(in oklab, var(--primary) 05%, transparent)"
          variants={{
            visible: {
              scale: [0.96, 1.12, 0.96],
              transition: {
                scale: { delay: 0.36, duration: 2.75, repeat: Infinity, ease: "easeOut" },
              },
            },
          }}
        />
        <motion.circle
          strokeOpacity={0.8}
          cx="275"
          cy="275"
          r="135"
          fill="color-mix(in oklab, var(--primary) 05%, transparent)"
          variants={{
            visible: {
              scale: [0.96, 1.12, 0.96],
              transition: {
                scale: { delay: 0.18, duration: 2.75, repeat: Infinity, ease: "easeOut" },
              },
            },
          }}
        />
        <motion.circle
          strokeOpacity={1}
          cx="275"
          cy="275"
          r="100"
          fill="color-mix(in oklab, var(--primary) 05%, transparent)"
          variants={{
            visible: {
              scale: [0.96, 1.12, 0.96],
              transition: { scale: { duration: 2.75, repeat: Infinity, ease: "easeOut" } },
            },
          }}
        />
      </motion.svg>
      <ProductInsightsCard className="z-10 w-full max-w-68" />
      <div className="from-card pointer-events-none absolute inset-x-0 top-0 h-15 bg-gradient-to-b to-transparent" />
      <div className="from-card pointer-events-none absolute inset-y-0 right-0 w-15 bg-gradient-to-l to-transparent" />
      <div className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-15 bg-gradient-to-t to-transparent" />
      <div className="from-card pointer-events-none absolute inset-y-0 left-0 w-15 bg-gradient-to-r to-transparent" />
    </div>
  );
};

export default ProductMetrics;
