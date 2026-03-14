'use client';

import { usePathname } from 'next/navigation';
import { BsBell } from 'react-icons/bs';

const pageTitles: Record<string, string> = {
  '/studio-admin': 'Dashboard',
  '/studio-admin/bookings': 'Bookings',
  '/studio-admin/messages': 'Messages',
  '/studio-admin/projects': 'Projects',
  '/studio-admin/articles': 'Articles',
  '/studio-admin/services': 'Services',
  '/studio-admin/availability': 'Availability',
  '/studio-admin/testimonials': 'Testimonials',
  '/studio-admin/faqs': 'FAQs',
  '/studio-admin/team': 'Team',
  '/studio-admin/media': 'Media Library',
  '/studio-admin/seo': 'SEO',
  '/studio-admin/settings': 'Settings',
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || Object.entries(pageTitles).find(([p]) => pathname.startsWith(p + '/'))?.[1] || 'Admin';

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[var(--admin-border)] bg-[rgba(255,255,255,0.78)] px-6 backdrop-blur-sm lg:px-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--admin-muted)]">Studio Operations</p>
        <h1 className="mt-1 text-lg font-bold text-[var(--admin-foreground)]">{title}</h1>
      </div>
      <button
        className="relative rounded-[calc(var(--admin-radius)-2px)] border border-[var(--admin-border)] bg-[var(--admin-card)] p-2 text-[var(--admin-muted)] transition-colors hover:border-[color:rgba(255,136,0,0.25)] hover:text-[var(--admin-primary)]"
        aria-label="Notifications"
      >
        <BsBell className="w-5 h-5" />
      </button>
    </header>
  );
}
