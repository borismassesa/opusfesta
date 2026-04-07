'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClientAuth } from './ClientAuthProvider';

export default function PortalMobileHeader() {
  const { client, loading } = useClientAuth();
  const pathname = usePathname();

  const isAuthPage =
    pathname.startsWith('/portal/login') || pathname.startsWith('/portal/signup');

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

  if (loading || !client) return null;

  return (
    <header className="lg:hidden border-b-3 border-brand-border bg-brand-dark">
      <div className="px-4 flex items-center justify-between h-14">
        <Link href="/portal" className="font-mono font-bold text-white text-sm tracking-wider">
          OpusStudio
        </Link>
        <div className="flex items-center gap-3">
          {client.avatar_url ? (
            <img
              src={client.avatar_url}
              alt=""
              className="w-7 h-7 border-2 border-white/20 object-cover"
            />
          ) : null}
          <span className="text-xs font-mono text-white/70 max-w-[120px] truncate">
            {client.name || 'Client'}
          </span>
        </div>
      </div>
    </header>
  );
}
