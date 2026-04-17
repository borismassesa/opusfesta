'use client';

import Link from 'next/link';
import { useRef, useEffect, useState, useCallback } from 'react';
import type { StudioFaq } from '@/lib/studio-types';

interface FAQSectionProps {
  faqs?: StudioFaq[];
}

export default function FAQSection({ faqs: dbFaqs }: FAQSectionProps) {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  const setRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) refs.current.set(id, el);
  }, []);

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
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    refs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const faqs = (dbFaqs ?? []).map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
  }));

  if (faqs.length === 0) return null;

  return (
    <section id="faq" className="py-24 relative z-10 bg-brand-bg">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 lg:gap-20">
          <div
            ref={setRef('faq-header')}
            className={`transition-all duration-700 ${
              visibleItems.has('faq-header')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
              FAQ
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-brand-dark leading-[0.9] mb-6">
              COMMON<br />
              <span className="text-stroke">QUESTIONS.</span>
            </h2>
            <p className="text-neutral-500 text-lg leading-relaxed font-light max-w-sm mb-8">
              Everything you need to know before booking. Still have questions? Get in touch.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-6 py-3 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-4 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200"
            >
              Ask Us Anything
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
            </Link>
          </div>

          <div className="border-t-4 border-brand-border">
            {faqs.map((faq, index) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div
                  key={faq.id}
                  ref={setRef(faq.id)}
                  className={`border-b-4 border-brand-border transition-all duration-700 ${
                    visibleItems.has(faq.id)
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="w-full py-6 flex items-start gap-4 sm:gap-6 group text-left cursor-pointer"
                  >
                    <span className="text-lg sm:text-xl font-bold text-brand-dark tracking-tight flex-1 group-hover:text-brand-accent transition-colors duration-300">
                      {faq.question}
                    </span>
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 border-2 border-brand-dark flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isExpanded
                          ? 'bg-brand-accent border-brand-accent'
                          : 'shadow-brutal-sm group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
                  </button>
                  <div
                    className={`grid transition-all duration-500 ease-in-out ${
                      isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-neutral-500 leading-relaxed font-light text-base pb-8 pr-14 sm:pr-16">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
