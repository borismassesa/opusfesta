"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useContent } from "@/context/ContentContext";
import { resolveAssetSrc } from "@/lib/assets";
import { cn } from "@/lib/utils";
import { MotionPreset } from "@/components/ui/motion-preset";
import { MatterButton } from "@/components/ui/matter-button";

gsap.registerPlugin(ScrollTrigger);

export function CTA() {
  const { content } = useContent();
  const { cta } = content;
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-10 md:py-16 px-4 md:px-6 lg:px-10 bg-background flex justify-center">
      <div className="relative w-full max-w-7xl rounded-3xl md:rounded-[32px] overflow-hidden min-h-[360px] md:min-h-[480px] flex flex-col items-center justify-center text-center p-6 md:p-10 lg:p-14 shadow-xl">

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
              />
            </div>
          ) : null}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
          <MotionPreset component="h2" fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white mb-4 md:mb-6 leading-none md:leading-[0.95]">
            <span className="home-cta-headline-white">{cta?.headline || "Plan the wedding"}</span> <br />
            <span className="font-serif font-normal italic text-white/90">
              {cta?.subheadline || "of the century."}
            </span>
          </MotionPreset>

          <MotionPreset component="p" fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.3} className="text-sm sm:text-base md:text-lg text-zinc-200 max-w-2xl leading-relaxed mb-6 md:mb-8 font-light px-3">
            {cta?.description || "Join a community of modern couples who have elevated their planning experience. Sophisticated tools, curated vendors, and endless inspiration await."}
          </MotionPreset>

          <MotionPreset fade blur slide={{ direction: 'down', offset: 50 }} transition={{ duration: 0.7 }} delay={0.6} className="flex flex-row gap-3 sm:gap-4 items-center justify-center w-full sm:w-auto px-2 sm:px-0">
            <MatterButton asChild size="lg">
              <Link href={cta?.primaryButtonLink || "/signup"}>
                {cta?.primaryButtonText || "Get Started"}
                <ArrowUpRightIcon />
              </Link>
            </MatterButton>
            <Link
              href={cta?.secondaryButtonLink || "/demo"}
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium transition-all hover:bg-white/20 whitespace-nowrap"
            >
              {cta?.secondaryButtonText || "Live Demo"}
              <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </MotionPreset>

          <MotionPreset fade blur transition={{ duration: 0.7 }} delay={0.9} className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 opacity-60">
            <div className="text-[10px] sm:text-xs text-white uppercase tracking-widest font-medium">
              {cta?.trustIndicators?.couples || "Trusted by 50k+ Couples"}
            </div>
            <div className="text-[10px] sm:text-xs text-white uppercase tracking-widest font-medium">
              {cta?.trustIndicators?.rating || "4.9/5 Rating"}
            </div>
          </MotionPreset>
        </div>

      </div>
    </section>
  );
}
