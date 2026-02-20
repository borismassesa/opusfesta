"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";
import { CareersHero } from "@/components/careers/CareersHero";
import { CultureValues } from "@/components/careers/CultureValues";

gsap.registerPlugin(ScrollTrigger);

export function CareersClient() {
  const searchParams = useSearchParams();
  const isPreview = searchParams?.get("preview") === "draft";

  useEffect(() => {
    // Lenis Setup for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen selection:bg-accent/20 selection:text-primary overflow-hidden">
      <CareersNavbar />
      
      <main>
        <div id="hero-section">
          <CareersHero />
        </div>
        <CultureValues />
      </main>
      
      <CareersFooter />
    </div>
  );
}
