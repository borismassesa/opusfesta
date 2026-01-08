"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Carousel3DProps {
  images: string[];
  autoPlayInterval?: number;
}

const Carousel3D: React.FC<Carousel3DProps> = ({ images, autoPlayInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [images.length, autoPlayInterval]);

  // Calculate the position of an image relative to the current index
  // Returns: 0 (center), 1 (right), -1 (left), 2 (far right), -2 (far left), etc.
  const getRelativePosition = (index: number) => {
    const total = images.length;
    let diff = (index - currentIndex + total) % total;
    // Adjust diff to be within -total/2 to +total/2 range for shortest path
    if (diff > total / 2) diff -= total;
    return diff;
  };

  // Determines the visual state based on relative position
  const getVariantState = (diff: number) => {
    if (diff === 0) return 'center';
    if (diff === 1) return 'right';
    if (diff === -1) return 'left';
    if (diff === 2) return 'farRight';
    if (diff === -2) return 'farLeft';
    if (diff > 2) return 'hiddenRight';
    if (diff < -2) return 'hiddenLeft';
    return 'hiddenRight'; // Fallback
  };

  const variants = {
    center: { 
      x: "0%", 
      scale: 1, 
      rotateY: 0, 
      zIndex: 20, 
      opacity: 1, 
      filter: "brightness(1) blur(0px)",
    },
    left: { 
      x: "-55%", 
      scale: 0.85, 
      rotateY: 25, 
      zIndex: 10, 
      opacity: 0.8, 
      filter: "brightness(0.8) blur(1px)",
    },
    right: { 
      x: "55%", 
      scale: 0.85, 
      rotateY: -25, 
      zIndex: 10, 
      opacity: 0.8, 
      filter: "brightness(0.8) blur(1px)",
    },
    farLeft: { 
      x: "-100%", 
      scale: 0.7, 
      rotateY: 45, 
      zIndex: 5, 
      opacity: 0.5, 
      filter: "brightness(0.6) blur(2px)",
    },
    farRight: { 
      x: "100%", 
      scale: 0.7, 
      rotateY: -45, 
      zIndex: 5, 
      opacity: 0.5, 
      filter: "brightness(0.6) blur(2px)",
    },
    hiddenLeft: { 
      x: "-150%", 
      scale: 0.5, 
      rotateY: 60, 
      zIndex: 0, 
      opacity: 0, 
      filter: "brightness(0.5) blur(5px)",
    },
    hiddenRight: { 
      x: "150%", 
      scale: 0.5, 
      rotateY: -60, 
      zIndex: 0, 
      opacity: 0, 
      filter: "brightness(0.5) blur(5px)",
    }
  };

  return (
    <div className="relative w-full h-full flex justify-center items-center overflow-visible">
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        {images.map((img, index) => {
          const diff = getRelativePosition(index);
          const variant = getVariantState(diff);

          // We only render items that are within a reasonable range to keep DOM light,
          // but enough to allow smooth entrances from "hidden" states.
          // Range: -3 to 3 ensures smooth transition from hiddenLeft/Right to farLeft/Right.
          const isVisible = Math.abs(diff) <= 3; 

          if (!isVisible) return null;

          return (
            <motion.div
              key={index}
              variants={variants}
              initial="hiddenRight"
              animate={variant}
              transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }} // Smooth cubic-bezier
              className="absolute w-[260px] md:w-[350px] aspect-[3/4] rounded-2xl bg-surface border border-border cursor-pointer overflow-hidden shadow-lg"
              style={{ 
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
              onClick={() => setCurrentIndex(index)}
            >
              <img 
                src={img} 
                alt={`Slide ${index}`} 
                className="w-full h-full object-cover pointer-events-none"
              />
              
              {/* Optional: Glossy overlay for depth - theme aware */}
              <div className="absolute inset-0 bg-gradient-to-tr from-background/10 to-transparent opacity-30 rounded-2xl pointer-events-none" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Carousel3D;
