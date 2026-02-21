'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { articles } from '@/lib/data';

export default function JournalGrid() {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
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

  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          ref={setRef('journal-header')}
          className={`mb-16 transition-all duration-700 ${
            visibleItems.has('journal-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
            Insights
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9]">
            STUDIO<br />
            <span className="text-stroke">JOURNAL.</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Link
              key={article.id}
              href={`/journal/${article.slug}`}
              ref={setRef(article.id) as React.Ref<HTMLAnchorElement>}
              className={`group border-4 border-brand-border hover:shadow-brutal-lg transition-all duration-700 block ${
                visibleItems.has(article.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <div className="relative overflow-hidden aspect-[16/10]">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6 lg:p-8 bg-brand-bg">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                    {article.date}
                  </span>
                  <span className="w-1 h-1 bg-neutral-300"></span>
                  <span className="text-[10px] font-mono text-brand-accent uppercase tracking-widest">
                    {article.category}
                  </span>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-brand-dark tracking-tighter mb-3 group-hover:text-brand-accent transition-colors duration-300 leading-[1.1]">
                  {article.title}
                </h2>
                <p className="text-neutral-500 leading-relaxed font-light text-sm mb-6">
                  {article.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-[11px] font-bold text-brand-dark/40 uppercase tracking-widest group-hover:text-brand-accent transition-colors duration-300">
                  Read Article
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform duration-300">
                    <path d="M5 12h14m-7-7l7 7l-7 7"></path>
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
