'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface AboutValuesProps {
  content?: Record<string, unknown>;
}

const DEFAULT_VALUES = [
  {
    title: 'Craft Over Speed',
    description:
      'Every frame, every edit, every delivery \u2014 quality is non-negotiable. We\u2019d rather take the time to get it right than rush something out the door.',
  },
  {
    title: 'Trust First',
    description:
      'We build long-term partnerships, not transactional relationships. Our best work comes from clients who trust us to push creative boundaries.',
  },
  {
    title: 'Cinematic Always',
    description:
      'Whether it\u2019s a wedding, a product launch, or a brand campaign \u2014 the bar is always cinematic. No exceptions, no shortcuts.',
  },
  {
    title: 'Client as Collaborator',
    description:
      'Your vision drives the project. We bring the technical mastery, the creative eye, and the production infrastructure to bring it to life.',
  },
];

export default function AboutValues({ content }: AboutValuesProps) {
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
      { threshold: 0.15 }
    );
    refs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const tagline = (content?.tagline as string) || 'What We Stand For';
  const heading = (content?.heading as string) || 'OUR VALUES.';
  const items = (content?.items as { title: string; description: string }[]) || DEFAULT_VALUES;

  return (
    <section className="bg-brand-bg py-24 lg:py-32 border-b-4 border-brand-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section heading */}
        <div
          ref={setRef('values-heading')}
          className={`mb-12 lg:mb-16 transition-all duration-700 ${
            visibleItems.has('values-heading')
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-5 block">
            {tagline}
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter text-brand-dark leading-[0.9]">
            OUR <span className="text-stroke">{heading.replace('OUR ', '').replace('OUR', '')}</span>
          </h2>
        </div>

        {/* Values grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {items.map((item, index) => {
            const id = `value-${index}`;
            const isEven = index % 2 === 0;
            const isTopRow = index < 2;
            return (
              <div
                key={id}
                ref={setRef(id)}
                className={`relative border-4 border-brand-border p-8 lg:p-10 transition-all duration-700 ${
                  isEven ? 'bg-white' : 'bg-brand-panel'
                } ${!isTopRow ? '-mt-1' : ''} ${
                  index % 2 === 1 ? '-ml-1' : ''
                } ${
                  visibleItems.has(id)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <span className="text-6xl lg:text-7xl font-bold font-mono text-brand-accent/15 leading-none block mb-4">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg lg:text-xl font-bold text-brand-dark uppercase tracking-tight mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-500 text-sm lg:text-base leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
