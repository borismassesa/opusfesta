'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { projects } from '@/lib/data';

export default function PortfolioGrid() {
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
          ref={setRef('portfolio-header')}
          className={`mb-16 transition-all duration-700 ${
            visibleItems.has('portfolio-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
            Portfolio
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9]">
            OUR<br />
            <span className="text-stroke">WORK.</span>
          </h1>
        </div>

        <div className="space-y-12 lg:space-y-20">
          {projects.map((project, index) => {
            const isVisible = visibleItems.has(project.id);
            const isReversed = index % 2 === 1;

            return (
              <Link
                key={project.id}
                href={`/portfolio/${project.slug}`}
                ref={setRef(project.id) as React.Ref<HTMLAnchorElement>}
                className={`group grid grid-cols-1 lg:grid-cols-2 gap-0 border-4 border-brand-border transition-all duration-700 hover:shadow-brutal-lg block ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div
                  className={`relative overflow-hidden aspect-[16/10] lg:aspect-auto lg:min-h-[500px] ${
                    isReversed ? 'lg:order-2' : ''
                  }`}
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={`object-cover transition-transform duration-1000 ${
                      isVisible ? 'scale-100' : 'scale-110'
                    } group-hover:scale-105`}
                  />
                  <div className="absolute top-6 left-6 z-10">
                    <span className={`text-8xl lg:text-9xl font-bold text-white/10 font-mono leading-none transition-all duration-700 delay-300 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                    }`}>
                      {project.number}
                    </span>
                  </div>
                </div>

                <div
                  className={`flex flex-col justify-between p-8 lg:p-14 bg-brand-bg group-hover:bg-brand-panel transition-colors duration-500 ${
                    isReversed ? 'lg:order-1' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="h-[2px] w-8 bg-brand-accent"></span>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                        {project.category}
                      </span>
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-bold text-brand-dark uppercase tracking-tighter mb-6 group-hover:text-brand-accent transition-colors duration-300 leading-[1]">
                      {project.title}
                    </h2>
                    <p className="text-neutral-500 leading-relaxed max-w-md font-light text-base lg:text-lg mb-10">
                      {project.description}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-3 px-6 py-3 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-2 border-brand-dark shadow-brutal-sm group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 group-hover:bg-brand-accent group-hover:border-brand-accent transition-all duration-200">
                      View Case Study
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14m-7-7l7 7l-7 7"></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
