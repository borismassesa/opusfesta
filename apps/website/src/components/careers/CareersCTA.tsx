"use client";

import React from 'react';
import Link from 'next/link';
import { useCareersContent } from "@/context/CareersContentContext";

const CareersCTA: React.FC = () => {
  const { content } = useCareersContent();
  const { hero } = content;

  return (
    <div className="relative flex flex-col items-center justify-center pt-8 pb-16">
      <div className="relative">
        <Link href={hero.buttonLink || "/careers/positions"}>
          <button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg z-20 relative"
          >
            See all open positions
          </button>
        </Link>

        {/* Floating element */}
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
              <path 
                d="M50 60 Q 20 60 10 30" 
                strokeWidth="2" 
                strokeLinecap="round" 
                fill="none"
              />
              <path 
                d="M5 40 L 10 30 L 20 35" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
      <p className="mt-6 text-sm text-secondary">
        Don't see your role? <a href="mailto:careers@opusfesta.com" className="underline hover:text-primary transition-colors">Email us</a>.
      </p>
    </div>
  );
};

export default CareersCTA;
