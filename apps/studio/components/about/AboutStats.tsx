'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface AboutStatsProps {
  content?: Record<string, unknown>;
}

export default function AboutStats({ content }: AboutStatsProps) {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  const setRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) refs.current.set(id, el);
    },
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Array.from(refs.current.entries()).find(
              ([, el]) => el === entry.target
            )?.[0];
            if (id) setVisibleItems((prev) => new Set(prev).add(id));
          }
        });
      },
      { threshold: 0.2 }
    );
    refs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const defaultStats = [
    { value: '8+', label: 'Years in Business' },
    { value: '200+', label: 'Projects Delivered' },
    { value: '50+', label: 'Happy Clients' },
    { value: '4.9', label: 'Average Rating' },
  ];

  const statsItems = (content?.items as { value: string; label: string }[]) || null;
  const stats = (statsItems || defaultStats).map((s, i) => ({ id: `about-stat-${i}`, ...s }));

  const borders = [
    'border-r border-b md:border-b-0 border-white/10',
    'border-b md:border-b-0 md:border-r border-white/10',
    'border-r md:border-r border-white/10',
    '',
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 bg-brand-dark border-b border-white/10">
      {stats.map((stat, index) => (
        <div
          key={stat.id}
          ref={setRef(stat.id)}
          className={`py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-12 text-center transition-all duration-700 ${borders[index]} ${
            visibleItems.has(stat.id)
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: `${index * 120}ms` }}
        >
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-mono tracking-tight mb-1 sm:mb-2">
            {stat.value}
          </div>
          <div className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
