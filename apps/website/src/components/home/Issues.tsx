"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resolveAssetSrc } from "@/lib/assets";
import { useContent } from "@/context/ContentContext";

gsap.registerPlugin(ScrollTrigger);

export function Issues() {
  const { content } = useContent();
  // Use advice articles if available, otherwise fall back to issues
  const adviceArticles = content.advice?.articles || [];
  const issues = adviceArticles.length > 0 
    ? adviceArticles.map((article, index) => ({
        id: index + 1,
        title: article.title,
        desc: article.description,
        img: article.image
      }))
    : content.issues;
  const containerRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      const headerContent = containerRef.current?.querySelectorAll(".editorial-header > div, .editorial-header p, .editorial-header a");
      if (headerContent) {
        gsap.fromTo(headerContent,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".editorial-header",
              start: "top 80%",
            }
          }
        );
      }

      ScrollTrigger.matchMedia({
        "(max-width: 767px)": function() {
          const mobileCards = containerRef.current?.querySelectorAll<HTMLElement>(".mobile-issue-card");
          if (!mobileCards) return;

          mobileCards.forEach((card) => {
            gsap.set(card, { y: 32, autoAlpha: 0 });
            gsap.to(card, {
              y: 0,
              autoAlpha: 1,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse"
              }
            });
          });
        },
        "(min-width: 768px)": function() {
          const wrapper = wrapperRef.current;
          const container = containerRef.current;
          if (!wrapper || !container) return;

          const getScrollAmount = () => -(wrapper.scrollWidth - container.offsetWidth);
          
          gsap.to(wrapper, {
            x: getScrollAmount,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              pin: true,
              scrub: 1,
              end: () => `+=${wrapper.scrollWidth - container.offsetWidth}`,
              invalidateOnRefresh: true
            }
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative w-full"> 
      <section ref={containerRef} id="advice-ideas" className="bg-surface text-foreground min-h-screen pt-20 pb-12 md:py-24 overflow-hidden relative border-b border-border flex flex-col justify-center">
        <div className="editorial-header max-w-[1400px] mx-auto px-6 lg:px-12 mb-8 md:mb-12 w-full shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-end border-b border-border/50 pb-8 md:pb-12">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4 md:mb-6">
                <span className="w-12 h-px bg-accent"></span>
                <span className="font-mono text-accent text-xs tracking-widest uppercase">
                  {content.advice?.label || "Advice & Ideas"}
                </span>
                <span className="md:hidden w-12 h-px bg-accent"></span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.1]">
                {content.advice?.headline || "Inspiration for"} <br />
                <span className="font-serif italic font-normal text-secondary">
                  {content.advice?.subheadline || "your big day."}
                </span>
              </h2>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6">
              <p className="text-secondary text-base md:text-lg max-w-md text-center md:text-right leading-relaxed font-light line-clamp-3">
                {content.advice?.description || "Expert guides, trending styles, and real wedding stories to help you plan a celebration that's uniquely yours."}
              </p>
              <Link
                href={content.advice?.buttonLink || "/services/advice"}
                className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-background text-sm font-medium transition-all hover:bg-primary/90"
              >
                {content.advice?.buttonText || "Browse All Articles"}
              </Link>
            </div>
          </div>
        </div>

        <div className="mobile-issues-grid w-full md:hidden px-6 pb-12 flex flex-col gap-6">
           {issues.map((issue) => (
              <div key={issue.id} className="mobile-issue-card w-full aspect-[4/5] relative group cursor-pointer overflow-hidden rounded-2xl border border-border">
                  <Image 
                    src={resolveAssetSrc(issue.img)} 
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt={issue.title}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/70 mb-2">Trend Story</p>
                    <h3 className="text-2xl font-semibold tracking-tight mb-2">{issue.title}</h3>
                    <p className="text-zinc-200/90 text-sm line-clamp-2">{issue.desc}</p>
                  </div>
              </div>
           ))}
        </div>

        <div className="hidden md:flex horizontal-scroll-container w-full overflow-visible no-scrollbar grow items-center">
          <div ref={wrapperRef} className="horizontal-wrapper flex gap-[4vw] px-[5vw] w-fit items-center h-full">
            {issues.map((issue) => (
              <article key={issue.id} className="w-[30vw] min-w-[340px] h-[50vh] lg:h-[56vh] relative shrink-0 group cursor-pointer">
                <div className="absolute inset-0 bg-background rounded-[1.8rem] overflow-hidden border border-border">
                  <Image 
                    src={resolveAssetSrc(issue.img)} 
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                    alt={issue.title}
                    sizes="30vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 dark:to-black/90"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/70 mb-3">Curated Guide</p>
                    <h3 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-2">
                      {issue.title}
                    </h3>
                    <p className="text-sm text-zinc-200 line-clamp-2 leading-relaxed max-w-sm">
                      {issue.desc}
                    </p>
                  </div>
                </div>
              </article>
            ))}
            
          </div>
        </div>

      </section>
    </div>
  );
}
