'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface FeaturedProjectsProps {
  content?: {
    stats?: Record<string, unknown>;
    clients?: Record<string, unknown>;
    about?: Record<string, unknown>;
  };
}

export default function FeaturedProjects({ content }: FeaturedProjectsProps) {
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
      { threshold: 0.2 }
    );

    refs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const defaultStats = [
    { id: 'stat-1', value: '200+', label: 'Projects Delivered' },
    { id: 'stat-2', value: '8+', label: 'Years Experience' },
    { id: 'stat-3', value: '4.9', label: 'Client Rating' },
    { id: 'stat-4', value: '50+', label: 'Awards & Features' },
  ];
  const statsItems = (content?.stats?.items as { value: string; label: string }[]) || null;
  const stats = statsItems
    ? statsItems.map((s, i) => ({ id: `stat-${i + 1}`, ...s }))
    : defaultStats;

  const defaultClients = ['Vogue', 'Tatler', 'Harper\'s Bazaar', 'The Ritz', 'Claridge\'s', 'Harrods', 'Fortnum & Mason', 'Rolls-Royce'];
  const clients = (content?.clients?.names as string[]) || defaultClients;
  const aboutTagline = (content?.about?.tagline as string) || 'About the Studio';
  const aboutHeadingRaw = (content?.about?.heading as string) || "We don\u2019t just document moments \u2014 we craft visual stories that live forever.";
  const aboutDescriptionRaw =
    (content?.about?.description as string) ||
    'OpusStudio is a team of filmmakers, photographers, and creative directors who believe every milestone deserves a cinematic treatment. From intimate elopements to 500-guest galas, we bring the same obsessive attention to light, composition, and narrative.';
  const aboutButtonText = (content?.about?.button_text as string) || 'Our Story';
  const aboutButtonUrl = (content?.about?.button_url as string) || '/about';
  const aboutHeading = (() => {
    const normalized = aboutHeadingRaw.replace(/\s+/g, ' ').trim();
    const lower = normalized.toLowerCase();

    if (
      lower.includes("we don't just document moments") ||
      lower.includes("we don’t just document moments")
    ) {
      return 'Make it — iconic.';
    }

    if (lower.includes('in a world that never stops scrolling')) {
      return 'Make it — iconic.';
    }

    return normalized;
  })();
  const aboutHeadingLines = (() => {
    if (aboutHeading.toLowerCase().includes('make it')) {
      return ['MAKE IT', 'ICONIC.'];
    }

    const parts = aboutHeading.split('—').map((part) => part.trim()).filter(Boolean);
    if (parts.length < 2) return [aboutHeading];
    return [parts[0], parts.slice(1).join(' — ')];
  })();
  const aboutDescription = (() => {
    const normalized = aboutDescriptionRaw.replace(/\s+/g, ' ').trim();
    if (!normalized) return '';

    const lower = normalized.toLowerCase();
    if (lower.includes('in a world that never stops scrolling')) {
      return 'OpusStudio is the creative engine of the OpusFesta ecosystem, shaping raw ideas into stories with precision, taste, and cinematic discipline. We believe every project deserves more than coverage; it deserves a point of view, a clear narrative, and execution that holds up anywhere.||From films and photography to livestreams and brand consulting, we build visual worlds that feel considered from the first frame to the final delivery. Every detail is crafted to move people, sharpen perception, and leave a mark that lasts well beyond the moment itself.';
    }

    if (normalized.length <= 420) return normalized;

    const sentences = normalized
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length === 0) return normalized;

    const first = sentences[0];
    const second = sentences[1] || '';
    const fromSentence = sentences.find((s) => /^from\s/i.test(s));
    const third = sentences[2] || '';
    const picked = [first, second, fromSentence || third].filter(Boolean);
    let concise = picked.join(' ');

    if (concise.length > 430) {
      concise = concise.slice(0, 427).replace(/\s+\S*$/, '').trimEnd() + '...';
    }
    return concise;
  })();
  const aboutDescriptionParts = aboutDescription
    .split('||')
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <section id="about" className="relative z-10 bg-brand-bg">
      <div className="grid grid-cols-2 md:grid-cols-4 bg-brand-dark border-b border-white/10">
        {stats.map((stat, index) => {
          const borders = [
            'border-r border-b md:border-b-0 border-white/10',
            'border-b md:border-b-0 md:border-r border-white/10',
            'border-r md:border-r border-white/10',
            '',
          ];
          return (
            <div
              key={stat.id}
              ref={setRef(stat.id)}
              className={`py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-12 text-center transition-all duration-700 ${borders[index]} ${
                visibleItems.has(stat.id)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-mono tracking-tight mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        ref={setRef('clients-strip')}
        className={`bg-brand-dark border-b border-white/10 py-8 sm:py-10 overflow-hidden transition-all duration-700 ${
          visibleItems.has('clients-strip')
            ? 'opacity-100'
            : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-8">
          <div className="shrink-0 pl-6 lg:pl-12">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em]">
              Featured In
            </span>
          </div>
          <div className="h-4 w-px bg-brand-accent/40 hidden sm:block"></div>
          <div className="overflow-hidden flex-1">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...clients, ...clients, ...clients].map((client, i) => (
                <span
                  key={`${client}-${i}`}
                  className="text-xs sm:text-sm font-semibold text-white/30 uppercase tracking-[0.25em] mx-6 sm:mx-10 inline-block"
                >
                  {client}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={setRef('intro-block')}
        className={`max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-20 lg:pt-16 lg:pb-24 transition-all duration-700 ${
          visibleItems.has('intro-block')
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 lg:gap-10 pb-10 lg:pb-12">
          <div>
            <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-4 block">
              {aboutTagline}
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-brand-dark leading-[0.9] uppercase break-words [overflow-wrap:anywhere]">
              {aboutHeadingLines[0]}
              {aboutHeadingLines[1] && (
                <>
                  <br />
                  <span className="text-stroke">{aboutHeadingLines[1]}</span>
                </>
              )}
            </h2>
          </div>

          <div className="flex flex-col items-start gap-5 max-w-lg">
            {aboutDescriptionParts.map((part, index) => (
              <p
                key={`about-description-part-${index}`}
                className="text-neutral-500 text-base lg:text-lg leading-relaxed font-light break-words [overflow-wrap:anywhere]"
              >
                {part}
              </p>
            ))}

            <Link
              href={aboutButtonUrl}
              className="inline-flex items-center gap-3 px-6 py-3 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200"
            >
              {aboutButtonText}
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
        </div>
      </div>
    </section>
  );
}
