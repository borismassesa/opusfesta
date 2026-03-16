'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

interface AboutStoryProps {
  content?: Record<string, unknown>;
}

export default function AboutStory({ content }: AboutStoryProps) {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const refs = useRef<Map<string, HTMLElement>>(new Map());

  const setRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) refs.current.set(id, el);
    },
    []
  );

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

  const tagline = (content?.tagline as string) || 'Our Story';
  const heading =
    (content?.heading as string) ||
    'Built on craft, driven by collaboration.';
  const paragraph1 =
    (content?.paragraph1 as string) ||
    'OpusStudio was founded with a simple belief: every project deserves cinematic treatment. What started as a two-person crew has grown into a full-service production studio trusted by brands, agencies, and individuals across East Africa.';
  const paragraph2 =
    (content?.paragraph2 as string) ||
    'We don\u2019t chase trends. We invest in relationships, refine our craft obsessively, and approach every shoot with the same intensity \u2014 whether it\u2019s a global campaign or an intimate portrait session.';
  const imageUrl = content?.image_url as string | undefined;

  return (
    <section className="bg-brand-bg py-24 lg:py-32 border-b-4 border-brand-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
          {/* Text column */}
          <div
            ref={setRef('story-text')}
            className={`transition-all duration-700 ${
              visibleItems.has('story-text')
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-6 block">
              {tagline}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter text-brand-dark leading-[1.05] mb-8">
              {heading}
            </h2>
            <p className="text-neutral-500 text-base lg:text-lg leading-relaxed font-light">
              {paragraph1}
            </p>
            <div className="w-12 h-[3px] bg-brand-accent my-8" />
            <p className="text-neutral-500 text-base lg:text-lg leading-relaxed font-light">
              {paragraph2}
            </p>
          </div>

          {/* Image column */}
          <div
            ref={setRef('story-image')}
            className={`transition-all duration-700 delay-200 ${
              visibleItems.has('story-image')
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="border-4 border-brand-border shadow-brutal lg:-mt-8 overflow-hidden">
              {imageUrl ? (
                <div className="relative aspect-[3/4]">
                  <Image
                    src={imageUrl}
                    alt="OpusStudio"
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-brand-panel flex items-center justify-center">
                  <span className="text-8xl font-bold text-brand-dark/10 font-mono">OS</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
