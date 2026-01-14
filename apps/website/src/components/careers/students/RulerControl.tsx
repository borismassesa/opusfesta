"use client";

import React, { useRef, useEffect } from 'react';
import { RulerProps } from './types';

const RulerControl: React.FC<RulerProps> = ({ count, activeIndex, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll current item into view if we were doing a scrollable container, 
  // but for this specific "centered ruler" look, we might just render a static set around the center 
  // or simple clickable lines.
  
  // Based on the design, it looks like a centered static control where ticks represent indices.
  // We will generate a visual representation that feels like a physical slider.

  return (
    <div className="flex flex-col items-center justify-center mt-8 sm:mt-12 md:mt-20">
      <div className="relative h-10 sm:h-12 flex items-end gap-[4px] sm:gap-[6px] md:gap-[10px] select-none">
        {Array.from({ length: count }).map((_, i) => {
          const isActive = i === activeIndex;
          const isNear = Math.abs(i - activeIndex) === 1;
          const isFar = Math.abs(i - activeIndex) === 2;
          
          // Calculate height based on distance from active
          let heightClass = "h-2 sm:h-3";
          let colorClass = "bg-secondary/30 dark:bg-secondary/40";
          let widthClass = "w-[1px]";

          if (isActive) {
            heightClass = "h-6 sm:h-8";
            colorClass = "bg-primary dark:bg-primary";
            widthClass = "w-[1.5px]";
          } else if (isNear) {
            heightClass = "h-4 sm:h-5";
            colorClass = "bg-secondary/50 dark:bg-secondary/60";
          } else if (isFar) {
            heightClass = "h-3 sm:h-4";
            colorClass = "bg-secondary/30 dark:bg-secondary/40";
          }

          return (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={`flex items-end justify-center transition-all duration-300 hover:h-5 sm:hover:h-6 group relative p-1.5 sm:p-2 -m-1.5 sm:-m-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm`}
              aria-label={`Go to slide ${i + 1}`}
            >
             <div 
               className={`rounded-full transition-all duration-300 ${heightClass} ${colorClass} ${widthClass}`}
             />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RulerControl;
