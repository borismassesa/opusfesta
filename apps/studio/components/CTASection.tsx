'use client';

import { useRef, useEffect, useState } from 'react';
import BookingTriggerButton from '@/components/booking/BookingTriggerButton';

export default function CTASection() {
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

  return (
    <section
      ref={sectionRef}
      className="relative z-10 bg-brand-bg overflow-hidden"
    >
      <div
        className={`max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-8 block">
            Ready to Start?
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9] mb-6">
            LET&apos;S MAKE
            <br />
            <span className="text-stroke">SOMETHING</span>
            <br />
            UNFORGETTABLE.
          </h2>
          <p className="text-neutral-500 text-base sm:text-lg leading-relaxed font-light max-w-lg mx-auto mb-12">
            Whether it&apos;s a wedding, a product launch, or a milestone celebration — we&apos;d love to hear about it.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <BookingTriggerButton
              source="cta-book-your-date"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-4 border-brand-dark shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200"
            >
              Book Your Date
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14m-7-7l7 7l-7 7"></path>
              </svg>
            </BookingTriggerButton>
            <a
              href="#services"
              className="inline-flex items-center justify-center px-10 py-5 text-xs font-bold text-brand-dark uppercase tracking-widest border-4 border-brand-border shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:border-brand-accent hover:text-brand-accent transition-all duration-200"
            >
              View Services
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
