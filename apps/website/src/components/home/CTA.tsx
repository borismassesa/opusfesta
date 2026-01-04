"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "@/context/ContentContext";
import { resolveAssetSrc } from "@/lib/assets";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function CTA() {
  const { content } = useContent();
  const { cta } = content;
  const containerRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Debug: Log CTA content changes
  useEffect(() => {
    const bgImage = cta?.backgroundImage;
    const resolved = bgImage ? resolveAssetSrc(bgImage) : null;
    console.log('[CTA Component] CTA content updated:', {
      hasBackgroundImage: !!bgImage,
      backgroundImage: bgImage,
      backgroundImageType: typeof bgImage,
      resolvedUrl: resolved,
      headline: cta?.headline,
      fullCta: cta,
    });
  }, [cta]);

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
      <div ref={cardRef} className="relative w-full max-w-[1400px] rounded-3xl md:rounded-4xl overflow-hidden min-h-[450px] md:min-h-[600px] flex flex-col items-center justify-center text-center p-6 md:p-12 lg:p-20 shadow-2xl">

        {/* Background Image with Overlay */}
        <div className={cn("absolute inset-0 z-0 overflow-hidden", !cta?.backgroundImage && "bg-zinc-900")}>
          {cta?.backgroundImage ? (
            <div className="absolute -top-[10%] left-0 w-full h-[120%]">
              <Image
                key={typeof cta.backgroundImage === 'string' ? cta.backgroundImage : 'static-bg'}
                src={resolveAssetSrc(cta.backgroundImage)}
                alt="Background"
                fill
                className="cta-bg-image object-cover opacity-80 mix-blend-overlay"
                sizes="100vw"
                onError={() => {
                  console.error("[CTA] Failed to load background image:", {
                    originalValue: cta.backgroundImage,
                    type: typeof cta.backgroundImage,
                  });
                }}
                onLoad={() => {
                  console.log("[CTA] Background image loaded successfully:", resolveAssetSrc(cta.backgroundImage));
                }}
              />
            </div>
          ) : null}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
           {/* Gradient Overlay for text readability */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">

          <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6 md:mb-8 leading-none md:leading-[0.9]">
            {cta?.headline || "Plan the wedding"} <br />
            <span className="font-serif font-normal italic text-white/90">
              {cta?.subheadline || "of the century."}
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-zinc-200 max-w-2xl leading-relaxed mb-8 md:mb-12 font-light px-4">
            {cta?.description || "Join a community of modern couples who have elevated their planning experience. Sophisticated tools, curated vendors, and endless inspiration await."}
          </p>

          <div className="flex flex-row gap-3 sm:gap-5 items-center justify-center w-full sm:w-auto cta-button-group px-4 sm:px-0">
            <Link
              href={cta?.primaryButtonLink || "/signup"}
              className="w-auto sm:w-auto group inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-white text-black font-semibold text-sm sm:text-base md:text-lg transition-all hover:bg-zinc-200 hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] whitespace-nowrap"
            >
              {cta?.primaryButtonText || "Get Started"}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={cta?.secondaryButtonLink || "/demo"}
              className="w-auto sm:w-auto group inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-white text-black font-semibold text-sm sm:text-base md:text-lg transition-all hover:bg-zinc-200 hover:scale-105 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] whitespace-nowrap"
            >
              {cta?.secondaryButtonText || "Live Demo"}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 opacity-60 cta-trust">
             {/* Simple Trust Indicators */}
             <div className="text-[10px] sm:text-xs text-white uppercase tracking-widest font-medium">
               {cta?.trustIndicators?.couples || "Trusted by 50k+ Couples"}
             </div>
             <div className="text-[10px] sm:text-xs text-white uppercase tracking-widest font-medium">
               {cta?.trustIndicators?.rating || "4.9/5 Rating"}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
