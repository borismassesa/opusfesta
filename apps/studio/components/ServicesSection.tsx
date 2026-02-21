'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { services } from '@/lib/data';
import { useBookingModal } from '@/components/BookingModalProvider';

export default function ServicesSection() {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const refs = useRef<Map<string, HTMLElement>>(new Map());
  const { openBookingModal } = useBookingModal();

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
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    refs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section id="services" className="py-24 relative z-10 bg-brand-bg">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          ref={setRef('services-header')}
          className={`mb-16 transition-all duration-700 ${
            visibleItems.has('services-header')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
                What We Do
              </span>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9]">
                WE CAPTURE<br />
                <span className="text-stroke">EVERYTHING.</span>
              </h2>
            </div>
            <p className="text-neutral-500 text-lg max-w-sm leading-relaxed font-light md:text-right">
              From intimate weddings to large-scale productions. If it moves us, we shoot it.
            </p>
          </div>
        </div>

        <div className="border-t-4 border-brand-border">
          {services.map((service, index) => {
            const itemId = `service-${service.id}`;
            const isVisible = visibleItems.has(itemId);
            const isExpanded = expandedId === service.id;

            return (
              <div
                key={service.id}
                ref={setRef(itemId)}
                className={`border-b-4 border-brand-border transition-all duration-700 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <button
                  onClick={() => toggleExpand(service.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`panel-${service.id}`}
                  className="w-full py-6 sm:py-8 lg:py-10 flex items-center gap-3 sm:gap-6 lg:gap-10 group text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-brand-accent focus-visible:outline-offset-4"
                >
                  <span className="text-2xl sm:text-4xl lg:text-6xl font-bold text-neutral-200 font-mono leading-none min-w-[40px] sm:min-w-[60px] lg:min-w-[90px] group-hover:text-brand-accent transition-colors duration-300">
                    {service.id}
                  </span>

                  <h3 id={`heading-${service.id}`} className="text-lg sm:text-2xl lg:text-4xl xl:text-5xl font-bold text-brand-dark tracking-tighter group-hover:text-brand-accent transition-colors duration-300 flex-1">
                    {service.title}
                  </h3>

                  <div className="flex items-center gap-6">
                    <span className="text-sm font-mono text-neutral-400 hidden md:block">
                      {service.price}
                    </span>
                    <div
                      className={`w-10 h-10 lg:w-12 lg:h-12 border-2 border-brand-dark flex items-center justify-center transition-all duration-300 ${
                        isExpanded
                          ? 'bg-brand-accent border-brand-accent shadow-none'
                          : 'bg-transparent shadow-brutal-sm group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isExpanded ? 'white' : 'currentColor'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`}
                      >
                        <path d="M12 5v14M5 12h14"></path>
                      </svg>
                    </div>
                  </div>
                </button>

                <div
                  id={`panel-${service.id}`}
                  role="region"
                  aria-labelledby={`heading-${service.id}`}
                  className={`grid transition-all duration-500 ease-in-out ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                  <div className="pb-10 pl-6 sm:pl-[84px] lg:pl-[130px] pr-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
                      <div>
                        <p className="text-neutral-600 leading-relaxed max-w-2xl mb-8 text-base lg:text-lg font-light">
                          {service.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                          {service.includes.map((item) => (
                            <span
                              key={item}
                              className="text-[11px] font-mono text-brand-dark border-2 border-brand-border px-4 py-2 uppercase tracking-wide"
                            >
                              {item}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-6">
                          <span className="text-xl font-bold text-brand-dark font-mono tracking-tight md:hidden">
                            {service.price}
                          </span>
                          <button
                            onClick={() => openBookingModal(service.title)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200"
                          >
                            Enquire Now
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
                          </button>
                        </div>
                      </div>

                      <div className="relative border-4 border-brand-border shadow-brutal overflow-hidden aspect-[4/3]">
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 380px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
