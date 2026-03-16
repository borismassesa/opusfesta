'use client';

import { useRef, useEffect, useState } from 'react';

interface AboutClientsProps {
  content?: Record<string, unknown>;
}

const DEFAULT_CLIENTS = [
  'Northline Electric',
  'Blue Current Foundation',
  'Pulse FM',
  'Aether Mobility',
  'Atlas Hotels',
  'Nova Energy',
  'Sora Spirits',
  'Meridian Bank',
];

export default function AboutClients({ content }: AboutClientsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const label = (content?.heading as string) || 'Trusted By';
  const clients = (content?.names as string[]) || DEFAULT_CLIENTS;
  const allClients = [...clients, ...clients, ...clients];

  return (
    <section
      ref={sectionRef}
      className={`bg-brand-dark py-14 lg:py-16 overflow-hidden border-b border-white/10 transition-all duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex items-center gap-8">
        <div className="shrink-0 pl-6 lg:pl-12">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
            {label}
          </span>
        </div>
        <div className="h-4 w-px bg-brand-accent/40 hidden sm:block" />
        <div className="overflow-hidden flex-1">
          <div className="flex animate-marquee whitespace-nowrap">
            {allClients.map((client, i) => (
              <span
                key={`${client}-${i}`}
                className="text-xs sm:text-sm font-semibold text-white/30 uppercase tracking-[0.25em] mx-6 sm:mx-10 inline-block"
              >
                {client}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
