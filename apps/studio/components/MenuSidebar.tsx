'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import { usePathname } from 'next/navigation';
import {
  getNavItemId,
  isSectionLink,
  isValidSocialHref,
  sidebarNav,
  socialLinks,
} from '@/lib/navConfig';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  panelId: string;
  headingId: string;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

function SocialIcon({ iconKey }: { iconKey: 'instagram' | 'twitter' | 'linkedin' }) {
  if (iconKey === 'instagram') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
      </svg>
    );
  }

  if (iconKey === 'linkedin') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
        <rect width="4" height="12" x="2" y="9"></rect>
        <circle cx="4" cy="4" r="2"></circle>
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
    </svg>
  );
}

export default function MenuSidebar({
  isOpen,
  onClose,
  panelId,
  headingId,
  returnFocusRef,
}: MenuSidebarProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  const visibleSocialLinks = useMemo(
    () => socialLinks.filter((link) => isValidSocialHref(link.href)),
    []
  );

  const isActive = useCallback(
    (href: string) => {
      if (href === '/') return pathname === '/';
      if (isSectionLink(href)) return pathname === '/';
      return pathname.startsWith(href);
    },
    [pathname]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();
      wasOpenRef.current = true;
      return;
    }

    document.body.style.overflow = '';
    if (wasOpenRef.current) {
      returnFocusRef.current?.focus();
      wasOpenRef.current = false;
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, returnFocusRef]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      if (!panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 motion-reduce:duration-75 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
    >
      <div
        className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm transition-opacity duration-200 motion-reduce:duration-75"
        onClick={onClose}
      />

      <div
        id={panelId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={`absolute left-0 top-0 bottom-0 w-full sm:w-[95%] md:w-[420px] bg-brand-dark transform transition-transform duration-[480ms] motion-reduce:duration-75 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col px-8 sm:px-12 py-8">
          <h2 id={headingId} className="text-xs font-bold uppercase tracking-widest text-white/30 mb-6 font-mono">
            Site navigation
          </h2>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors mb-14 group w-max focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/40"
          >
            <div className="w-8 h-8 border-2 border-white/20 flex items-center justify-center group-hover:border-brand-accent group-hover:bg-brand-accent transition-all duration-200 motion-reduce:duration-75">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"></path>
              </svg>
            </div>
            Close
          </button>

          <nav aria-label="Studio menu" className="flex-1 flex flex-col justify-center -mt-10">
            <div className="space-y-1">
              {sidebarNav.map((link, index) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={getNavItemId(link)}
                    href={link.href}
                    onClick={onClose}
                    className={`group flex items-center gap-4 py-3 min-h-11 transition-all duration-300 motion-reduce:duration-75 ${
                      isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                    } focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/40`}
                    style={{ transitionDelay: isOpen ? `${120 + index * 40}ms` : '0ms' }}
                  >
                    <span className={`text-[10px] font-mono tracking-widest transition-colors duration-200 motion-reduce:duration-75 ${
                      active ? 'text-brand-accent' : 'text-white/20 group-hover:text-brand-accent'
                    }`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className={`text-3xl sm:text-4xl font-bold tracking-tight transition-colors duration-200 motion-reduce:duration-75 ${
                      active ? 'text-white' : 'text-white/30 group-hover:text-white'
                    }`}>
                      {link.label.toUpperCase()}
                    </span>
                    <div className={`h-[2px] flex-1 max-w-[40px] transition-all duration-300 motion-reduce:duration-75 ${
                      active ? 'bg-brand-accent w-full' : 'bg-transparent w-0 group-hover:bg-white/30 group-hover:w-full'
                    }`} />
                  </Link>
                );
              })}
            </div>
          </nav>

          <div
            className={`pt-8 border-t border-white/10 transition-all duration-300 motion-reduce:duration-75 ${
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: isOpen ? '360ms' : '0ms' }}
          >
            {visibleSocialLinks.length > 0 && (
              <>
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">
                  Connect
                </p>
                <div className="flex gap-3 mb-6">
                  {visibleSocialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="w-11 h-11 border-4 border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-brand-accent hover:bg-brand-accent transition-all duration-200 motion-reduce:duration-75 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/40"
                    >
                      <SocialIcon iconKey={link.iconKey} />
                    </a>
                  ))}
                </div>
              </>
            )}
            <p className="text-[10px] font-mono text-white/20 tracking-wide">
              studio@opusfesta.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
