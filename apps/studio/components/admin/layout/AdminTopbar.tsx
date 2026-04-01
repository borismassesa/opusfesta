'use client';

import { usePathname } from 'next/navigation';
import { BsBell } from 'react-icons/bs';

interface PageMeta {
  title: string;
  subtitle: string;
}

const pageMeta: Record<string, PageMeta> = {
  '/studio-admin': { title: 'Dashboard', subtitle: 'Studio command center' },
  '/studio-admin/bookings': { title: 'Bookings', subtitle: 'Client bookings & pipeline' },
  '/studio-admin/messages': { title: 'Messages', subtitle: 'Client inquiries & conversations' },
  '/studio-admin/homepage': { title: 'Homepage', subtitle: 'Edit homepage sections & content' },
  '/studio-admin/portfolio': { title: 'Portfolio', subtitle: 'Portfolio & gallery items' },
  '/studio-admin/articles': { title: 'Articles', subtitle: 'Journal blog posts' },
  '/studio-admin/services': { title: 'Services', subtitle: 'Service packages & pricing' },
  '/studio-admin/availability': { title: 'Availability', subtitle: 'Calendar & working hours' },
  '/studio-admin/testimonials': { title: 'Testimonials', subtitle: 'Client reviews & feedback' },
  '/studio-admin/faqs': { title: 'FAQs', subtitle: 'Frequently asked questions' },
  '/studio-admin/team': { title: 'Team', subtitle: 'Staff profiles & roles' },
  '/studio-admin/media': { title: 'Media Library', subtitle: 'Images & video uploads' },
  '/studio-admin/seo': { title: 'SEO', subtitle: 'Search engine & social meta tags' },
  '/studio-admin/settings': { title: 'Settings', subtitle: 'Studio info & social links' },
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const meta = pageMeta[pathname] || Object.entries(pageMeta).find(([p]) => pathname.startsWith(p + '/'))?.[1] || { title: 'Admin', subtitle: 'Studio Operations' };

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[var(--admin-border)] bg-[rgba(255,255,255,0.78)] px-6 backdrop-blur-sm lg:px-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--admin-muted)]">{meta.subtitle}</p>
        <h1 className="mt-0.5 text-lg font-bold text-[var(--admin-foreground)]">{meta.title}</h1>
      </div>
      <button
        className="relative rounded-[calc(var(--admin-radius)-2px)] border border-[var(--admin-border)] bg-[var(--admin-card)] p-2 text-[var(--admin-muted)] transition-colors hover:border-[color:rgba(214,73,42,0.25)] hover:text-[var(--admin-primary)]"
        aria-label="Notifications"
      >
        <BsBell className="w-5 h-5" />
      </button>
    </header>
  );
}
