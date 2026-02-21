'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);

    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    if (videoRef.current && !reducedMotion) {
      videoRef.current.play().catch(() => {});
    }
  }, [reducedMotion]);

  return (
    <section className="relative h-screen flex flex-col justify-center overflow-hidden border-b-4 border-brand-border bg-brand-dark">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute top-0 right-0 w-full h-full object-cover opacity-90"
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark from-0% via-brand-dark/80 via-30% to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent pointer-events-none"></div>
      </div>

      <div className="lg:px-12 grid grid-cols-1 lg:grid-cols-12 w-full max-w-[1920px] z-10 mr-auto ml-auto pt-16 pr-6 pb-8 pl-6 lg:pt-20 lg:pb-12 relative gap-x-8 gap-y-4 items-center">
        <div className="lg:col-span-8">
          <span className="inline-block py-1 px-2 sm:px-3 border border-white/60 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-2 sm:mb-3 lg:mb-4">
            Now Booking Weddings & Events 2025
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[9rem] leading-[0.9] font-bold tracking-tighter text-white mb-2 sm:mb-3 lg:mb-4">
            <span className="inline-block hover:text-brand-accent hover:-translate-y-1 transition-all duration-300 cursor-default">CINEMATIC</span>
            <br />
            <span className="text-stroke-light text-transparent hover:text-brand-accent hover:-translate-y-1 transition-all duration-300 cursor-default inline-block">VISUAL</span>{' '}
            <span className="text-stroke-light text-transparent hover:text-brand-accent hover:-translate-y-1 transition-all duration-300 cursor-default inline-block">STORIES</span>
          </h1>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-brand-accent mb-2 sm:mb-3 lg:mb-4"></div>
          <p className="text-white/60 text-sm sm:text-base lg:text-lg max-w-md lg:max-w-lg leading-relaxed font-light">
            We capture the raw emotion of weddings, the energy of live events, and the professional essence of corporate milestones. Timeless photography and cinematic film—all crafted with a signature edge.
          </p>
          <div className="mt-4 sm:mt-5 lg:mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href="#work"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 bg-brand-accent text-white text-[10px] sm:text-xs font-semibold uppercase tracking-widest transition-all duration-300 hover:bg-brand-secondary"
            >
              Explore Portfolio
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 text-white text-[10px] sm:text-xs font-semibold uppercase tracking-widest border border-white/30 transition-all duration-300 hover:border-white hover:bg-white/10"
            >
              View Pricing
            </a>
          </div>
          <div className="mt-5 sm:mt-6 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {[
                'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/df748c19-7840-497b-84a2-85f34b0da910_320w.webp',
                'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c6ec4622-d827-4c9e-9744-0c24c81f9515_320w.webp',
                'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/c8e30b9a-d4b3-47aa-9b4c-9f7d54f25460_320w.webp',
              ].map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt="Client"
                  width={40}
                  height={40}
                  loading="lazy"
                  className="avatar-circle w-9 h-9 sm:w-10 sm:h-10 object-cover border-2 border-white/20 grayscale hover:grayscale-0 transition-all duration-300"
                />
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-white/50 text-[10px] sm:text-xs font-light">Trusted by</span>
              <span className="text-white text-sm sm:text-base font-bold tracking-tight">500+ Clients</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
