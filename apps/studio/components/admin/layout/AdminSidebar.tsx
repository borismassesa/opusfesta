'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BsGrid1X2, BsInbox, BsCalendar3, BsCalendar2Check, BsClock,
  BsPersonLinesFill, BsCashCoin, BsImages,
  BsHouseDoor, BsPeople, BsImage, BsSearch, BsGear, BsShare,
  BsBoxArrowUpRight, BsBoxArrowRight,
} from 'react-icons/bs';
import type { StudioRole } from '@/lib/studio-types';
import { hasMinimumRole } from '@/lib/admin-auth-client';
import { getContentType } from '@/lib/cms/types';
import { resolveIcon } from '@/lib/cms/icons';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole: StudioRole;
  badge?: 'newInquiries' | 'comingSoon';
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Content types ordered by business value (not registry insertion order).
// Portfolio leads — it is the product. Supporting content follows.
const CONTENT_ORDER = ['project', 'service', 'article', 'testimonial', 'teamMember', 'faq'] as const;

function buildContentItems(): NavItem[] {
  return CONTENT_ORDER
    .map((key) => {
      const ct = getContentType(key);
      if (!ct) return null;
      return {
        label: ct.pluralLabel,
        href: `/studio-admin/cms/${ct.type}`,
        icon: resolveIcon(ct.icon),
        minRole: 'studio_viewer' as StudioRole,
      };
    })
    .filter((x): x is NavItem => x !== null);
}

const navGroups: NavGroup[] = [
  {
    label: 'Today',
    items: [
      { label: 'Dashboard',    href: '/studio-admin',              icon: BsGrid1X2,   minRole: 'studio_viewer' },
      { label: 'Inbox',        href: '/studio-admin/inquiries',    icon: BsInbox,     minRole: 'studio_viewer', badge: 'newInquiries' },
      { label: 'Calendar',     href: '/studio-admin/calendar',     icon: BsCalendar3, minRole: 'studio_viewer' },
      { label: 'Availability', href: '/studio-admin/availability', icon: BsClock,     minRole: 'studio_admin'  },
    ],
  },
  {
    label: 'Clients',
    items: [
      { label: 'Bookings', href: '/studio-admin/bookings', icon: BsCalendar2Check,  minRole: 'studio_viewer' },
      { label: 'Clients',  href: '/studio-admin/clients',  icon: BsPersonLinesFill, minRole: 'studio_viewer' },
      { label: 'Payments', href: '/studio-admin/payments', icon: BsCashCoin,        minRole: 'studio_admin',  badge: 'comingSoon' },
    ],
  },
  {
    label: 'Deliverables',
    items: [
      { label: 'Galleries', href: '/studio-admin/galleries', icon: BsImages, minRole: 'studio_editor', badge: 'comingSoon' },
    ],
  },
  {
    label: 'Website',
    items: [
      ...buildContentItems(),
      { label: 'Media', href: '/studio-admin/media', icon: BsImage, minRole: 'studio_editor' },
    ],
  },
  {
    label: 'Pages',
    items: [
      { label: 'Homepage',   href: '/studio-admin/homepage',   icon: BsHouseDoor, minRole: 'studio_admin' },
      { label: 'About Page', href: '/studio-admin/about-page', icon: BsPeople,    minRole: 'studio_admin' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'SEO',          href: '/studio-admin/seo',          icon: BsSearch, minRole: 'studio_editor' },
      { label: 'Social Media', href: '/studio-admin/social-media', icon: BsShare,  minRole: 'studio_admin'  },
      { label: 'General',      href: '/studio-admin/settings',     icon: BsGear,   minRole: 'studio_admin'  },
    ],
  },
];

export default function AdminSidebar({ role }: { role: StudioRole }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [newInquiries, setNewInquiries] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fetchInquiries = () => {
      fetch('/api/admin/inquiries/new-count')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.count != null) setNewInquiries(d.count); })
        .catch(() => {});
    };
    fetchInquiries();
    const interval = setInterval(fetchInquiries, 60_000);
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

                        {item.badge === 'newInquiries' && newInquiries > 0 && (
                          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold bg-[var(--admin-destructive)] text-white">
                            {newInquiries}
                          </span>
                        )}
                        {item.badge === 'comingSoon' && (
                          <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-[var(--admin-muted)] border border-[var(--admin-sidebar-border)] px-1 py-[1px]">
                            Soon
                          </span>
                        )}
                      </Link>
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
