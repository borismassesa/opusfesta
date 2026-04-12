'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { BsPerson, BsGrid, BsGear, BsBoxArrowRight, BsCalendar } from 'react-icons/bs';
import { useBookingModal } from '@/components/BookingModalProvider';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { openBookingModal } = useBookingModal();
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [clientAvatar, setClientAvatar] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch client profile avatar when signed in
  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/portal/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.client?.avatar_url) setClientAvatar(data.client.avatar_url);
      })
      .catch(() => {});
  }, [isSignedIn]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.firstName
      ? user.firstName[0].toUpperCase()
      : user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || '?';

  const displayName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Account';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-brand-bg border-b-4 border-brand-border">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
        <div className="relative flex items-center h-20">
          <button
            onClick={onMenuToggle}
            aria-label="Menu"
            className="flex items-center gap-2 sm:gap-3 text-xs font-bold uppercase tracking-widest text-brand-dark hover:text-brand-accent transition-all duration-200 px-2 sm:px-3 py-2 border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1"
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
            className="absolute left-1/2 -translate-x-1/2 px-3 sm:px-5 h-10 sm:h-12 border-4 border-brand-dark bg-brand-dark text-white flex items-center justify-center font-black text-[10px] sm:text-sm uppercase tracking-widest whitespace-nowrap shadow-brutal-sm"
          >
            OpusStudio
          </Link>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            {/* Show skeleton while Clerk loads */}
            {!isLoaded ? (
              <div className="w-20 h-8 bg-brand-border/20 animate-pulse" />
            ) : isSignedIn ? (
              <>
                {/* Book Now button */}
                <button
                  onClick={() => openBookingModal()}
                  className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white bg-brand-accent px-4 py-2 border-2 border-brand-accent shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-dark hover:border-brand-dark transition-all duration-200"
                >
                  Book Now
                </button>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-dark hover:text-brand-accent transition-all duration-200 px-2 sm:px-3 py-1.5 border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                  >
                    {(clientAvatar || user?.imageUrl) ? (
                      <img
                        src={clientAvatar || user?.imageUrl || ''}
                        alt=""
                        className="w-6 h-6 border-2 border-brand-dark object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-brand-accent text-white flex items-center justify-center text-[10px] font-black border-2 border-brand-dark">
                        {initials}
                      </div>
                    )}
                    <span className="hidden sm:inline max-w-[100px] truncate">
                      {displayName}
                    </span>
                    <svg
                      className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border-3 border-brand-border shadow-brutal z-50">
                      <div className="px-4 py-3 border-b-2 border-brand-border/30">
                        <p className="text-xs font-mono font-bold text-brand-dark truncate">
                          {user?.fullName || displayName}
                        </p>
                        <p className="text-[10px] font-mono text-brand-muted truncate">
                          {user?.emailAddresses?.[0]?.emailAddress}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/portal"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-dark hover:bg-brand-bg hover:text-brand-accent transition-colors"
                        >
                          <BsGrid className="w-3.5 h-3.5" />
                          My Portal
                        </Link>
                        <Link
                          href="/portal/bookings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-dark hover:bg-brand-bg hover:text-brand-accent transition-colors"
                        >
                          <BsCalendar className="w-3.5 h-3.5" />
                          My Bookings
                        </Link>
                        <Link
                          href="/portal/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-dark hover:bg-brand-bg hover:text-brand-accent transition-colors"
                        >
                          <BsGear className="w-3.5 h-3.5" />
                          Settings
                        </Link>
                      </div>
                      <div className="border-t-2 border-brand-border/30 py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            signOut({ redirectUrl: '/' });
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <BsBoxArrowRight className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Not signed in */}
                <Link
                  href="/portal/login"
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-dark hover:text-brand-accent transition-all duration-200 px-3 py-2 border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  <BsPerson className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
                <Link
                  href="/portal/signup"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white bg-brand-dark px-3 py-2 border-2 border-brand-dark shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-accent hover:border-brand-accent transition-all duration-200"
                >
                  Sign Up
                </Link>
                <button
                  onClick={() => openBookingModal()}
                  className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white bg-brand-accent px-4 py-2 border-2 border-brand-accent shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 hover:bg-brand-dark hover:border-brand-dark transition-all duration-200"
                >
                  Book Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
