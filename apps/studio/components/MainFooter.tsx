'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

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
                We partner with couples and companies across East Africa to document stories that matter. Cinematic films and high-end photography for the moments you never want to forget.
              </p>
            </div>

            <div className="flex flex-col justify-center space-y-10">
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 font-mono">
                  New Business
                </p>
                <a
                  href="mailto:studio@opusfesta.com"
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-white hover:text-brand-accent transition-colors tracking-tight"
                >
                  studio@opusfesta.com
                </a>
              </div>

              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 font-mono">
                  Phone
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
                  Studio
                </p>
                <p className="text-white/60 text-sm leading-relaxed font-light">
                  Mbezi, Dar es Salaam<br />
                  Tanzania
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 font-mono">
                  Connect
                </p>
                <div className="flex gap-3">
                  <a href="#" className="w-11 h-11 border-4 border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200 shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                    </svg>
                  </a>
                  <a href="#" className="w-11 h-11 border-4 border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200 shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </a>
                  <a href="#" className="w-11 h-11 border-4 border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200 shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect width="4" height="12" x="2" y="9"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                  <a href="#" className="w-11 h-11 border-4 border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200 shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4z"></path>
                      <path d="M22 2 11 13"></path>
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
              <a href="/#work" className="text-[10px] font-mono text-white/30 uppercase tracking-widest hover:text-brand-accent transition-colors">
                Work
              </a>
              <a href="/#services" className="text-[10px] font-mono text-white/30 uppercase tracking-widest hover:text-brand-accent transition-colors">
                Services
              </a>
              <a href="/#process" className="text-[10px] font-mono text-white/30 uppercase tracking-widest hover:text-brand-accent transition-colors">
                Process
              </a>
              <a href="/#testimonials" className="text-[10px] font-mono text-white/30 uppercase tracking-widest hover:text-brand-accent transition-colors">
                Testimonials
              </a>
              <a href="/#faq" className="text-[10px] font-mono text-white/30 uppercase tracking-widest hover:text-brand-accent transition-colors">
                FAQ
              </a>
            </nav>

            <p className="text-[10px] text-white/20 font-mono tracking-wide">
              &copy; {new Date().getFullYear()} OpusFesta Studio. All rights reserved.
            </p>

            <div className="flex gap-6">
              <Link href="/privacy" className="text-[10px] text-white/20 font-mono hover:text-white/50 transition-colors tracking-wide">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[10px] text-white/20 font-mono hover:text-white/50 transition-colors tracking-wide">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
