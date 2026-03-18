"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
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
      <div className="max-w-[1400px] mx-auto pt-24 pb-12 px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-end border-b border-border/50 pb-10">
          <div className="text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <span className="w-12 h-[1px] bg-accent"></span>
              <span className="font-mono text-accent text-xs tracking-widest uppercase">
                Planning Suite
              </span>
              <span className="md:hidden w-12 h-[1px] bg-accent"></span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
              Plan with visuals, <br />
              <span className="font-serif italic font-normal text-secondary">not walls of text.</span>
            </h2>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-5">
            <p className="text-secondary text-base md:text-lg max-w-md text-center md:text-right leading-relaxed font-light">
              Inspired by Zola, The Knot, WeddingWire, and Joy: cleaner cards, richer imagery, and faster scanning.
            </p>
            <div className="grid grid-cols-3 gap-3 w-full max-w-[330px]">
              {services.slice(0, 3).map((service) => (
                <div key={`teaser-${service.id}`} className="aspect-[4/5] overflow-hidden rounded-2xl border border-border/70">
                  <img
                    src={resolveAssetSrc(service.image)}
                    alt={service.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 relative">
        
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

        <div ref={rightColumnRef} className="flex flex-col pt-8 pb-4 lg:pt-0 lg:pb-24 px-6 lg:px-16 gap-12 lg:gap-20">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className="service-item min-h-[40vh] md:min-h-screen flex flex-col justify-center"
            >
              <article className="relative overflow-hidden rounded-[1.8rem] border border-border/70 bg-surface/60 p-6 sm:p-8">
                <div className="service-mobile-img md:hidden absolute inset-0">
                  <img
                    src={resolveAssetSrc(service.image)}
                    alt={service.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
                </div>
                <div className="absolute inset-y-0 right-0 hidden md:block w-[46%]">
                  <img
                    src={resolveAssetSrc(service.image)}
                    alt={service.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/50 to-transparent" />
                </div>

                <div className="relative z-10 max-w-md">
                  <p className="mb-3 text-[11px] uppercase tracking-[0.28em] text-secondary/80">
                    {String(index + 1).padStart(2, "0")} / {services.length}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-base md:text-lg text-secondary leading-relaxed line-clamp-2 mb-7">
                    {service.description}
                  </p>

                  <Link
                    href={service.link}
                    className="inline-flex rounded-full border border-foreground/20 bg-background/85 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
                  >
                    {service.ctaText}
                  </Link>
                </div>
              </article>
            </div>
          ))}
          
          <div className="h-0 md:h-[20vh]"></div>
        </div>

      </div>
    </section>
  );
}
