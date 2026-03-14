'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BsGrid1X2, BsFolder2Open, BsFileText, BsWrench, BsCalendarCheck, BsCalendar3, BsChatSquareText, BsStar, BsQuestionCircle, BsPeople, BsImage, BsSearch, BsGear } from 'react-icons/bs';
import type { StudioRole } from '@/lib/studio-types';
import { hasMinimumRole } from '@/lib/admin-auth-client';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole: StudioRole;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/studio-admin', icon: BsGrid1X2, minRole: 'studio_viewer' },
  { label: 'Bookings', href: '/studio-admin/bookings', icon: BsCalendarCheck, minRole: 'studio_viewer' },
  { label: 'Messages', href: '/studio-admin/messages', icon: BsChatSquareText, minRole: 'studio_viewer' },
  { label: 'Projects', href: '/studio-admin/projects', icon: BsFolder2Open, minRole: 'studio_viewer' },
  { label: 'Articles', href: '/studio-admin/articles', icon: BsFileText, minRole: 'studio_viewer' },
  { label: 'Services', href: '/studio-admin/services', icon: BsWrench, minRole: 'studio_viewer' },
  { label: 'Availability', href: '/studio-admin/availability', icon: BsCalendar3, minRole: 'studio_viewer' },
  { label: 'Testimonials', href: '/studio-admin/testimonials', icon: BsStar, minRole: 'studio_viewer' },
  { label: 'FAQs', href: '/studio-admin/faqs', icon: BsQuestionCircle, minRole: 'studio_viewer' },
  { label: 'Team', href: '/studio-admin/team', icon: BsPeople, minRole: 'studio_viewer' },
  { label: 'Media', href: '/studio-admin/media', icon: BsImage, minRole: 'studio_editor' },
  { label: 'SEO', href: '/studio-admin/seo', icon: BsSearch, minRole: 'studio_editor' },
];

export default function AdminSidebar({ role }: { role: StudioRole }) {
  const pathname = usePathname();
  const canManageSettings = hasMinimumRole(role, 'studio_admin');
  const isSettingsActive = pathname === '/studio-admin/settings' || pathname.startsWith('/studio-admin/settings/');
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    fetch('/api/admin/bookings/queue')
      .then(r => r.json())
      .then(d => {
        const q = d.queue;
        if (q) setQueueCount((q.needs_qualification?.length || 0) + (q.awaiting_deposit?.length || 0) + (q.overdue_balances?.length || 0));
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar)] text-[var(--admin-sidebar-foreground)]">
      <div className="border-b border-[var(--admin-sidebar-border)] px-5 py-6">
        <Link href="/studio-admin" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-[calc(var(--admin-radius)-2px)] bg-[var(--admin-primary)] text-[var(--admin-primary-foreground)] shadow-[var(--admin-shadow-sm)]">
            <span className="text-xs font-bold tracking-[0.24em]">OF</span>
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-[var(--admin-foreground)]">OpusFesta</p>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[color:rgba(51,51,51,0.56)]">Studio Admin</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems
            .filter((item) => hasMinimumRole(role, item.minRole))
            .map((item) => {
              const isActive = pathname === item.href || (item.href !== '/studio-admin' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-accent)] text-[var(--admin-sidebar-accent-foreground)] shadow-[var(--admin-shadow-sm)]'
                        : 'text-[color:rgba(51,51,51,0.72)] hover:bg-[var(--admin-secondary)] hover:text-[var(--admin-foreground)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                    {item.label === 'Bookings' && queueCount > 0 && (
                      <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {queueCount}
                      </span>
                    )}
                  </Link>
                  {item.label === 'Bookings' && (
                    <Link
                      href="/admin/bookings/queue"
                      className={`ml-7 flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                        pathname.includes('/bookings/queue')
                          ? 'text-[var(--admin-sidebar-accent-foreground)] font-bold'
                          : 'text-[color:rgba(51,51,51,0.56)] hover:text-[var(--admin-foreground)]'
                      }`}
                    >
                      Queue
                      {queueCount > 0 && (
                        <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                          {queueCount}
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
        </ul>
      </nav>

      <div className="border-t border-[var(--admin-sidebar-border)] bg-[rgba(255,255,255,0.55)] px-5 py-4 backdrop-blur-sm">
        {canManageSettings && (
          <Link
            href="/studio-admin/settings"
            className={`mb-3 flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
              isSettingsActive
                ? 'border border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar-accent)] text-[var(--admin-sidebar-accent-foreground)] shadow-[var(--admin-shadow-sm)]'
                : 'text-[color:rgba(51,51,51,0.72)] hover:bg-[var(--admin-secondary)] hover:text-[var(--admin-foreground)]'
            }`}
          >
            <BsGear className="w-4 h-4 flex-shrink-0" />
            Settings
          </Link>
        )}
        <div className="mb-4 flex items-center gap-2 px-1">
          <UserButton
            afterSignOutUrl="/"
            appearance={{ elements: { avatarBox: 'h-8 w-8 border border-[var(--admin-sidebar-border)] shadow-none' } }}
          />
          <span className="text-xs font-medium text-[color:rgba(51,51,51,0.78)]">Profile</span>
        </div>
        <Link href="/" target="_blank" className="text-xs text-[color:rgba(51,51,51,0.52)] transition-colors hover:text-[var(--admin-primary)]">
          View live site &rarr;
        </Link>
      </div>
    </aside>
  );
}
