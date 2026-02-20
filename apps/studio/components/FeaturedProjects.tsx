'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

export default function FeaturedProjects() {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  const setRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) {
      refs.current.set(id, el);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Array.from(refs.current.entries()).find(
              ([, el]) => el === entry.target
            )?.[0];
            if (id) {
              setVisibleItems((prev) => new Set(prev).add(id));
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    refs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const stats = [
    { id: 'stat-1', value: '200+', label: 'Projects Delivered' },
    { id: 'stat-2', value: '8+', label: 'Years Experience' },
    { id: 'stat-3', value: '4.9', label: 'Client Rating' },
    { id: 'stat-4', value: '50+', label: 'Awards & Features' },
  ];

  const clients = [
    'Vogue', 'Tatler', 'Harper\'s Bazaar', 'The Ritz', 'Claridge\'s',
    'Harrods', 'Fortnum & Mason', 'Rolls-Royce',
  ];

  return (
    <section className="relative z-10 bg-brand-dark">
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/10">
        {stats.map((stat, index) => {
          const borders = [
            'border-r border-b md:border-b-0 border-white/10',
            'border-b md:border-b-0 md:border-r border-white/10',
            'border-r md:border-r border-white/10',
            '',
          ];
          return (
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
          );
        })}
      </div>

      <div
        ref={setRef('clients-strip')}
        className={`bg-brand-dark py-8 sm:py-10 overflow-hidden transition-all duration-700 ${
          visibleItems.has('clients-strip')
            ? 'opacity-100'
            : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-8">
          <div className="shrink-0 pl-6 lg:pl-12">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
              Featured In
            </span>
          </div>
          <div className="h-4 w-px bg-brand-accent/40 hidden sm:block"></div>
          <div className="overflow-hidden flex-1">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...clients, ...clients, ...clients].map((client, i) => (
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
      </div>

      <div
        ref={setRef('intro-block')}
        className={`max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28 transition-all duration-700 ${
          visibleItems.has('intro-block')
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-end">
          <div>
            <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
              About the Studio
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tighter leading-[1.1]">
              We don&apos;t just document moments — we craft visual stories that live forever.
            </h2>
          </div>
          <div>
            <p className="text-white/50 text-base lg:text-lg leading-relaxed font-light mb-8">
              OpusFesta Studio is a team of filmmakers, photographers, and creative directors who believe every milestone deserves a cinematic treatment. From intimate elopements to 500-guest galas, we bring the same obsessive attention to light, composition, and narrative.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-3 text-xs font-bold text-white uppercase tracking-widest px-6 py-3 border border-white/30 hover:border-brand-accent hover:text-brand-accent transition-all duration-300"
            >
              Our Story
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14m-7-7l7 7l-7 7"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
