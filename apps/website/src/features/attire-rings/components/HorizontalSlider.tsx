import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalSliderProps {
  children: React.ReactNode;
  className?: string;
  itemWidth?: number; // Optional hint for scroll distance
  showButtons?: boolean;
}

export interface HorizontalSliderHandle {
  scroll: (direction: 'left' | 'right') => void;
}

export const HorizontalSlider = forwardRef<HorizontalSliderHandle, HorizontalSliderProps>(({ children, className = '', itemWidth = 300, showButtons = false }, ref) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 0);
    // Allow a small buffer (5px) for browser rounding errors
    setShowRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = itemWidth * 2; // Scroll 2 items at a time roughly
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    
    // Check buttons after animation (approximate)
    setTimeout(checkScroll, 500);
  };

  useImperativeHandle(ref, () => ({
    scroll
  }));

  return (
    <div className="relative group">
      {showButtons && showLeft && (
        <button 
          onClick={(e) => { e.stopPropagation(); scroll('left'); }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:scale-110 transition-transform hidden group-hover:flex"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className={`flex overflow-x-auto gap-4 sm:gap-6 pb-4 no-scrollbar scroll-smooth ${className}`}
      >
        {children}
      </div>

      {showButtons && showRight && (
        <button 
          onClick={(e) => { e.stopPropagation(); scroll('right'); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:scale-110 transition-transform hidden group-hover:flex"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
});

HorizontalSlider.displayName = 'HorizontalSlider';