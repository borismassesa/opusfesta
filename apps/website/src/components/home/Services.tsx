"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resolveAssetSrc } from "@/lib/assets";
import { useContent } from "@/context/ContentContext";
import { MotionPreset } from "@/components/ui/motion-preset";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { MatterButton } from "@/components/ui/matter-button";

gsap.registerPlugin(ScrollTrigger);

export function Services() {
  const { content } = useContent();
  const services = content.services;
  const containerRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>(".service-item");

      ScrollTrigger.matchMedia({
        "(min-width: 768px)": function() {
          ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            pin: ".service-visual",
            scrub: true,
          });

          sections.forEach((section, i) => {
            ScrollTrigger.create({
              trigger: section,
              start: "top center",
              end: "bottom center",
              onToggle: (self) => {
                if (self.isActive) setActiveIndex(i);
              }
            });
          });
        },
        "(max-width: 767px)": function() {
          sections.forEach((section) => {
            const imgs = section.querySelectorAll(".service-mobile-img");
            gsap.set(imgs, { y: 32, autoAlpha: 0 });
            gsap.to(imgs, {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 85%",
                toggleActions: "play none none reverse"
              }
            });
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="services" className="relative w-full bg-background">

      <div className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-end border-b border-border/50 pb-12">
          <div className="text-center md:text-left">
            <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} className="mb-6">
              <TextShimmer className="text-sm font-medium uppercase" duration={1.75}>
                Our Services
              </TextShimmer>
            </MotionPreset>
            <MotionPreset component="h2" fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.3} className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
              Everything you need, <br />
              <span className="font-serif italic font-normal text-primary">all in one place.</span>
            </MotionPreset>
          </div>
          <div className="flex flex-col items-center md:items-end gap-6">
            <MotionPreset component="p" fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.3} className="text-secondary text-base md:text-lg max-w-md text-center md:text-right leading-relaxed font-light">
              From venue hunting to day-of coordination, access the essential tools and curated connections to bring your unique vision to life effortlessly.
            </MotionPreset>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 relative px-4 sm:px-6 lg:px-0">

        {/* Left Column — Sticky Visual */}
        <div className="service-visual hidden md:flex h-screen sticky top-0 flex-col justify-center items-center p-6 lg:p-12 overflow-hidden bg-background">
          <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-border">
            {services.map((service, index) => (
              <div key={service.id} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
                <img src={resolveAssetSrc(service.image)} alt={service.title} className="w-full h-full object-cover transform scale-105" />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            ))}
            <div className="absolute bottom-6 left-6 right-6 flex gap-2 z-20">
              {services.map((_, idx) => (
                <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === activeIndex ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Scrolling Content */}
        <div ref={rightColumnRef} className="flex flex-col pt-12 pb-4 lg:pt-0 lg:pb-24 px-0 lg:px-16 gap-16 lg:gap-24">
          {services.map((service) => (
            <div key={service.id} className="service-item min-h-[40vh] md:min-h-screen flex flex-col justify-center">
              <div className="service-mobile-img md:hidden w-full aspect-video rounded-xl overflow-hidden mb-6 shadow-lg">
                <img src={resolveAssetSrc(service.image)} alt={service.title} className="w-full h-full object-cover" />
              </div>
              <MotionPreset component="h3" fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                {service.title}
              </MotionPreset>
              <MotionPreset component="p" fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.2} className="text-lg text-secondary leading-relaxed max-w-md mb-8">
                {service.description}
              </MotionPreset>
              <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.3}>
                <MatterButton asChild size="lg">
                  <Link href={service.link}>
                    {service.ctaText}
                    <ArrowUpRightIcon />
                  </Link>
                </MatterButton>
              </MotionPreset>
            </div>
          ))}
          <div className="h-0 md:h-[20vh]" />
        </div>

      </div>
    </section>
  );
}
