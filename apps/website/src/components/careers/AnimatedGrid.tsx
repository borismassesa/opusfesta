"use client";

import React from 'react';

// Using picsum photos to get high-quality random images. 
// We use different IDs/Seeds to ensure variety.
const generateImages = (seedPrefix: string, count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${seedPrefix}-${i}`,
    url: `https://picsum.photos/seed/${seedPrefix}${i}/500/350`,
    alt: `Abstract content ${i}`
  }));
};

// Data configuration for the columns
// We want 4-5 columns to cover a wide screen comfortably.
// "direction" determines if it scrolls 'up' or 'down'.
// "speed" is the duration in seconds. Higher number = slower speed ("very small speed").
const COLUMNS = [
  {
    id: 'col-1',
    images: generateImages('tech', 6),
    direction: 'up',
    speed: 160, 
  },
  {
    id: 'col-2',
    images: generateImages('design', 6),
    direction: 'down',
    speed: 190, 
  },
  {
    id: 'col-3',
    images: generateImages('arch', 6),
    direction: 'up',
    speed: 140,
  },
  {
    id: 'col-4',
    images: generateImages('music', 6),
    direction: 'down',
    speed: 170,
  },
  {
    id: 'col-5',
    images: generateImages('art', 6),
    direction: 'up',
    speed: 200,
  }
];

export const AnimatedGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 
        The Rotation Wrapper.
        We scale it up to ensure the rotated edges don't show empty space 
        in the corners of the viewport. 
        We rotate by -15deg for that dynamic tilted look.
      */}
      <div 
        className="w-[150%] -ml-[25%] h-[150%] -mt-[10%] flex justify-center gap-4 sm:gap-6 md:gap-8 transform -rotate-10 scale-125 sm:scale-110 md:scale-105 origin-center"
      >
        {COLUMNS.map((column) => (
          <ScrollingColumn 
            key={column.id} 
            images={column.images} 
            direction={column.direction as 'up' | 'down'} 
            duration={column.speed}
          />
        ))}
      </div>
    </div>
  );
};

// Sub-component for a single scrolling column
interface ScrollingColumnProps {
  images: Array<{ id: string; url: string; alt: string }>;
  direction: 'up' | 'down';
  duration: number;
}

const ScrollingColumn: React.FC<ScrollingColumnProps> = ({ images, direction, duration }) => {
  // We duplicate the images to create a seamless infinite loop.
  // The animation moves exactly 50% (the height of one full set), then resets instantly.
  const displayImages = [...images, ...images];

  return (
    <div className="relative w-32 sm:w-48 md:w-64 lg:w-80 shrink-0">
      {/* This inner container holds the moving track */}
      <div 
        className={direction === 'up' ? 'animate-scroll-up' : 'animate-scroll-down'}
        style={{
          animationDuration: `${duration}s`,
        }}
      >
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
          {displayImages.map((img, idx) => (
            <Card key={`${img.id}-${idx}`} url={img.url} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Individual Image Component
// Simplified to just show the image with rounded corners, removing the "card" container styling.
const Card: React.FC<{ url: string }> = ({ url }) => {
  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg transition-transform duration-300 hover:scale-[1.02] border border-border/40 bg-background">
      <div className="aspect-4/3 w-full overflow-hidden bg-surface">
        <img 
          src={url} 
          alt="Gallery item" 
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
};
