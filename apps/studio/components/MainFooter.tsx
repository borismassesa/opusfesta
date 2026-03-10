'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { coreNavLinks } from '@/lib/navigation';

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
                <div className="flex flex-wrap gap-3">
                  <a aria-label="Facebook" href="https://facebook.com" target="_blank" rel="noreferrer" className="w-11 h-11 border-4 border-white/35 flex items-center justify-center text-white/90 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200 shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M13 22v-8h3l1-4h-4V8c0-1.2.3-2 2-2h2V2.5c-.4-.1-1.8-.2-3.4-.2-3.3 0-5.6 2-5.6 5.7V10H5v4h3v8h5z" />
                    </svg>
                  </a>
                  <a aria-label="Instagram" href="https://instagram.com" target="_blank" rel="noreferrer" className="w-11 h-11 border-4 border-white/35 flex items-center justify-center text-white/90 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200 shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                    </svg>
                  </a>
                  <a aria-label="TikTok" href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-11 h-11 border-4 border-white/35 flex items-center justify-center text-white/90 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200 shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12.75 2h3a4.5 4.5 0 0 0 4.5 4.5v3a7.5 7.5 0 0 1-4.5-1.5v6.75A6.75 6.75 0 1 1 9 8.03v3.09A3.75 3.75 0 1 0 12.75 14V2z" />
                    </svg>
                  </a>
                  <a aria-label="LinkedIn" href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-11 h-11 border-4 border-white/35 flex items-center justify-center text-white/90 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200 shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect width="4" height="12" x="2" y="9"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                  <a aria-label="YouTube" href="https://youtube.com" target="_blank" rel="noreferrer" className="w-11 h-11 border-4 border-white/35 flex items-center justify-center text-white/90 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200 shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M23 12s0-3-1-4.5c-.6-.8-1.3-1.3-2.2-1.4C16.9 5.8 12 5.8 12 5.8h0s-4.9 0-7.8.3c-.9.1-1.6.6-2.2 1.4C1 9 1 12 1 12s0 3 1 4.5c.6.8 1.3 1.3 2.2 1.4 2.9.3 7.8.3 7.8.3s4.9 0 7.8-.3c.9-.1 1.6-.6 2.2-1.4 1-1.5 1-4.5 1-4.5zM10 15.5v-7l6 3.5-6 3.5z" />
                    </svg>
                  </a>
                </div>
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
