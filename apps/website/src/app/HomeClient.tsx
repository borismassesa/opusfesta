"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "@/components/layout/Navbar";
import { MenuOverlay } from "@/components/layout/MenuOverlay";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Marquee } from "@/components/home/Marquee";
import { Services } from "@/components/home/Services";
import { Issues } from "@/components/home/Issues";
import { Reviews } from "@/components/home/Reviews";
import { FAQ } from "@/components/home/FAQ";
import { Community } from "@/components/home/Community";
import { CTA } from "@/components/home/CTA";
import { Footer } from "@/components/layout/Footer";

gsap.registerPlugin(ScrollTrigger);

export function HomeClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const isPreview = searchParams?.get("preview") === "draft";

  useEffect(() => {
    // Skip loader animation in preview mode for faster loading
    if (isPreview) {
      if (loaderRef.current) {
        loaderRef.current.style.display = 'none';
      }
      return;
    }

    // Loader Animation
    const ctx = gsap.context(() => {
      const loadTl = gsap.timeline();
      
      // Select .loader-bar inside loaderRef
      loadTl.to('.loader-bar', { width: '100%', duration: 1.2, ease: "power2.inOut" })
            // Animate the loader container itself (using ref.current)
            .to(loaderRef.current, { yPercent: -100, duration: 0.8, ease: "expo.inOut" });
            
    }, loaderRef);

    // Lenis Setup
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
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, [isPreview]);

  return (
    <div className="bg-background text-primary min-h-screen selection:bg-accent/20 selection:text-primary overflow-hidden">
      {/* Loader - Hidden in preview mode */}
      {!isPreview && (
        <div ref={loaderRef} className="loader fixed top-0 left-0 w-full h-screen bg-background z-9999 flex flex-col justify-center items-center">
        <div className="font-serif text-4xl md:text-5xl text-primary mb-4 relative">
            OpusFesta
        </div>
        <div className="uppercase text-[10px] text-secondary tracking-[0.3em] font-medium mb-8 opacity-70">
          Gathering Inspiration
        </div>
        <div className="loader-bar-bg w-[200px] h-px bg-primary/10 relative overflow-hidden">
          <div className="loader-bar absolute left-0 top-0 h-full bg-primary w-0"></div>
        </div>
        </div>
      )}

      <Navbar isOpen={menuOpen} onMenuClick={() => setMenuOpen(!menuOpen)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main>
        <Hero />
        <About />
        {/* <Marquee /> */}
        <Services />
        <Community />
        <Issues />
        <Reviews />
        <FAQ />
        <CTA />
      </main>
      
      <Footer />
    </div>
  );
}
