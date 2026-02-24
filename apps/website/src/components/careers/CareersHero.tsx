"use client";

import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCareersContent } from "@/context/CareersContentContext";
import Carousel3D from "./Carousel3D";

// Default slides - fallback if CMS has no images
const DEFAULT_SLIDES = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop&q=80", 
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop&q=80"
];

export function CareersHero() {
  const { content, contentVersion } = useCareersContent();
  const { hero } = content;
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Use carousel images from CMS, or fallback to defaults
  const carouselImages = hero.carouselImages && hero.carouselImages.length > 0 
    ? hero.carouselImages.filter(img => img && img.trim() !== "")
    : DEFAULT_SLIDES;
  const cacheBustedCarouselImages = carouselImages.map((img) => {
    if (!contentVersion) return img;
    const separator = img.includes("?") ? "&" : "?";
    return `${img}${separator}v=${encodeURIComponent(contentVersion)}`;
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (prefersReducedMotion) {
      section.style.setProperty("--spot-x", "50%");
      section.style.setProperty("--spot-y", "18%");
      section.style.setProperty("--spot-opacity", "0.08");
      return;
    }

    let rafId: number | null = null;
    const pointer = { x: 50, y: 20, active: false };

    const renderSpotlight = () => {
      rafId = null;
      section.style.setProperty("--spot-x", `${pointer.x}%`);
      section.style.setProperty("--spot-y", `${pointer.y}%`);
      section.style.setProperty("--spot-opacity", pointer.active ? "0.2" : "0.1");
    };

    const queueRender = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(renderSpotlight);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = section.getBoundingClientRect();
      const nextX = ((event.clientX - bounds.left) / bounds.width) * 100;
      const nextY = ((event.clientY - bounds.top) / bounds.height) * 100;

      pointer.x = Math.max(0, Math.min(100, nextX));
      pointer.y = Math.max(0, Math.min(100, nextY));
      pointer.active = true;
      queueRender();
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.x = 50;
      pointer.y = 18;
      queueRender();
    };

    renderSpotlight();
    section.addEventListener("pointermove", handlePointerMove);
    section.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="planning-motion relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-x-clip overflow-y-visible bg-background py-12 text-primary selection:bg-primary selection:text-primary-foreground sm:py-16 md:py-20 [--spot-opacity:0.1] [--spot-x:50%] [--spot-y:18%]"
    >
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(130%_85%_at_10%_0%,color-mix(in_oklab,var(--primary)_10%,transparent)_0%,transparent_62%),radial-gradient(90%_70%_at_90%_20%,color-mix(in_oklab,var(--primary)_7%,transparent)_0%,transparent_64%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_98%,var(--primary)_2%)_0%,var(--background)_70%)]" />
        <div
          className="absolute inset-0 bg-[radial-gradient(460px_circle_at_var(--spot-x)_var(--spot-y),color-mix(in_oklab,var(--primary)_14%,transparent)_0%,transparent_62%)] transition-opacity duration-300 motion-reduce:transition-none"
          style={{ opacity: "var(--spot-opacity)" }}
        />
        <div
          className={`absolute -top-24 left-[8%] h-72 w-72 rounded-full bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] blur-3xl ${prefersReducedMotion ? "" : "animate-pulse"}`}
        />
        <div
          className={`absolute right-[5%] top-24 h-64 w-64 rounded-full bg-[color-mix(in_oklab,var(--primary)_8%,transparent)] blur-3xl ${prefersReducedMotion ? "" : "animate-pulse"}`}
          style={{ animationDelay: "1.3s", animationDuration: "9s" }}
        />
        <div
          className={`absolute bottom-[-7rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[color-mix(in_oklab,var(--primary)_9%,transparent)] blur-3xl ${prefersReducedMotion ? "" : "animate-pulse"}`}
          style={{ animationDelay: "2.1s", animationDuration: "10s" }}
        />
        <div className="absolute inset-0 opacity-28 [background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_8%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_8%,transparent)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(circle_at_center,black_42%,transparent_100%)]" />
      </div>

      {/* Header Section */}
      <div className="w-full max-w-4xl px-4 sm:px-6 mb-6 sm:mb-8 md:mb-12 relative z-20">
        <div className="text-center flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-black dark:text-white leading-[1.1] mb-4 sm:mb-6 px-2"
          >
            {hero.title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < hero.title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-secondary text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light px-4 sm:px-6"
          >
            {hero.description}
          </motion.p>
        </div>
      </div>

      {/* 3D Carousel Section */}
      <div className="w-full max-w-[1400px] px-2 sm:px-4 md:px-4 py-4 sm:py-6 md:py-8 mb-4 sm:mb-6 md:mb-8 flex justify-center items-center h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] relative z-10">
        <Carousel3D
          key={contentVersion || "default"}
          images={cacheBustedCarouselImages}
          autoPlayInterval={2500}
        />
      </div>

      {/* Bottom CTA Section */}
      <div className="w-full max-w-4xl px-4 sm:px-6 mt-2 sm:mt-4 relative z-20">
        <div className="relative flex flex-col items-center justify-center pt-4 sm:pt-6 md:pt-8">
          <div className="relative">
            <Link href={hero.buttonLink}>
              <button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg z-20 relative group inline-flex items-center gap-2"
              >
                {hero.buttonText}
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>

            {/* Floating text and Arrow */}
            <div className="absolute left-full top-1/2 ml-4 -mt-2 w-48 hidden md:block pointer-events-none">
              <div className="relative">
                <span className="absolute -top-8 -left-2 text-secondary font-mono text-sm whitespace-nowrap">
                  We're hiring!
                </span>
                {/* Hand drawn arrow SVG */}
                <svg 
                  width="60" 
                  height="40" 
                  viewBox="0 0 100 80" 
                  fill="none" 
                  stroke="currentColor" 
                  className="text-secondary transform rotate-12 -ml-2 mt-1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Curved path pointing to button */}
                  <path 
                    d="M50 60 Q 20 60 10 30" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    fill="none"
                  />
                  {/* Arrowhead */}
                  <path 
                    d="M5 40 L 10 30 L 20 35" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Mobile version of the hint (simpler) */}
            <div className="md:hidden mt-4 text-secondary text-sm text-center">
              We're hiring!
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
