'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

interface AboutHeroProps {
  content?: Record<string, unknown>;
}

export default function AboutHero({ content }: AboutHeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const tagline = (content?.tagline as string) || 'About';
  const headingLine1 = (content?.heading_line1 as string) || 'THE TEAM';
  const headingLine2 = (content?.heading_line2 as string) || 'BEHIND THE WORK.';
  const description =
    (content?.description as string) ||
    'OpusStudio is a production company built on long-term collaboration. We combine creative direction, technical execution, and production management to deliver work that is cinematic and commercially effective.';
  const imageUrl = content?.image_url as string | undefined;
  const videoUrl = content?.video_url as string | undefined;

  // Video controls from CMS
  const videoSpeed = Number(content?.video_speed) || 0.5;
  const videoStart = Number(content?.video_start) || 0;
  const videoEnd = Number(content?.video_end) || 0;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set playback speed
    video.playbackRate = videoSpeed;

    // Set start time
    if (videoStart > 0) {
      video.currentTime = videoStart;
    }
  }, [videoSpeed, videoStart]);

  // Handle looping within the time range
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // If videoEnd is set and we've passed it, loop back to start
    if (videoEnd > 0 && video.currentTime >= videoEnd) {
      video.currentTime = videoStart;
    }
  }, [videoStart, videoEnd]);

  return (
    <section className="relative min-h-[70vh] flex items-end overflow-hidden bg-brand-dark border-b-4 border-brand-border">
      {/* Background media */}
      {videoUrl ? (
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={videoEnd > 0 ? handleTimeUpdate : undefined}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-brand-dark/72 pointer-events-none" />
        </div>
      ) : imageUrl ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-brand-dark/72 pointer-events-none" />
        </div>
      ) : null}

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-20 lg:py-28 w-full">
        <div
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-5 block">
            {tagline}
          </span>
        </div>

        <h1
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter text-white leading-[0.9] transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {headingLine1}
          <br />
          <span className="text-stroke-light text-transparent">{headingLine2}</span>
        </h1>

        <div
          className={`transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="w-20 h-1 bg-brand-accent mt-6 mb-6" />
          <p className="max-w-xl text-white/60 text-base lg:text-lg leading-relaxed font-light">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
