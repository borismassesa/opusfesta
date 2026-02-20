"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resolveAssetSrc } from "@/lib/assets";
import { useContent } from "@/context/ContentContext";

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
        // Desktop & Tablet
        "(min-width: 768px)": function() {
          ScrollTrigger.create({
            trigger: containerRef.current,
            start: "top top",
            end: "bottom bottom",
            pin: ".service-visual",
            scrub: true,
          });
          
          // Detect active section for image swapping
          sections.forEach((section, i) => {
            ScrollTrigger.create({
              trigger: section,
              start: "top center",
              end: "bottom center",
              onToggle: (self) => {
                if (self.isActive) {
                  setActiveIndex(i);
                }
              }
            });
          });
          sections.forEach((section) => {
            const content = section.querySelectorAll("h3, p, a, .service-mobile-img");

            gsap.set(content, { clearProps: "transform,opacity,visibility" });

            gsap.fromTo(
              content,
              { y: 50, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: section,
                  start: "top 85%",
                  end: "top 50%",
                  scrub: 1,
                  toggleActions: "play none none reverse"
                }
              }
            );
          });
        },
        // Mobile
        "(max-width: 767px)": function() {
          sections.forEach((section) => {
            const content = section.querySelectorAll("h3, p, a, .service-mobile-img");

            gsap.set(content, { y: 32, autoAlpha: 0 });

            gsap.to(content, {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              stagger: 0.12,
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
    <section id="services" className="relative w-full bg-background border-b border-border">
      
      {/* Intro Header */}
      <div className="max-w-[1400px] mx-auto pt-24 pb-12 px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-end border-b border-border/50 pb-12">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <span className="w-12 h-[1px] bg-accent"></span>
              <span className="font-mono text-accent text-xs tracking-widest uppercase">
                Our Services
              </span>
              <span className="md:hidden w-12 h-[1px] bg-accent"></span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
              Everything you need, <br />
              <span className="font-serif italic font-normal text-secondary">all in one place.</span>
            </h2>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-6">
            <p className="text-secondary text-base md:text-lg max-w-md text-center md:text-right leading-relaxed font-light">
              From venue hunting to day-of coordination, access the essential tools and curated connections to bring your unique vision to life effortlessly.
            </p>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 relative">
        
        {/* Left Column - Sticky Visual (Desktop Only) */}
        <div className="service-visual hidden md:flex h-screen sticky top-0 flex-col justify-center items-center p-6 lg:p-12 overflow-hidden bg-background">
          <div className="relative w-full aspect-[4/3] lg:aspect-square max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-border">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img
                  src={resolveAssetSrc(service.image)}
                  alt={service.title}
                  className="w-full h-full object-cover transform scale-105"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            ))}
            
            {/* Progress Indicator */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-2 z-20">
               {services.map((_, idx) => (
                 <div 
                   key={idx}
                   className={`h-1 rounded-full transition-all duration-300 ${
                     idx === activeIndex ? "w-8 bg-white" : "w-2 bg-white/40"
                   }`}
                 />
               ))}
            </div>
          </div>
        </div>

        {/* Right Column - Scrolling Content */}
        <div ref={rightColumnRef} className="flex flex-col pt-12 pb-4 lg:pt-0 lg:pb-24 px-6 lg:px-16 gap-16 lg:gap-24">
          {/* Service Items */}
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className="service-item min-h-[40vh] md:min-h-screen flex flex-col justify-center"
            >
              {/* Mobile Image */}
              <div className="service-mobile-img md:hidden w-full aspect-video rounded-xl overflow-hidden mb-6 shadow-lg">
                <img 
                  src={resolveAssetSrc(service.image)} 
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                {service.title}
              </h3>
              <p className="text-lg text-secondary leading-relaxed max-w-md mb-8">
                {service.description}
              </p>
              
              <Link
                href={service.link}
                className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors group"
              >
                <span className="border-b border-primary/30 pb-0.5 group-hover:border-accent">
                  {service.ctaText}
                </span>
                <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
          
          {/* Bottom Spacer to allow last item to scroll fully */}
          <div className="h-0 md:h-[20vh]"></div>
        </div>

      </div>
    </section>
  );
}
