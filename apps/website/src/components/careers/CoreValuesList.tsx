"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VALUES_DATA } from './types';
import CoreValueItemRow from './CoreValueItemRow';

interface CoreValuesListProps {
  activeIndex: number;
  isPaused: boolean;
}

const CoreValuesList: React.FC<CoreValuesListProps> = ({ activeIndex, isPaused }) => {
  // Show current item and next 2 items for preview
  const visibleItems = [];
  for (let i = 0; i < 3; i++) {
    const index = (activeIndex + i) % VALUES_DATA.length;
    visibleItems.push({ ...VALUES_DATA[index], originalIndex: index });
  }

  return (
    <div className="h-full flex flex-col justify-center px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      {/* Gradient fade at top to suggest items coming from above */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-background via-background/80 to-transparent z-10 pointer-events-none" />
      
      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background via-background/80 to-transparent z-10 pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center">
        <AnimatePresence mode="popLayout">
          {visibleItems.map((item, displayIndex) => {
            const isActive = displayIndex === 0;
            const originalIndex = item.originalIndex;
            
            // Calculate y position: active item at center (0), preview items offset
            const yOffset = displayIndex === 0 ? 0 : displayIndex === 1 ? 160 : -160;
            
            return (
              <motion.div
                key={`${item.id}-${activeIndex}`}
                initial={{ 
                  opacity: 0, 
                  y: isActive ? 80 : (displayIndex === 1 ? yOffset + 80 : yOffset - 80),
                  scale: 0.95
                }}
                animate={{ 
                  opacity: isActive ? 1 : 0.3,
                  y: yOffset,
                  scale: isActive ? 1 : 0.85,
                }}
                exit={{ 
                  opacity: 0, 
                  y: isActive ? -80 : (displayIndex === 1 ? yOffset + 80 : yOffset - 80),
                  scale: 0.95
                }}
                transition={{ 
                  type: "tween",
                  ease: [0.25, 0.1, 0.25, 1],
                  duration: 0.6
                }}
                style={{ 
                  zIndex: 3 - displayIndex,
                  position: 'absolute',
                  width: '100%'
                }}
                className="relative"
              >
                <CoreValueItemRow 
                  item={item} 
                  isActive={isActive} 
                  index={originalIndex}
                  isPreview={displayIndex > 0}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CoreValuesList;
