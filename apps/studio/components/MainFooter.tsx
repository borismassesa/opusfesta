'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { coreNavLinks } from '@/lib/navigation';
import SocialLinks from '@/components/SocialLinks';

export default function MainFooter() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer id="contact" ref={footerRef} className="bg-brand-dark relative z-10 overflow-hidden">
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none select-none">
        <div className="text-center text-[40px] sm:text-[70px] md:text-[100px] lg:text-[140px] xl:text-[180px] font-bold text-white/[0.04] leading-none tracking-tighter pb-6 sm:pb-8 lg:pb-10">
          OpusFesta Studio
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className={`py-20 lg:py-28 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
            <div>
              <span className="text-xs font-bold text-brand-accent tracking-widest uppercase font-mono mb-8 block">
                Get In Touch
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-[0.9] mb-8">
                LET&apos;S WORK<br />
                <span className="text-stroke-light">TOGETHER.</span>
              </h2>
              <p className="text-white/40 text-base sm:text-lg leading-relaxed max-w-md font-light">
                We partner with brands, artists, and teams to produce cinematic campaigns, documentaries, and content systems built for real outcomes.
              </p>
            </div>

            <div className="flex flex-col justify-center space-y-10">
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 font-mono">
                  Office Address
                </p>
                <p className="text-white text-xl sm:text-2xl leading-relaxed font-bold tracking-tight">
                  Plot 185C, RM A25, Samaki Wabichi Annex,
                  <br />
                  Mbezi Beach, Dar es Salaam, Tanzania
                  <br />
                  P.O.Box 7787
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 font-mono">
                  Phone Number
                </p>
                <a
                  href="tel:+255799242475"
                  className="text-xl sm:text-2xl font-bold text-white hover:text-brand-accent transition-colors tracking-tight"
                >
                  +255 799 242 475
                </a>
              </div>

              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 font-mono">
                  Email Address
                </p>
                <a
                  href="mailto:studio@opusfesta.com"
                  className="text-xl sm:text-2xl font-bold text-white hover:text-brand-accent transition-colors tracking-tight"
                >
                  studio@opusfesta.com
                </a>
              </div>

              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 font-mono">
                  Lets Connect
                </p>
                <SocialLinks
                  linkClassName="inline-flex h-11 w-11 items-center justify-center border-2 border-white/35 text-white/90 transition-all duration-200 shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:border-brand-accent hover:bg-brand-accent hover:text-white hover:shadow-none"
                  iconClassName="h-[19px] w-[19px] shrink-0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`py-10 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {coreNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-mono text-white/85 uppercase tracking-widest hover:text-brand-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="text-[11px] text-white/65 font-mono tracking-wide">
              &copy; {new Date().getFullYear()} OpusFesta Studio. All rights reserved.
            </p>

            <div className="flex gap-6">
              <Link href="/privacy" className="text-[11px] text-white/75 font-mono hover:text-brand-accent transition-colors tracking-wide">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[11px] text-white/75 font-mono hover:text-brand-accent transition-colors tracking-wide">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
