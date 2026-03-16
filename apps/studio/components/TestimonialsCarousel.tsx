'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import type { StudioTestimonial } from '@/lib/studio-types';

interface TestimonialsCarouselProps {
  testimonials?: StudioTestimonial[];
}

export default function TestimonialsCarousel({ testimonials: dbTestimonials }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const testimonials = (dbTestimonials ?? []).map((t) => ({
    quote: t.quote,
    author: t.author,
    role: t.role,
    avatar: t.avatar_url || '',
  }));

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  if (testimonials.length === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <section
      ref={sectionRef}
      className="py-28 lg:py-36 relative bg-brand-bg z-10 overflow-hidden"
    >
      <div className="absolute top-8 left-6 sm:top-12 sm:left-12 text-[8rem] sm:text-[12rem] lg:text-[20rem] font-bold text-neutral-100 leading-none select-none pointer-events-none font-mono">
        &ldquo;
      </div>

      <div
        className={`max-w-[1400px] mx-auto px-6 lg:px-12 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-16 xl:gap-20 items-start">
          <div>
            <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-10 block">
              Testimonials
            </span>

            <div className="relative min-h-[180px] sm:min-h-[180px] md:min-h-[140px] mb-10">
              {testimonials.map((t, i) => (
                <p
                  key={i}
                  className={`absolute inset-0 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-brand-dark tracking-tighter leading-[1.2] transition-all duration-500 ${
                    currentIndex === i
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
              ))}
            </div>

            <div className="border-t-4 border-brand-border pt-8">
              <div className="relative h-12">
                {testimonials.map((t, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 transition-all duration-500 ${
                      currentIndex === i
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-2 pointer-events-none'
                    }`}
                  >
                    <h4 className="text-sm font-bold text-brand-dark uppercase tracking-widest">
                      {t.author}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-mono mt-1 tracking-wider">
                      {t.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden xl:block">
            <div className="space-y-0">
              {testimonials.map((t, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-full flex items-center gap-5 py-4 px-5 text-left transition-all duration-300 border-l-4 ${
                    currentIndex === i
                      ? 'border-brand-accent bg-brand-panel'
                      : 'border-transparent hover:border-neutral-300 hover:bg-brand-panel/50'
                  }`}
                >
                  <div className={`w-10 h-10 border-2 overflow-hidden shrink-0 transition-all duration-300 ${
                    currentIndex === i ? 'border-brand-accent' : 'border-neutral-200 grayscale'
                  }`}>
                    <Image
                      src={t.avatar}
                      alt={t.author}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${
                      currentIndex === i ? 'text-brand-dark' : 'text-neutral-400'
                    }`}>
                      {t.author}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                      {t.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 xl:hidden">
            {testimonials.map((t, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-10 h-10 border-2 overflow-hidden transition-all duration-300 ${
                  currentIndex === i
                    ? 'border-brand-accent shadow-brutal-sm'
                    : 'border-neutral-200 grayscale'
                }`}
              >
                <Image
                  src={t.avatar}
                  alt={t.author}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-100">
        <div
          className="h-full bg-brand-accent transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / testimonials.length) * 100}%` }}
        ></div>
      </div>
    </section>
  );
}
