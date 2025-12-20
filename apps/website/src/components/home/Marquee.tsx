"use client"

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { Cpu, Palette, Globe, FlaskConical, Briefcase } from "lucide-react";

export function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".marquee-track", {
        xPercent: -50,
        repeat: -1,
        duration: 20,
        ease: "linear"
      });
    }, trackRef);

    return () => ctx.revert();
  }, []);

  const items = [
    { icon: Cpu, label: "Technology" },
    { icon: Palette, label: "Design" },
    { icon: Globe, label: "Culture" },
    { icon: FlaskConical, label: "Science" },
    { icon: Briefcase, label: "Venture" }
  ];

  // Duplicate items for seamless loop
  const allItems = [...items, ...items, ...items, ...items];

  return (
    <section ref={trackRef} className="py-10 border-b border-border bg-background marquee-container overflow-hidden relative z-30">
      
      {/* Gradient Masks for smooth fade */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

      <div className="marquee-track flex gap-16 whitespace-nowrap w-fit pl-4">
        {allItems.map((item, i) => (
          <div key={i} className="flex gap-16 items-center text-lg md:text-xl font-medium text-secondary hover:text-primary transition-colors duration-300 cursor-default">
            <span className="flex items-center gap-3">
              <item.icon size={20} className="opacity-70" />
              {item.label}
            </span>
            <span className="text-border text-2xl font-light opacity-50 select-none">/</span>
          </div>
        ))}
      </div>
    </section>
  );
}
