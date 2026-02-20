'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

export default function SignatureWorkSection() {
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

  const projects = [
    {
      id: 'proj-1',
      number: '01',
      category: 'Wedding Film',
      title: 'THE MERIDIAN EXPERIENCE',
      description: 'A full-day cinematic wedding captured across three stunning venues in the Scottish Highlands.',
      image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bcced374-a515-4136-bef9-e31a8cd1c18f_1600w.jpg',
    },
    {
      id: 'proj-2',
      number: '02',
      category: 'Event Coverage',
      title: 'ROOFTOP GALA NIGHT',
      description: 'High-energy photography capturing 400 guests at an exclusive London rooftop charity gala.',
      image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/ffd0641a-688d-4761-a530-60fec416aab1_1600w.webp',
    },
    {
      id: 'proj-3',
      number: '03',
      category: 'Corporate',
      title: 'VISION 2030 SUMMIT',
      description: 'Brand film and event documentation for a Fortune 500 annual leadership summit.',
      image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/792defd4-d702-4f36-b352-ba625129dfb5_3840w.webp',
    },
    {
      id: 'proj-4',
      number: '04',
      category: 'Commercial',
      title: 'BRAND LAUNCH FILM',
      description: 'Concept-to-delivery commercial for a luxury heritage brand entering a new market.',
      image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/d2607b57-3a19-48e4-8ad4-bdcf6e69b207_3840w.webp',
    },
  ];

  return (
    <section id="work" className="py-24 relative z-10 bg-brand-bg">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          ref={setRef('sig-header')}
          className={`mb-16 transition-all duration-700 ${
            visibleItems.has('sig-header')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-brand-border pb-8">
            <div>
              <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
                Portfolio
              </span>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9]">
                SIGNATURE<br />
                <span className="text-stroke">WORK.</span>
              </h2>
            </div>
            <a
              href="#"
              className="group inline-flex items-center gap-3 text-xs font-bold text-brand-dark uppercase tracking-widest px-5 py-3 border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-all duration-200"
            >
              View All Projects
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
            </a>
          </div>
        </div>

        <div className="space-y-12 lg:space-y-20">
          {projects.map((project, index) => {
            const isVisible = visibleItems.has(project.id);
            const isReversed = index % 2 === 1;

            return (
              <div
                key={project.id}
                ref={setRef(project.id)}
                className={`group grid grid-cols-1 lg:grid-cols-2 gap-0 border-4 border-brand-border transition-all duration-700 hover:shadow-brutal-lg ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-12'
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
                    <div className={`flex items-center gap-4 mb-8 transition-all duration-500 delay-200 ${
                      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
                    }`}>
                      <span className={`h-[2px] bg-brand-accent transition-all duration-700 delay-[400ms] ${
                        isVisible ? 'w-8' : 'w-0'
                      }`}></span>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                        {project.category}
                      </span>
                    </div>

                    <h3 className={`text-3xl lg:text-5xl font-bold text-brand-dark uppercase tracking-tighter mb-6 group-hover:text-brand-accent transition-all duration-700 delay-300 leading-[1] ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}>
                      {project.title}
                    </h3>

                    <p className={`text-neutral-500 leading-relaxed max-w-md font-light text-base lg:text-lg mb-10 transition-all duration-700 delay-[400ms] ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}>
                      {project.description}
                    </p>
                  </div>

                  <div className={`transition-all duration-700 delay-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}>
                    <a
                      href="#"
                      className="inline-flex items-center gap-3 px-6 py-3 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200"
                    >
                      View Case Study
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
