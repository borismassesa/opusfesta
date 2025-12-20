"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ctaBg from "@assets/stock_images/luxury_dark_elegant__ca7749ec.jpg";
import { resolveAssetSrc } from "@/lib/assets";

gsap.registerPlugin(ScrollTrigger);

export function CTA() {
  const containerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax effect for the background image
      gsap.to(".cta-bg-image", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      // Reveal animation
      gsap.fromTo(cardRef.current,
        { y: 150, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%"
          }
        }
      );

      // Staggered Text Reveal
      const elements = cardRef.current?.querySelectorAll("h2, p, .cta-button-group, .cta-trust");
      if (elements) {
        gsap.fromTo(elements,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            delay: 0.4, 
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 85%"
            }
          }
        );
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-12 md:py-24 px-4 md:px-6 lg:px-12 bg-background flex justify-center">
      <div ref={cardRef} className="relative w-full max-w-[1400px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden min-h-[450px] md:min-h-[600px] flex flex-col items-center justify-center text-center p-6 md:p-12 lg:p-20 shadow-2xl">

        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0 bg-zinc-900">
          <img
            src={resolveAssetSrc(ctaBg)}
            alt="Background"
            className="cta-bg-image w-full h-[120%] object-cover -mt-[10%] opacity-80 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
           {/* Gradient Overlay for text readability */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">

          <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6 md:mb-8 leading-[1.0] md:leading-[0.9]">
            Plan the wedding <br />
            <span className="font-serif font-normal italic text-white/90">of the century.</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-zinc-200 max-w-2xl leading-relaxed mb-8 md:mb-12 font-light px-4">
            Join a community of modern couples who have elevated their planning experience.
            Sophisticated tools, curated vendors, and endless inspiration await.
          </p>

          <div className="flex flex-row gap-3 sm:gap-5 items-center justify-center w-full sm:w-auto cta-button-group px-4 sm:px-0">
            <Link
              href="/signup"
              className="w-auto sm:w-auto group inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-white text-black font-semibold text-sm sm:text-base md:text-lg transition-all hover:bg-zinc-200 hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] whitespace-nowrap"
            >
              Get Started
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demo"
              className="w-auto sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-transparent border border-white/30 text-white font-medium text-sm sm:text-base md:text-lg transition-all hover:bg-white/10 backdrop-blur-sm whitespace-nowrap"
            >
              Live Demo
            </Link>
          </div>
          
          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 opacity-60 cta-trust">
             {/* Simple Trust Indicators */}
             <div className="text-[10px] sm:text-xs text-white uppercase tracking-widest font-medium">Trusted by 50k+ Couples</div>
             <div className="text-[10px] sm:text-xs text-white uppercase tracking-widest font-medium">4.9/5 Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}
