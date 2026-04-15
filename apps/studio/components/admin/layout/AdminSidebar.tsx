'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BsGrid1X2, BsFolder2Open, BsFileText, BsWrench, BsCalendarCheck,
  BsCalendar3, BsChatSquareText, BsStar, BsQuestionCircle, BsPeople,
  BsImage, BsSearch, BsGear, BsHouseDoor, BsShare, BsBoxArrowUpRight,
  BsBoxArrowRight,
} from 'react-icons/bs';
import type { StudioRole } from '@/lib/studio-types';
import { hasMinimumRole } from '@/lib/admin-auth-client';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole: StudioRole;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard',  href: '/studio-admin',           icon: BsGrid1X2,       minRole: 'studio_viewer' },
      { label: 'Bookings',   href: '/studio-admin/bookings',  icon: BsCalendarCheck, minRole: 'studio_viewer' },
      { label: 'Messages',   href: '/studio-admin/messages',  icon: BsChatSquareText,minRole: 'studio_viewer' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Homepage',     href: '/studio-admin/homepage',     icon: BsHouseDoor,    minRole: 'studio_admin'  },
      { label: 'About Page',   href: '/studio-admin/about-page',   icon: BsPeople,       minRole: 'studio_admin'  },
      { label: 'Portfolio',    href: '/studio-admin/portfolio',    icon: BsFolder2Open,  minRole: 'studio_viewer' },
      { label: 'Articles',     href: '/studio-admin/articles',     icon: BsFileText,     minRole: 'studio_viewer' },
      { label: 'Services',     href: '/studio-admin/services',     icon: BsWrench,       minRole: 'studio_viewer' },
      { label: 'Testimonials', href: '/studio-admin/testimonials', icon: BsStar,         minRole: 'studio_viewer' },
      { label: 'FAQs',         href: '/studio-admin/faqs',         icon: BsQuestionCircle,minRole:'studio_viewer' },
    ],
  },
  {
    label: 'Studio',
    items: [
      { label: 'Availability', href: '/studio-admin/availability', icon: BsCalendar3, minRole: 'studio_viewer' },
      { label: 'Team',         href: '/studio-admin/team',         icon: BsPeople,    minRole: 'studio_viewer' },
      { label: 'Media',        href: '/studio-admin/media',        icon: BsImage,     minRole: 'studio_editor' },
    ],
  },
  {
    label: 'Site',
    items: [
      { label: 'SEO',          href: '/studio-admin/seo',          icon: BsSearch, minRole: 'studio_editor' },
      { label: 'Social Media', href: '/studio-admin/social-media', icon: BsShare,  minRole: 'studio_admin'  },
      { label: 'Settings',     href: '/studio-admin/settings',     icon: BsGear,   minRole: 'studio_admin'  },
    ],
  },
];

export default function AdminSidebar({ role }: { role: StudioRole }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [queueCount, setQueueCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch('/api/admin/bookings/queue')
      .then(r => r.json())
      .then(d => {
        const q = d.queue;
        if (q) setQueueCount(
          (q.needs_qualification?.length || 0) +
          (q.awaiting_deposit?.length || 0) +
          (q.overdue_balances?.length || 0)
        );
      })
      .catch(() => {});

    const fetchUnread = () => {
      fetch('/api/admin/messages/unread')
        .then(r => r.json())
        .then(d => setUnreadMessages(d.total || 0))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="flex h-full w-60 flex-col bg-[var(--admin-sidebar)] border-r border-[var(--admin-sidebar-border)]">

      {/* ── Logo ── */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/studio-admin" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-[var(--admin-primary)] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-white tracking-[0.2em]">OS</span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[var(--admin-foreground)] leading-none tracking-tight">
              OpusStudio
            </p>
            <p className="text-[10px] text-[var(--admin-muted)] mt-0.5 font-mono uppercase tracking-[0.18em]">
              Admin
            </p>
          </div>
        </Link>
      </div>

      <div className="mx-4 h-px bg-[var(--admin-sidebar-border)]" />

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" style={{ scrollbarWidth: 'none' }}>
        {navGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter(item => hasMinimumRole(role, item.minRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className={groupIdx > 0 ? 'mt-5' : ''}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map(item => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/studio-admin' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors duration-100 ${
                          isActive
                            ? 'bg-[var(--admin-primary)]/10 text-[var(--admin-primary)] font-semibold'
                            : 'text-[var(--admin-muted)] hover:bg-[var(--admin-sidebar-accent)] hover:text-[var(--admin-foreground)]'
                        }`}
                      >
                        <Icon className="w-[15px] h-[15px] shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>

                        {item.label === 'Bookings' && queueCount > 0 && (
                          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold bg-[var(--admin-destructive)] text-white">
                            {queueCount}
                          </span>
                        )}
                        {item.label === 'Messages' && unreadMessages > 0 && (
                          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold bg-blue-500 text-white">
                            {unreadMessages}
                          </span>
                        )}
                      </Link>

                      {item.label === 'Bookings' && (
                        <Link
                          href="/studio-admin/bookings/queue"
                          className={`flex items-center gap-2 pl-10 pr-3 py-1.5 text-[12px] transition-colors ${
                            pathname.includes('/bookings/queue')
                              ? 'text-[var(--admin-primary)] font-semibold'
                              : 'text-[var(--admin-muted)] hover:text-[var(--admin-foreground)]'
                          }`}
                        >
                          Queue
                          {queueCount > 0 && (
                            <span className="inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[8px] font-bold bg-[var(--admin-destructive)] text-white">
                              {queueCount}
                            </span>
                          )}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t border-[var(--admin-sidebar-border)] px-3 py-3 space-y-1">
        {/* Live site link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-[7px] text-[12px] font-medium text-[var(--admin-muted)] hover:bg-[var(--admin-sidebar-accent)] hover:text-[var(--admin-foreground)] transition-colors"
        >
          <BsBoxArrowUpRight className="w-[13px] h-[13px] shrink-0" />
          View live site
        </Link>

        <div className="mx-0 h-px bg-[var(--admin-sidebar-border)]" />

        {/* User */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="h-7 w-7 rounded-full bg-[var(--admin-primary)]/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-[var(--admin-primary)]">
              {mounted ? (user?.firstName?.[0] || user?.fullName?.[0] || 'A').toUpperCase() : 'A'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-[var(--admin-foreground)] truncate leading-tight">
              {mounted ? (user?.fullName || user?.firstName || 'Admin') : 'Admin'}
            </p>
            <p className="text-[11px] text-[var(--admin-muted)] truncate leading-tight">
              {mounted ? (user?.primaryEmailAddress?.emailAddress || '') : ''}
            </p>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: '/' })}
            title="Sign out"
            className="shrink-0 p-1.5 text-[var(--admin-muted)] hover:text-[var(--admin-foreground)] hover:bg-[var(--admin-sidebar-accent)] transition-colors"
          >
            <BsBoxArrowRight className="w-[14px] h-[14px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
