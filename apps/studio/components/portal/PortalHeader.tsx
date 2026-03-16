'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BsPerson, BsBoxArrowRight, BsCalendar3, BsGear, BsHouseDoor } from 'react-icons/bs';
import { useUser, useClerk } from '@clerk/nextjs';
import { useClientAuth } from './ClientAuthProvider';

const NAV_ITEMS = [
  { href: '/portal', label: 'Bookings', icon: BsCalendar3 },
  { href: '/portal/settings', label: 'Settings', icon: BsGear },
];

export default function PortalHeader() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { client } = useClientAuth();
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith('/portal/login') || pathname.startsWith('/portal/signup');
  const isSignedIn = isLoaded && !!user;
  const displayName = client?.name || user?.fullName || user?.firstName || 'Client';

  return (
    <header className="border-b-3 border-brand-border bg-brand-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          <Link href="/portal" className="flex items-center gap-2">
            <span className="font-mono font-bold text-white text-sm tracking-wider">OpusStudio</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-white/50 hover:text-brand-accent transition-colors text-xs font-mono"
            >
              <BsHouseDoor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            {isSignedIn && !isAuthPage && (
              <>
                <div className="hidden sm:flex items-center gap-2 text-white/70">
                  <BsPerson className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono">{displayName}</span>
                </div>
                <button
                  onClick={() => signOut({ redirectUrl: '/portal/login' })}
                  className="flex items-center gap-1.5 text-white/50 hover:text-brand-accent transition-colors text-xs font-mono"
                >
                  <BsBoxArrowRight className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Nav tabs */}
        {isSignedIn && !isAuthPage && (
          <nav className="flex gap-1 -mb-[3px]">
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-3 transition-colors
                    ${isActive
                      ? 'text-brand-accent border-brand-accent'
                      : 'text-white/50 border-transparent hover:text-white/80 hover:border-white/20'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
