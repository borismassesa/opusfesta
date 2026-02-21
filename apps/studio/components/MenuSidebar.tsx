'use client';

import { useEffect } from 'react';
import { STUDIO_SOCIAL_LINKS } from '@/lib/studio-content';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuSidebar({ isOpen, onClose }: MenuSidebarProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const links = [
    { label: 'HOME', href: '/', active: true },
    { label: 'PORTFOLIO', href: '#work' },
    { label: 'SERVICES', href: '#services' },
    { label: 'PROCESS', href: '#process' },
    { label: 'TESTIMONIALS', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
    { label: 'CONTACT', href: '#contact' },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`absolute left-0 top-0 bottom-0 w-full sm:w-[420px] bg-brand-dark transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col px-8 sm:px-12 py-8">
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors mb-16 group w-max"
          >
            <div className="w-8 h-8 border-2 border-white/20 flex items-center justify-center group-hover:border-brand-accent group-hover:bg-brand-accent transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </div>
            Close
          </button>

          <nav className="flex-1 flex flex-col justify-center -mt-16">
            <div className="space-y-1">
              {links.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={onClose}
                  className={`group flex items-center gap-4 py-3 transition-all duration-300 ${
                    isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  }`}
                  style={{ transitionDelay: isOpen ? `${150 + index * 60}ms` : '0ms' }}
                >
                  <span className={`text-[10px] font-mono tracking-widest transition-colors duration-200 ${
                    link.active ? 'text-brand-accent' : 'text-white/20 group-hover:text-brand-accent'
                  }`}>
                    0{index + 1}
                  </span>
                  <span className={`text-3xl sm:text-4xl font-bold tracking-tight transition-colors duration-200 ${
                    link.active
                      ? 'text-white'
                      : 'text-white/30 group-hover:text-white'
                  }`}>
                    {link.label}
                  </span>
                  <div className={`h-[2px] flex-1 max-w-[40px] transition-all duration-300 ${
                    link.active ? 'bg-brand-accent w-full' : 'bg-transparent w-0 group-hover:bg-white/30 group-hover:w-full'
                  }`} />
                </a>
              ))}
            </div>
          </nav>

          <div className={`pt-8 border-t border-white/10 transition-all duration-500 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: isOpen ? '600ms' : '0ms' }}>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
              Connect
            </p>
            <div className="flex gap-3 mb-6">
              <a href={STUDIO_SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="w-10 h-10 border-4 border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a href={STUDIO_SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-10 h-10 border-4 border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href={STUDIO_SOCIAL_LINKS.x} target="_blank" rel="noreferrer" aria-label="X / Twitter" className="w-10 h-10 border-4 border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
            </div>
            <p className="text-[10px] font-mono text-white/20 tracking-wide">
              studio@opusfesta.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
