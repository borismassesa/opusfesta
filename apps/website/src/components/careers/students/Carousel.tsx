"use client";

import React, { useState, useEffect, useRef } from 'react';
import { PROFILES } from './constants';
import RulerControl from './RulerControl';

const Carousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PROFILES.length);
    }, 3500);
  };

  useEffect(() => {
    if (!isPaused) {
      startTimer();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const handleIndexChange = (newIndex: number) => {
    setActiveIndex(newIndex);
    // Restart timer to avoid immediate jump after manual click
    if (!isPaused) startTimer();
  };

  // Helper to determine styles based on position relative to active
  const getItemStyles = (index: number) => {
    const diff = index - activeIndex;
    
    // Base styles with smooth transition
    const baseTransition = "transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]";
    const absoluteCenter = "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-2xl";
    
    // Active Item (Center Rectangle)
    if (diff === 0) {
      return {
        className: `${absoluteCenter} z-30 w-[220px] h-[300px] sm:w-[260px] sm:h-[360px] md:w-[300px] md:h-[420px] opacity-100 rotate-0 ${baseTransition}`,
        imageClassName: "w-full h-full object-cover",
        containerStyle: {}
      };
    }
    
    // Immediate Neighbors (Rotated Diamonds)
    if (Math.abs(diff) === 1) {
      const isLeft = diff < 0;
      
      // Mobile: Close packing. Desktop: Spread out.
      const mobilePos = isLeft ? "left-[10%] sm:left-[15%]" : "left-[90%] sm:left-[85%]";
      const desktopPos = isLeft ? "md:left-[calc(50%-240px)]" : "md:left-[calc(50%+240px)]";

      return {
        className: `absolute top-1/2 ${mobilePos} ${desktopPos} transform -translate-x-1/2 -translate-y-1/2 z-20 w-[170px] h-[190px] sm:w-[210px] sm:h-[230px] md:w-[250px] md:h-[270px] opacity-100 ${isLeft ? '-rotate-12 scale-90' : 'rotate-12 scale-90'} ${baseTransition}`,
        imageClassName: "w-full h-full object-cover",
        containerStyle: {}
      };
    }

    // Far Neighbors (Hidden or Faded far sides)
    const isLeft = diff < 0;
    return {
      className: `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-[100px] h-[100px] opacity-0 ${isLeft ? '-translate-x-[300%] -rotate-45' : 'translate-x-[300%] rotate-45'} ${baseTransition}`,
      imageClassName: "w-full h-full object-cover",
      containerStyle: {}
    };
  };

  return (
    <div 
      className="w-full relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* Carousel Area */}
      <div className="relative h-[320px] sm:h-[380px] md:h-[460px] w-full max-w-6xl mx-auto overflow-hidden md:overflow-visible flex items-center justify-center px-4 -mt-6 sm:-mt-10">
        {PROFILES.map((profile, index) => {
          const { className, imageClassName } = getItemStyles(index);
          
          return (
            <div 
              key={profile.id} 
              className={`overflow-hidden bg-surface shadow-xl cursor-pointer ${className}`}
              onClick={() => handleIndexChange(index)}
            >
              <div className="w-full h-full relative">
                <img 
                  src={profile.image} 
                  alt={profile.name} 
                  className={imageClassName}
                  style={{ filter: profile.filter }}
                  draggable={false}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Controls */}
      <div className="text-center mt-1 mb-6 sm:mb-8 md:mb-10 relative z-40 px-4">
        <RulerControl 
          count={PROFILES.length} 
          activeIndex={activeIndex} 
          onChange={handleIndexChange} 
        />
        <div className="mt-3 sm:mt-4 min-h-[110px] sm:min-h-[130px] md:min-h-[160px] overflow-hidden relative">
          {/* Animated Content Transition */}
          {PROFILES.map((profile, index) => (
             <div 
                key={profile.id}
                className={`absolute w-full left-0 transition-all duration-500 ease-in-out transform ${
                  index === activeIndex 
                    ? 'top-0 opacity-100 translate-y-0' 
                    : index < activeIndex 
                      ? '-top-12 opacity-0 -translate-y-4' 
                      : 'top-12 opacity-0 translate-y-4'
                }`}
             >
                <h3 className="text-lg sm:text-xl font-medium tracking-wide text-primary font-sans mb-2">
                  {profile.name}
                </h3>
                {profile.role && (
                  <p className="text-xs sm:text-sm text-secondary font-light mb-2 sm:mb-3">
                    {profile.role}
                  </p>
                )}
                {profile.quote && (
                  <p className="text-sm sm:text-base text-secondary leading-relaxed font-light max-w-2xl mx-auto italic px-4 line-clamp-4 sm:line-clamp-5">
                    "{profile.quote}"
                  </p>
                )}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
