'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { coreNavLinks } from '@/lib/navigation';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuSidebar({ isOpen, onClose }: MenuSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

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
        <div className="h-full flex flex-col px-8 sm:px-12 py-8 overflow-hidden">
          <button
            onClick={onClose}
            className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-white/85 hover:text-brand-accent transition-colors mb-10 group w-max"
          >
            <div className="w-8 h-8 border-2 border-white/60 bg-white/10 flex items-center justify-center group-hover:border-brand-accent group-hover:bg-brand-accent transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </div>
            Close
          </button>

          <nav className="flex-1 min-h-0 overflow-y-auto pr-1">
            <div className="space-y-1">
              {coreNavLinks.map((link, index) => {
                const active = isActive(link.href);
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={onClose}
                    className={`group flex items-center gap-4 py-3 transition-all duration-300 ${
                      isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                    }`}
                    style={{ transitionDelay: isOpen ? `${150 + index * 60}ms` : '0ms' }}
                  >
                    <span className={`inline-flex items-center justify-center min-w-7 h-6 px-2 text-[10px] font-bold font-mono tracking-widest border transition-colors duration-200 ${
                      active
                        ? 'text-brand-accent border-brand-accent/60 bg-brand-accent/10'
                        : 'text-white/70 border-white/30 bg-white/5 group-hover:text-brand-accent group-hover:border-brand-accent/60'
                    }`}>
                      0{index + 1}
                    </span>
                    <span className={`text-3xl sm:text-4xl font-bold tracking-tight transition-colors duration-200 ${
                      active
                        ? 'text-white'
                        : 'text-white/30 group-hover:text-white'
                    }`}>
                      {link.label.toUpperCase()}
                    </span>
                    <div className={`h-[2px] flex-1 max-w-[40px] transition-all duration-300 ${
                      active ? 'bg-brand-accent w-full' : 'bg-transparent w-0 group-hover:bg-white/30 group-hover:w-full'
                    }`} />
                  </a>
                );
              })}
            </div>
          </nav>

          <div className={`pt-6 mt-6 shrink-0 border-t border-white/20 transition-all duration-500 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: isOpen ? '350ms' : '0ms' }}>
            <p className="text-[10px] font-mono text-white/70 uppercase tracking-widest mb-4">
              Lets Connect
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <a aria-label="Facebook" href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 border-4 border-white/60 bg-white/10 flex items-center justify-center text-white/90 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13 22v-8h3l1-4h-4V8c0-1.2.3-2 2-2h2V2.5c-.4-.1-1.8-.2-3.4-.2-3.3 0-5.6 2-5.6 5.7V10H5v4h3v8h5z" />
                </svg>
              </a>
              <a aria-label="Instagram" href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 border-4 border-white/60 bg-white/10 flex items-center justify-center text-white/90 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a aria-label="TikTok" href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-10 h-10 border-4 border-white/60 bg-white/10 flex items-center justify-center text-white/90 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.75 2h3a4.5 4.5 0 0 0 4.5 4.5v3a7.5 7.5 0 0 1-4.5-1.5v6.75A6.75 6.75 0 1 1 9 8.03v3.09A3.75 3.75 0 1 0 12.75 14V2z" />
                </svg>
              </a>
              <a aria-label="LinkedIn" href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 border-4 border-white/60 bg-white/10 flex items-center justify-center text-white/90 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a aria-label="YouTube" href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 border-4 border-white/60 bg-white/10 flex items-center justify-center text-white/90 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23 12s0-3-1-4.5c-.6-.8-1.3-1.3-2.2-1.4C16.9 5.8 12 5.8 12 5.8h0s-4.9 0-7.8.3c-.9.1-1.6.6-2.2 1.4C1 9 1 12 1 12s0 3 1 4.5c.6.8 1.3 1.3 2.2 1.4 2.9.3 7.8.3 7.8.3s4.9 0 7.8-.3c.9-.1 1.6-.6 2.2-1.4 1-1.5 1-4.5 1-4.5zM10 15.5v-7l6 3.5-6 3.5z" />
                </svg>
              </a>
            </div>
            <p className="text-[11px] font-mono text-white/85 tracking-wide">
              studio@opusfesta.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
