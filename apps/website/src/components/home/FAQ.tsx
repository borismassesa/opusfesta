"use client"

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useContent } from "@/context/ContentContext";

gsap.registerPlugin(ScrollTrigger);

export function FAQ() {
  const { content } = useContent();
  const faqs = content.faqs;
  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const accordionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Header Animation - Slide Up and Fade In
      gsap.fromTo(headerRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          }
        }
      );

      // Accordion Items Animation - Staggered Slide In
      if (accordionRef.current) {
        const items = accordionRef.current.querySelectorAll('.accordion-item-reveal');
        
        gsap.fromTo(items,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: accordionRef.current,
              start: "top 75%",
            }
          }
        );
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 lg:py-32 bg-background border-b border-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start">
        
        {/* Left Column: Header */}
        <div ref={headerRef} className="sticky top-32 opacity-0 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
            <span className="w-12 h-[1px] bg-accent"></span>
            <span className="font-mono text-accent text-xs tracking-widest uppercase">
              Common Questions
            </span>
            <span className="md:hidden w-12 h-[1px] bg-accent"></span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-primary leading-[1.1] mb-6">
            Got questions? <br/>
            <span className="font-serif italic font-normal text-secondary">We have answers.</span>
          </h2>
          <p className="text-secondary text-lg leading-relaxed max-w-md mx-auto md:mx-0 font-light">
            Everything you need to know about planning your perfect celebration with TheFesta.
          </p>
        </div>

        {/* Right Column: Accordion */}
        <div ref={accordionRef} className="w-full">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border/60 accordion-item-reveal opacity-0">
                <AccordionTrigger className="text-lg md:text-xl py-6 font-medium text-primary hover:text-accent transition-colors hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-secondary text-base leading-relaxed pb-6 max-w-xl font-light">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>
    </section>
  );
}
