'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BsGrid,
  BsCalendar3,
  BsChatSquareText,
  BsGear,
  BsHouseDoor,
  BsBoxArrowRight,
  BsPlusLg,
  BsPerson,
} from 'react-icons/bs';
import { useUser, useClerk } from '@clerk/nextjs';
import { useClientAuth } from './ClientAuthProvider';

const NAV_ITEMS = [
  { href: '/portal', label: 'Dashboard', icon: BsGrid, exact: true },
  { href: '/portal/bookings', label: 'Bookings', icon: BsCalendar3 },
  { href: '/portal/messages', label: 'Messages', icon: BsChatSquareText },
  { href: '/portal/settings', label: 'Settings', icon: BsGear },
];

export default function PortalSidebar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { client } = useClientAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll for unread message count
  useEffect(() => {
    if (!user || !client) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/portal/messages');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadTotal || 0);
        }
      } catch { /* ignore */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user, client]);

  const isAuthPage =
    pathname.startsWith('/portal/login') || pathname.startsWith('/portal/signup');

  if (!isLoaded || isAuthPage) return null;

  const isSignedIn = !!user;
  if (!isSignedIn) return null;

  const displayName = client?.name || user?.fullName || user?.firstName || 'Client';
  const displayEmail = client?.email || user?.emailAddresses?.[0]?.emailAddress || '';
  const displayAvatar = client?.avatar_url || user?.imageUrl || null;

  const initials =
    displayName && displayName !== 'Client'
      ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      : displayEmail?.[0]?.toUpperCase() || '?';

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r-3 border-brand-border bg-white">
        {/* Logo */}
        <div className="px-6 py-5 border-b-3 border-brand-border">
          <Link href="/portal" className="font-mono font-bold text-brand-dark text-lg tracking-wider">
            OpusStudio
          </Link>
          <p className="text-[10px] font-mono font-bold text-brand-accent uppercase tracking-[0.2em] mt-0.5">
            Client Portal
          </p>
        </div>

        {/* New booking CTA */}
        <div className="px-4 pt-5 pb-2">
          <Link
            href="/portal/book"
            className="flex items-center justify-center gap-2 w-full border-3 border-brand-border bg-brand-dark text-white px-4 py-2.5 font-mono font-bold text-xs uppercase tracking-wider hover:bg-brand-accent hover:border-brand-accent transition-colors shadow-brutal-sm"
          >
            <BsPlusLg className="w-3 h-3" />
            New Booking
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all
                  ${isActive
                    ? 'bg-brand-dark text-white shadow-brutal-sm'
                    : 'text-brand-muted hover:bg-brand-bg hover:text-brand-dark'
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
                {item.label === 'Messages' && unreadCount > 0 && (
                  <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center bg-brand-accent text-white text-[10px] font-mono font-bold px-1.5">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card + bottom links */}
        <div className="border-t border-brand-border/20 pt-3 pb-4">
          <div className="px-4 pb-3 mb-2 border-b border-brand-border/10">
            <div className="flex items-center gap-3">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt=""
                  className="w-9 h-9 border-2 border-brand-border object-cover shrink-0"
                />
              ) : (
                <div className="w-9 h-9 bg-brand-accent text-white flex items-center justify-center text-xs font-black border-2 border-brand-border shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-mono font-bold text-brand-dark truncate">
                  {displayName}
                </p>
                <p className="text-[10px] font-mono text-brand-muted truncate">
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>
          <div className="px-3 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-muted hover:bg-brand-bg hover:text-brand-dark transition-all"
            >
              <BsHouseDoor className="w-4 h-4 shrink-0" />
              Back to Home
            </Link>
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-all"
            >
              <BsBoxArrowRight className="w-4 h-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-3 border-brand-border flex items-center justify-around px-2 py-2 safe-area-pb">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 transition-colors ${
                isActive ? 'text-brand-accent' : 'text-brand-muted'
              }`}
            >
              <span className="relative">
                <Icon className="w-5 h-5" />
                {item.label === 'Messages' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 inline-flex h-4 min-w-[16px] items-center justify-center bg-brand-accent text-white text-[8px] font-mono font-bold px-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
        <Link
          href="/portal/book"
          className="flex flex-col items-center gap-1 px-3 py-1.5 text-brand-dark"
        >
          <BsPlusLg className="w-5 h-5" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            Book
          </span>
        </Link>
        <Link
          href="/"
          className="flex flex-col items-center gap-1 px-3 py-1.5 text-brand-muted"
        >
          <BsHouseDoor className="w-5 h-5" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            Home
          </span>
        </Link>
        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          className="flex flex-col items-center gap-1 px-3 py-1.5 text-brand-muted"
        >
          <BsPerson className="w-5 h-5" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            Account
          </span>
        </button>
      </nav>
    </>
  );
}
