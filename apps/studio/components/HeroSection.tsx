'use client';

import { useRef, useEffect, useState } from 'react';

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionPreference = () => {
      const reduce = mediaQuery.matches;
      setPrefersReducedMotion(reduce);
      if (reduce) {
        setIsHeroVisible(true);
      }
    };

    handleMotionPreference();

    const revealTimer = window.setTimeout(() => {
      setIsHeroVisible(true);
    }, 120);

    mediaQuery.addEventListener('change', handleMotionPreference);

    const videoElement = videoRef.current;
    if (videoElement && !mediaQuery.matches) {
      videoElement.play().catch(() => {});
    }

    return () => {
      window.clearTimeout(revealTimer);
      mediaQuery.removeEventListener('change', handleMotionPreference);
    };
  }, []);

  return (
    <section className="relative h-screen flex flex-col justify-center overflow-hidden border-b-4 border-brand-border bg-brand-dark">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="hero-video-depth absolute top-0 right-0 w-full h-full object-cover opacity-90"
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-scrim-horizontal absolute inset-0 pointer-events-none" />
        <div className="hero-scrim-vertical absolute inset-0 pointer-events-none" />
        <div className="hero-scrim-radial absolute inset-0 pointer-events-none" />
      </div>

      <div className="lg:px-12 grid grid-cols-1 lg:grid-cols-12 w-full max-w-[1920px] z-10 mr-auto ml-auto pt-16 pr-6 pb-8 pl-6 lg:pt-20 lg:pb-12 relative gap-x-8 gap-y-4 items-center">
        <div className="lg:col-span-8">
          <span
            className={`hero-kicker inline-block py-1 px-2 sm:px-3 border border-white/60 text-white mb-2 sm:mb-3 lg:mb-4 ${
              isHeroVisible || prefersReducedMotion ? 'hero-reveal' : 'opacity-0 translate-y-4'
            }`}
            style={isHeroVisible && !prefersReducedMotion ? { animationDelay: '40ms' } : undefined}
          >
            Now Booking Weddings & Events 2025
          </span>
          <h1 className="hero-title hero-text-glow font-bold text-white mb-2 sm:mb-3 lg:mb-4">
            <span
              className={`inline-block ${isHeroVisible || prefersReducedMotion ? 'hero-reveal' : 'opacity-0 translate-y-4'}`}
              style={isHeroVisible && !prefersReducedMotion ? { animationDelay: '120ms' } : undefined}
            >
              CINEMATIC
            </span>
            <br />
            <span
              className={`stroke-text stroke-text-light stroke-fill-none stroke-interactive inline-block ${
                isHeroVisible || prefersReducedMotion ? 'hero-reveal' : 'opacity-0 translate-y-4'
              }`}
              style={isHeroVisible && !prefersReducedMotion ? { animationDelay: '210ms' } : undefined}
            >
              VISUAL
            </span>{' '}
            <span
              className={`stroke-text stroke-text-light stroke-fill-none stroke-interactive inline-block ${
                isHeroVisible || prefersReducedMotion ? 'hero-reveal' : 'opacity-0 translate-y-4'
              }`}
              style={isHeroVisible && !prefersReducedMotion ? { animationDelay: '300ms' } : undefined}
            >
              STORIES
            </span>
          </h1>
          <div
            className={`w-16 sm:w-20 lg:w-24 h-1 bg-brand-accent mb-2 sm:mb-3 lg:mb-4 ${
              isHeroVisible || prefersReducedMotion ? 'hero-reveal' : 'opacity-0 translate-y-4'
            }`}
            style={isHeroVisible && !prefersReducedMotion ? { animationDelay: '380ms' } : undefined}
          />
          <p
            className={`hero-subcopy hero-text-glow text-white/75 max-w-md lg:max-w-lg font-light ${
              isHeroVisible || prefersReducedMotion ? 'hero-reveal' : 'opacity-0 translate-y-4'
            }`}
            style={isHeroVisible && !prefersReducedMotion ? { animationDelay: '460ms' } : undefined}
          >
            We capture the raw emotion of weddings, the energy of live events, and the professional essence of corporate milestones. Timeless photography and cinematic film—all crafted with a signature edge.
          </p>
          <div
            className={`mt-4 sm:mt-5 lg:mt-6 flex flex-col sm:flex-row gap-3 ${
              isHeroVisible || prefersReducedMotion ? 'hero-reveal' : 'opacity-0 translate-y-4'
            }`}
            style={isHeroVisible && !prefersReducedMotion ? { animationDelay: '540ms' } : undefined}
          >
            <a
              href="#work"
              className="hero-cta hero-cta-primary inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest border border-brand-accent bg-brand-accent text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/50"
            >
              Explore Portfolio
              <span aria-hidden="true" className="hero-cta-icon">→</span>
            </a>
            <a
              href="#services"
              className="hero-cta hero-cta-secondary inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest border border-white/45 text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/50"
            >
              View Pricing
              <span aria-hidden="true" className="hero-cta-icon">→</span>
            </a>
          </div>
          <div
            className={`mt-5 sm:mt-6 flex items-center gap-4 ${
              isHeroVisible || prefersReducedMotion ? 'hero-reveal' : 'opacity-0 translate-y-4'
            }`}
            style={isHeroVisible && !prefersReducedMotion ? { animationDelay: '620ms' } : undefined}
          >
            <div className="flex -space-x-2.5">
              {[
                'https://randomuser.me/api/portraits/men/32.jpg',
                'https://randomuser.me/api/portraits/women/44.jpg',
                'https://randomuser.me/api/portraits/men/75.jpg',
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Client"
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
