"use client"

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "react-i18next";
import { useContent } from "@/context/ContentContext";

gsap.registerPlugin(ScrollTrigger);

export function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { content } = useContent();
  const { stats, headline } = content.about;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate elements as they scroll into view
      const animElements = gsap.utils.toArray<HTMLElement>(".animate-on-scroll");
      
      animElements.forEach((el, index) => {
        gsap.fromTo(el, 
          { 
            y: 30, 
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none reverse"
            },
            delay: index * 0.1
          }
        );
      });

      // Line-by-line reveal for the main text
      const textLines = gsap.utils.toArray<HTMLElement>(".reveal-text");
      
      gsap.fromTo(textLines, 
        { 
          y: 50, 
          opacity: 0,
          filter: "blur(10px)",
          transformOrigin: "left top"
        },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".main-headline",
            start: "top 80%",
            end: "bottom 60%",
            scrub: 1
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []); // Depend on t to re-run animations on language change if needed, but might be jarring. 
  // Ideally, we just re-render. Animations might need reset if text length changes drastically.
  
  // To handle animation refresh on language change:
  useEffect(() => {
      ScrollTrigger.refresh();
  }, [t, headline]);

  // Use content headline if available, otherwise fallback to i18n
  const headlineText = headline || (() => {
    const headlineParts = t('about.headline', { returnObjects: true }) as Array<{ text: string, highlight?: boolean, italic?: boolean }>;
    return headlineParts.map(p => p.text).join(' ');
  })();

  return (
    <section ref={containerRef} className="relative w-full bg-surface pt-24 pb-16 lg:pt-48 lg:pb-36 overflow-hidden">
      
      <div className="flex flex-col md:px-10 w-full max-w-7xl border-primary/10 border-t mx-auto pt-24 pr-6 pb-12 pl-6 relative">
        
        {/* Standard Section Header */}
        <div className="flex justify-center md:justify-start mb-12 animate-on-scroll">
          <div className="flex items-center justify-center md:justify-start gap-3">
             <span className="w-12 h-px bg-accent"></span>
             <span className="font-mono text-accent text-xs tracking-widest uppercase">
               {t('about.title')}
             </span>
             <span className="md:hidden w-12 h-px bg-accent"></span>
          </div>
        </div>

        {/* Main Headline / Text Block */}
        <div className="relative main-headline">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[80%] bg-accent/10 blur-[120px] -z-10 rounded-full pointer-events-none"></div>

          <h3 className="leading-[1.1] text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-medium text-primary/40 tracking-tight max-w-6xl">
            {headlineText.split(" ").map((word, j) => (
              <span key={j} className="reveal-text inline-block mr-2 sm:mr-3">
                {word}
              </span>
            ))}
          </h3>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-12 gap-x-4 md:gap-x-8 mt-16 md:mt-24 pt-8 md:pt-12 border-t border-primary/10 animate-on-scroll">
          {/* Stat 1 */}
          <div className="flex flex-col gap-1 md:gap-2">
            <div className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-none font-light text-primary tracking-tighter">
              {stats.weddings?.value || "15k+"}
            </div>
            <div className="text-sm sm:text-base md:text-xl font-medium pl-1 text-secondary">
              {stats.weddings?.label || t('about.stats.weddings')}
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col gap-1 md:gap-2">
            <div className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-none font-light text-primary tracking-tighter">
              {stats.satisfaction?.value || "99%"}
            </div>
            <div className="text-sm sm:text-base md:text-xl font-medium pl-1 text-secondary">
              {stats.satisfaction?.label || t('about.stats.satisfaction')}
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col gap-1 md:gap-2">
            <div className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-none font-light text-primary tracking-tighter">
              {stats.guests?.value || "2M+"}
            </div>
            <div className="text-sm sm:text-base md:text-xl font-medium pl-1 text-secondary">
              {stats.guests?.label || t('about.stats.guests')}
            </div>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col gap-1 md:gap-2">
            <div className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-none font-light text-primary tracking-tighter">
              {stats.rating?.value || "4.9"}
            </div>
            <div className="text-sm sm:text-base md:text-xl font-medium pl-1 text-secondary">
              {stats.rating?.label || t('about.stats.rating')}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
