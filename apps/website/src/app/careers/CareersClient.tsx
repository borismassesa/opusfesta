"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CareersNavbar } from "@/components/careers/CareersNavbar";
import { CareersFooter } from "@/components/careers/CareersFooter";
import { CareersHero } from "@/components/careers/CareersHero";
import { CultureValues } from "@/components/careers/CultureValues";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

function StickyCTA() {
  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 px-4 w-full max-w-[calc(100%-2rem)] sm:max-w-none">
      <Link
        href="/careers/positions"
        className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium hover:bg-primary/90 transition-colors shadow-lg w-full sm:w-auto"
      >
        <span className="sm:hidden">Openings</span>
        <span className="hidden sm:inline">Browse openings</span>
        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
      </Link>
    </div>
  );
}

export function CareersClient() {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
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

    // Sticky CTA visibility
    const handleScroll = () => {
      const heroSection = document.getElementById("hero-section");
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        setShowStickyCTA(window.scrollY > heroBottom - 100);
      }
    };

    lenis.on('scroll', handleScroll);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <div className="bg-background text-primary min-h-screen selection:bg-accent/20 selection:text-primary overflow-hidden">
      <CareersNavbar />
      
      <main>
        <div id="hero-section">
          <CareersHero />
        </div>
        <CultureValues />
      </main>
      
      <CareersFooter />
      {showStickyCTA && <StickyCTA />}
    </div>
  );
}
