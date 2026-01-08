"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useCareersContent } from "@/context/CareersContentContext";
import Carousel3D from './Carousel3D';

// Default slides - fallback if CMS has no images
const DEFAULT_SLIDES = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800&fit=crop&q=80", 
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop&q=80"
];

export function CareersHero() {
  const { content } = useCareersContent();
  const { hero } = content;
  
  // Use carousel images from CMS, or fallback to defaults
  const carouselImages = hero.carouselImages && hero.carouselImages.length > 0 
    ? hero.carouselImages.filter(img => img && img.trim() !== "")
    : DEFAULT_SLIDES;

  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-center py-20 bg-background text-primary selection:bg-primary selection:text-primary-foreground overflow-hidden">
      
      {/* Header Section */}
      <div className="w-full max-w-4xl px-6 mb-8 md:mb-12 relative z-20">
        <div className="text-center flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary leading-[1.1] mb-6"
          >
            {hero.title.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < hero.title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-secondary text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light"
          >
            {hero.description}
          </motion.p>
        </div>
      </div>

      {/* 3D Carousel Section */}
      <div className="w-full max-w-[1400px] px-0 md:px-4 py-8 mb-8 flex justify-center items-center h-[500px] md:h-[600px] relative z-10">
        <Carousel3D images={carouselImages} autoPlayInterval={2500} />
      </div>

      {/* Bottom CTA Section */}
      <div className="w-full max-w-4xl px-6 mt-4 relative z-20">
        <div className="relative flex flex-col items-center justify-center pt-8">
          <div className="relative">
            <Link href={hero.buttonLink}>
              <button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg z-20 relative group inline-flex items-center gap-2"
              >
                {hero.buttonText}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>

            {/* Floating text and Arrow */}
            <div className="absolute left-full top-1/2 ml-4 -mt-2 w-48 hidden md:block pointer-events-none">
              <div className="relative">
                <span className="absolute -top-8 -left-2 text-secondary font-mono text-sm whitespace-nowrap">
                  We're hiring!
                </span>
                {/* Hand drawn arrow SVG */}
                <svg 
                  width="60" 
                  height="40" 
                  viewBox="0 0 100 80" 
                  fill="none" 
                  stroke="currentColor" 
                  className="text-secondary transform rotate-12 -ml-2 mt-1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Curved path pointing to button */}
                  <path 
                    d="M50 60 Q 20 60 10 30" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    fill="none"
                  />
                  {/* Arrowhead */}
                  <path 
                    d="M5 40 L 10 30 L 20 35" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Mobile version of the hint (simpler) */}
            <div className="md:hidden mt-4 text-secondary text-sm text-center">
              We're hiring!
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
