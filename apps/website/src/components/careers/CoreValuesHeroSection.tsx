"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { HERO_VERBS, VALUES_DATA } from './types';

interface CoreValuesHeroSectionProps {
  activeIndex: number;
}

const CoreValuesHeroSection: React.FC<CoreValuesHeroSectionProps> = ({ activeIndex }) => {
  // Directly use the activeIndex for 1:1 mapping with the right side items
  const currentVerbIndex = activeIndex % HERO_VERBS.length;
  const progress = (activeIndex + 1) / VALUES_DATA.length;

  return (
    <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 lg:px-12">
      <div className="relative flex flex-col items-start max-w-2xl">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs sm:text-sm md:text-base font-medium text-secondary/70 mb-4 sm:mb-6 md:mb-8 tracking-wider uppercase"
        >
          Core Values & Ethos
        </motion.h2>
        
        <div className="relative flex flex-col items-start select-none w-full">
          {/* Row 1: Preview verb above (static background) */}
          <div className="w-full py-2 sm:py-3 md:py-4 lg:py-6">
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-medium tracking-tight text-secondary/30 leading-none">
              {HERO_VERBS[(currentVerbIndex - 1 + HERO_VERBS.length) % HERO_VERBS.length]}.
            </span>
          </div>

          {/* Row 2: Main line - "We are" + active verb (this changes) */}
          <div className="w-full py-2 sm:py-3 md:py-4 lg:py-6 flex flex-col sm:flex-row items-start sm:items-baseline gap-3 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 overflow-visible">
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-semibold tracking-normal text-primary leading-normal shrink-0 whitespace-nowrap">
              We are
            </span>
            <div className="relative flex-1 min-w-0 w-full sm:w-auto overflow-visible" style={{ minHeight: '1.2em' }}>
              <AnimatePresence mode="sync" initial={false}>
                <motion.span
                  key={`${activeIndex}-${HERO_VERBS[currentVerbIndex]}`}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -60, opacity: 0 }}
                  transition={{ 
                    type: "tween",
                    ease: [0.25, 0.1, 0.25, 1],
                    duration: 0.6
                  }}
                  className="inline-block text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-semibold tracking-normal text-primary leading-normal"
                >
                  {HERO_VERBS[currentVerbIndex]}.
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Row 3: Preview verb below (static background) */}
          <div className="w-full py-2 sm:py-3 md:py-4 lg:py-6">
            <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-medium tracking-tight text-secondary/30 leading-none">
              {HERO_VERBS[(currentVerbIndex + 1) % HERO_VERBS.length]}.
            </span>
          </div>
        </div>

        <motion.div 
          className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 xl:mt-28 group flex items-center gap-3 sm:gap-4 md:gap-6 cursor-pointer"
          whileHover="hover"
        >
          <motion.div 
            variants={{
              hover: { x: 5, scale: 1.05 }
            }}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full border border-primary/50 flex items-center justify-center transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-background"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs md:text-sm font-medium tracking-wider uppercase text-primary/80 group-hover:text-primary transition-colors">Explore our legacy</span>
            <div className="h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CoreValuesHeroSection;
