'use client';

import { useEffect, useRef, useCallback } from 'react';

interface HeroSectionProps {
  content?: Record<string, unknown>;
}

export default function HeroSection({ content }: HeroSectionProps) {
  const tagline = (content?.tagline as string) || 'Full-Service Production Studio';
  const headingLine1 = (content?.heading_line1 as string) || 'CINEMATIC';
  const headingLine2 = (content?.heading_line2 as string) || 'VISUAL STORIES';
  const description = (content?.description as string) || 'We produce commercial films, documentaries, music videos, and branded campaigns from concept through final delivery.';
  const videoUrl = (content?.video_url as string) || '/videos/hero-bg.mp4';
  const cta1Text = (content?.cta1_text as string) || 'Explore Journal';
  const cta1Url = (content?.cta1_url as string) || '/journal';
  const cta2Text = (content?.cta2_text as string) || 'View Services';
  const cta2Url = (content?.cta2_url as string) || '/services';
  const clientCount = (content?.client_count as string) || '500+ Clients';
  const clientAvatars = (content?.client_avatars as string[]) || [
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/men/75.jpg',
  ];

  // Video controls from CMS
  const videoSpeed = Number(content?.video_speed) || 0.5;
  const videoStart = Number(content?.video_start) || 0;
  const videoEnd = Number(content?.video_end) || 0;

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = videoSpeed;
    if (videoStart > 0) video.currentTime = videoStart;
    video.play().catch(() => {});
  }, [videoSpeed, videoStart]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (videoEnd > 0 && video.currentTime >= videoEnd) {
      video.currentTime = videoStart;
    }
  }, [videoStart, videoEnd]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
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
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={videoEnd > 0 ? handleTimeUpdate : undefined}
            className="absolute top-0 right-0 w-full h-full object-cover opacity-90"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark from-0% via-brand-dark/80 via-30% to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent pointer-events-none"></div>
      </div>

      <div className="lg:px-12 grid grid-cols-1 lg:grid-cols-12 w-full max-w-[1920px] z-10 mr-auto ml-auto pt-16 pr-6 pb-8 pl-6 lg:pt-20 lg:pb-12 relative gap-x-8 gap-y-4 items-center">
        <div className="lg:col-span-8">
          <span className="inline-block py-1 px-2 sm:px-3 border border-white/60 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-2 sm:mb-3 lg:mb-4">
            {tagline}
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[9rem] leading-[0.9] font-bold tracking-tighter text-white mb-2 sm:mb-3 lg:mb-4">
            <span className="inline-block hover:text-brand-accent hover:-translate-y-1 transition-all duration-300 cursor-default">{headingLine1}</span>
            <br />
            {headingLine2.split(' ').map((word, i) => (
              <span key={i} className="text-stroke-light text-transparent hover:text-brand-accent hover:-translate-y-1 transition-all duration-300 cursor-default inline-block">{word}{i < headingLine2.split(' ').length - 1 ? '\u00A0' : ''}</span>
            ))}
          </h1>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-brand-accent mb-2 sm:mb-3 lg:mb-4"></div>
          <p className="text-white/60 text-sm sm:text-base lg:text-lg max-w-md lg:max-w-lg leading-relaxed font-light">
            {description}
          </p>
          <div className="mt-4 sm:mt-5 lg:mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={cta1Url}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 bg-brand-accent text-white text-[10px] sm:text-xs font-semibold uppercase tracking-widest transition-all duration-300 hover:bg-brand-secondary"
            >
              {cta1Text}
            </a>
            <a
              href={cta2Url}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 text-white text-[10px] sm:text-xs font-semibold uppercase tracking-widest border border-white/30 transition-all duration-300 hover:border-white hover:bg-white/10"
            >
              {cta2Text}
            </a>
          </div>
          <div className="mt-5 sm:mt-6 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {clientAvatars.map((src, i) => (
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
              <span className="text-white text-sm sm:text-base font-bold tracking-tight">{clientCount}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
