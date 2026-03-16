'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { StudioProject, StudioService } from '@/lib/studio-types';

interface GallerySectionProps {
  projects?: StudioProject[];
  services?: StudioService[];
}

const layouts = [
  'md:col-span-6 md:row-span-2',
  'md:col-span-3 md:row-span-1',
  'md:col-span-3 md:row-span-1',
  'md:col-span-3 md:row-span-1',
  'md:col-span-3 md:row-span-1',
  'md:col-span-4 md:row-span-1',
  'md:col-span-4 md:row-span-1',
  'md:col-span-4 md:row-span-1',
];

export default function GallerySection({ projects = [], services = [] }: GallerySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const galleryItems = useMemo(() => {
    const items: { id: string; title: string; subtitle: string; image: string; href: string; cta: string; layout: string }[] = [];
    // Interleave projects and services into the gallery grid
    const projectSlots = [0, 1, 3, 4]; // gallery positions for projects
    const serviceSlots = [2, 5, 6, 7]; // gallery positions for services
    let pi = 0;
    let si = 0;
    for (let i = 0; i < 8; i++) {
      if (projectSlots.includes(i) && pi < projects.length) {
        const p = projects[pi++];
        items.push({
          id: `gallery-${i + 1}`,
          title: p.title,
          subtitle: p.category,
          image: p.cover_image,
          href: `/portfolio/${p.slug}`,
          cta: 'Open Project',
          layout: layouts[i],
        });
      } else if (serviceSlots.includes(i) && si < services.length) {
        const s = services[si++];
        items.push({
          id: `gallery-${i + 1}`,
          title: s.title,
          subtitle: 'Service Snapshot',
          image: s.cover_image,
          href: '/services',
          cta: 'View Service',
          layout: layouts[i],
        });
      }
    }
    return items;
  }, [projects, services]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (galleryItems.length === 0) return null;

  return (
    <section id="gallery" ref={sectionRef} className="relative z-10 py-24 bg-brand-bg">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-14 lg:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-brand-border pb-8">
          <div>
            <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
              Portfolio
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9]">
              VISUAL<br />
              <span className="text-stroke">MOMENTS.</span>
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">
            <p className="text-neutral-500 text-base lg:text-lg max-w-sm leading-relaxed font-light md:text-right">
              A quick look at frames, sets, and standout moments from recent productions.
            </p>
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-3 text-xs font-bold text-brand-dark uppercase tracking-widest px-5 py-3 border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:text-white hover:border-brand-accent transition-all duration-200"
            >
              View More
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

        <div className="relative">
          <div className="pointer-events-none absolute -left-6 top-1/3 h-40 w-40 rounded-full bg-brand-accent/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-8 bottom-8 h-44 w-44 rounded-full bg-brand-accent/10 blur-3xl" />

          <div className="relative grid grid-cols-1 md:grid-cols-12 md:auto-rows-[190px] lg:auto-rows-[210px] gap-4 lg:gap-5">
            {galleryItems.map((item, index) => {
              const itemNumber = String(index + 1).padStart(2, '0');
              const isFeature = index === 0;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`group relative overflow-hidden border-[3px] border-brand-border bg-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300 ${item.layout} ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 90}ms` }}
                >
                  <div className="relative h-full w-full aspect-[16/10] md:aspect-auto">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-brand-dark/35 to-brand-dark/5 group-hover:from-brand-dark/92 group-hover:via-brand-dark/45 transition-colors duration-500" />

                    <div className="absolute left-4 right-4 top-4 flex items-start justify-between">
                      <span className="inline-flex items-center border border-white/30 bg-brand-dark/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/85 font-mono backdrop-blur-sm">
                        {item.subtitle}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-brand-accent">
                        {itemNumber}
                      </span>
                    </div>

                    <div className="absolute left-4 right-4 bottom-4">
                      <h3 className={`font-bold text-white uppercase tracking-wide leading-[1.05] group-hover:text-brand-accent transition-colors ${
                        isFeature ? 'text-xl lg:text-2xl' : 'text-base lg:text-lg'
                      }`}>
                        {item.title}
                      </h3>
                      <div className="mt-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
                        {item.cta}
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
                          className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                        >
                          <path d="M7 17L17 7"></path>
                          <path d="M7 7h10v10"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
