"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ValueItem } from './types';

interface CoreValueItemRowProps {
  item: ValueItem;
  isActive: boolean;
  index: number;
  isPreview?: boolean;
}

const CoreValueItemRow: React.FC<CoreValueItemRowProps> = ({ item, isActive, index, isPreview = false }) => {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isActive ? 1 : isPreview ? 0.3 : 0.2,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.8 }}
      className={`${isPreview ? 'py-16 sm:py-20 md:py-24' : 'py-8 sm:py-10 md:py-12'} border-b border-border/50 flex items-start gap-6 sm:gap-8`}
    >
      <span className="text-sm sm:text-base font-medium text-primary/60 mt-2 tabular-nums min-w-8">
        0{index + 1}
      </span>
      <div className="flex flex-col gap-3 sm:gap-4 max-w-md">
        <h3 className={`${isPreview ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl' : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl'} font-medium tracking-tight text-primary`}>
          {item.title}
        </h3>
        {isActive && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 25, 
              mass: 0.8,
              delay: 0.15
            }}
            className="text-sm sm:text-base md:text-lg leading-relaxed font-light text-secondary"
          >
            {item.description}
          </motion.p>
        )}
        
        {isActive && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 25, 
              mass: 0.8,
              delay: 0.25
            }}
            className="h-px bg-primary/50 mt-4"
          />
        )}
      </div>
    </motion.div>
  );
};

export default CoreValueItemRow;
