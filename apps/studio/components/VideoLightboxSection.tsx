'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const STUDIO_REEL_EMBED_URL =
  'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&rel=0&modestbranding=1';

export default function VideoLightboxSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPlaying(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isPlaying]);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 bg-brand-dark overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] min-h-[500px] lg:min-h-[700px]">
        <div
          className={`flex flex-col justify-center p-8 sm:p-12 lg:p-20 border-b-4 lg:border-b-0 lg:border-r-4 border-white/10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-2 bg-brand-accent"></div>
            <span className="text-[10px] font-bold text-brand-accent tracking-[0.3em] uppercase font-mono">
              Studio Reel 2025
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-[0.9] mb-6">
            SEE THE
            <br />
            <span className="text-stroke-light text-transparent">WORK IN</span>
            <br />
            MOTION.
          </h2>

          <p className="text-white/40 text-base lg:text-lg leading-relaxed max-w-md mb-10 font-light">
            A cinematic showcase of weddings, events, and milestone moments we&apos;ve had the privilege to capture and craft.
          </p>

          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label="Play studio reel"
              className="inline-flex items-center gap-4 text-xs font-bold text-white uppercase tracking-widest px-6 py-4 border-2 border-white/30 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:border-brand-accent hover:text-brand-accent transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>
              </svg>
              Watch Reel
            </button>
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest hidden sm:block">
              02:48
            </span>
          </div>

        </div>

        <div
          className={`relative group cursor-pointer transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
          }`}
          role="button"
          tabIndex={0}
          aria-label="Open studio reel"
          onClick={() => setIsPlaying(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setIsPlaying(true);
            }
          }}
        >
          <Image
            src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bcced374-a515-4136-bef9-e31a8cd1c18f_1600w.jpg"
            alt="Studio Reel Preview"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500"></div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 sm:w-28 sm:h-28 border-4 border-white flex items-center justify-center group-hover:border-brand-accent group-hover:bg-brand-accent transition-all duration-300 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="white"
                  stroke="none"
                  className="ml-1"
                >
                  <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="flex items-end justify-between">
              <div className="flex gap-3">
                {['Wedding', 'Events', 'Corporate', 'Commercial'].map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-mono text-white/50 uppercase tracking-widest hidden sm:inline-block"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-[2px] bg-brand-accent"></div>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  2025
                </span>
              </div>
            </div>
          </div>

          <div className="absolute top-6 right-6 sm:top-10 sm:right-10">
            <span className="text-8xl sm:text-9xl font-bold text-white/5 font-mono leading-none select-none">
              R
            </span>
          </div>
        </div>
      </div>

      {isPlaying && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Studio reel video player"
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsPlaying(false)}
        >
          <button
            type="button"
            ref={closeButtonRef}
            onClick={() => setIsPlaying(false)}
            aria-label="Close video player"
            className="absolute top-6 right-6 sm:top-10 sm:right-10 w-12 h-12 border-2 border-white/30 flex items-center justify-center text-white hover:border-brand-accent hover:text-brand-accent transition-colors z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
          <div
            className="relative w-full max-w-5xl aspect-video border-4 border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              title="Opusfesta Studio Reel"
              src={STUDIO_REEL_EMBED_URL}
              className="w-full h-full bg-brand-dark"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
