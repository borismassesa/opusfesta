'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useClientAuth } from './ClientAuthProvider';

export default function PortalMobileHeader() {
  const { user, isLoaded } = useUser();
  const { client } = useClientAuth();
  const pathname = usePathname();

  const isAuthPage =
    pathname.startsWith('/portal/login') || pathname.startsWith('/portal/signup');

  // On auth pages, show a simple header with logo + home link
  if (isAuthPage) {
    return (
      <header className="lg:hidden border-b-3 border-brand-border bg-brand-dark">
        <div className="px-4 flex items-center justify-between h-14">
          <Link href="/portal" className="font-mono font-bold text-white text-sm tracking-wider">
            OpusStudio
          </Link>
          <Link
            href="/"
            className="text-white/50 hover:text-brand-accent text-xs font-mono uppercase tracking-wider transition-colors"
          >
            Home
          </Link>
        </div>
      </header>
    );
  }

  if (!isLoaded || !user) return null;

  const displayName = client?.name || user?.fullName || user?.firstName || 'Client';
  const displayAvatar = client?.avatar_url || user?.imageUrl || null;

  return (
    <header className="lg:hidden border-b-3 border-brand-border bg-brand-dark">
      <div className="px-4 flex items-center justify-between h-14">
        <Link href="/portal" className="font-mono font-bold text-white text-sm tracking-wider">
          OpusStudio
        </Link>
        <div className="flex items-center gap-3">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt=""
              className="w-7 h-7 border-2 border-white/20 object-cover"
            />
          ) : null}
          <span className="text-xs font-mono text-white/70 max-w-[120px] truncate">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}
