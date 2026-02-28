'use client';

import Link from 'next/link';
import type { RefObject } from 'react';
import { useBookingModal } from '@/components/BookingModalProvider';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  menuControlsId: string;
}

export default function Header({
  onMenuToggle,
  isMenuOpen,
  menuButtonRef,
  menuControlsId,
}: HeaderProps) {
  const { openBookingModal } = useBookingModal();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-bg border-b-4 border-brand-border">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <button
            ref={menuButtonRef}
            onClick={onMenuToggle}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls={menuControlsId}
            className="flex items-center gap-2 sm:gap-3 text-xs font-bold uppercase tracking-widest text-brand-dark hover:text-brand-accent transition-all duration-200 px-2 sm:px-3 py-2 border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 5h16M4 12h16M4 19h16"></path>
            </svg>
            <span className="hidden sm:inline">Menu</span>
          </button>

          <Link
            href="/"
            className="px-3 sm:px-5 h-10 sm:h-12 border-4 border-brand-dark bg-brand-dark text-white flex items-center justify-center font-black text-[10px] sm:text-sm uppercase tracking-widest hover:bg-brand-accent hover:border-brand-accent transition-all duration-200 whitespace-nowrap shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1"
          >
            OpusFesta — Studio
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={() => openBookingModal()}
              className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white bg-brand-accent px-4 py-2 border-2 border-brand-accent shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-dark hover:border-brand-dark transition-all duration-200"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
