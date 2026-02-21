'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { articles } from '@/lib/data';

export default function JournalSection() {
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
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    refs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <section className="py-24 bg-brand-dark relative z-10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          ref={setRef('journal-header')}
          className={`mb-16 transition-all duration-700 ${
            visibleItems.has('journal-header')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
            <div>
              <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
                Insights
              </span>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[0.9]">
                STUDIO<br />
                <span className="text-stroke-light">JOURNAL.</span>
              </h2>
            </div>
            <Link
              href="/journal"
              className="group inline-flex items-center gap-3 text-xs font-bold text-white uppercase tracking-widest px-5 py-3 border-2 border-white/30 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:border-brand-accent hover:text-brand-accent transition-all duration-200"
            >
              All Articles
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
                className="group-hover:translate-x-1 transition-transform"
              >
                <path d="M5 12h14m-7-7l7 7l-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>

        <Link
          href={`/journal/${featured.slug}`}
          ref={setRef('journal-featured') as React.Ref<HTMLAnchorElement>}
          className={`group grid grid-cols-1 lg:grid-cols-2 gap-0 border-4 border-white/10 mb-8 cursor-pointer transition-all duration-700 hover:border-brand-accent/40 block ${
            visibleItems.has('journal-featured')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="relative overflow-hidden aspect-[16/10] lg:aspect-auto lg:min-h-[420px]">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-5 left-5 z-10">
              <span className="px-3 py-1.5 bg-brand-accent text-white text-[10px] font-bold uppercase tracking-widest">
                Latest
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-between p-8 lg:p-12 bg-brand-dark">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  {featured.date}
                </span>
                <span className="w-1 h-1 bg-white/20"></span>
                <span className="text-[10px] font-mono text-brand-accent uppercase tracking-widest">
                  {featured.category}
                </span>
              </div>
              <h3 className="text-2xl lg:text-4xl font-bold text-white tracking-tighter mb-6 group-hover:text-brand-accent transition-colors duration-300 leading-[1.1]">
                {featured.title}
              </h3>
              <p className="text-white/40 leading-relaxed font-light text-base lg:text-lg max-w-md">
                {featured.excerpt}
              </p>
            </div>
            <div className="mt-8">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-widest group-hover:text-brand-accent transition-colors duration-300">
                Read Article
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
                  className="group-hover:translate-x-2 transition-transform duration-300"
                >
                  <path d="M5 12h14m-7-7l7 7l-7 7"></path>
                </svg>
              </span>
            </div>
          </div>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {rest.map((article, index) => (
            <Link
              key={article.id}
              href={`/journal/${article.slug}`}
              ref={setRef(article.id) as React.Ref<HTMLAnchorElement>}
              className={`group cursor-pointer border-4 border-white/10 hover:border-brand-accent/40 transition-all duration-700 block ${
                visibleItems.has(article.id)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(index + 1) * 120}ms` }}
            >
              <div className="relative overflow-hidden aspect-[16/9]">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-6 lg:p-8 bg-brand-dark">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    {article.date}
                  </span>
                  <span className="w-1 h-1 bg-white/20"></span>
                  <span className="text-[10px] font-mono text-brand-accent uppercase tracking-widest">
                    {article.category}
                  </span>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tighter mb-3 group-hover:text-brand-accent transition-colors duration-300 leading-[1.1]">
                  {article.title}
                </h3>
                <p className="text-white/35 leading-relaxed font-light text-sm mb-6">
                  {article.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-[11px] font-bold text-white/40 uppercase tracking-widest group-hover:text-brand-accent transition-colors duration-300">
                  Read
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  >
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
