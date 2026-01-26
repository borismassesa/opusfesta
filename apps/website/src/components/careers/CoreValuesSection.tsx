"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { VALUES_DATA } from './types';
import CoreValuesHeroSection from './CoreValuesHeroSection';
import CoreValuesList from './CoreValuesList';

const AUTO_PLAY_INTERVAL = 3000;

const CoreValuesSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayTimerRef = useRef<number | null>(null);

  // Auto-play effect
  useEffect(() => {
    // Don't start if paused
    if (isPaused) {
      if (autoPlayTimerRef.current) {
        window.clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      return;
    }

    // Clear any existing timer
    if (autoPlayTimerRef.current) {
      window.clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }

    // Start auto-play timer
    autoPlayTimerRef.current = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % VALUES_DATA.length);
    }, AUTO_PLAY_INTERVAL);

    // Cleanup on unmount or when paused
    return () => {
      if (autoPlayTimerRef.current) {
        window.clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [isPaused]);

  const handleActiveIndexChange = (index: number) => {
    setActiveIndex(index);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveIndex(0);
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 relative bg-surface/20 dark:bg-surface/10">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent"></div>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="relative w-full min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Fixed/Static Hero Content */}
          <div 
            className="w-full md:w-1/2 min-h-[35vh] sm:min-h-[40vh] md:min-h-[70vh] border-b md:border-b-0 md:border-r border-border/50"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <CoreValuesHeroSection activeIndex={activeIndex} />
          </div>

          {/* Right Column: Dynamic Values List */}
          <div 
            className="w-full md:w-1/2 min-h-[35vh] sm:min-h-[40vh] md:min-h-[70vh]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <CoreValuesList 
              activeIndex={activeIndex} 
              isPaused={isPaused}
            />
          </div>
        </div>
      </div>

      {/* Bottom Right Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-10 h-10 md:w-12 md:h-12 bg-primary text-background rounded flex items-center justify-center shadow-lg transition-colors z-50 hover:bg-primary/90"
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </motion.button>
    </section>
  );
};

export default CoreValuesSection;
