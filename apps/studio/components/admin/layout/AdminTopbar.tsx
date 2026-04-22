'use client';

import { usePathname } from 'next/navigation';
import { BsBell } from 'react-icons/bs';

interface PageMeta {
  title: string;
  subtitle: string;
}

const pageMeta: Record<string, PageMeta> = {
  // Today
  '/studio-admin':           { title: 'Dashboard', subtitle: 'Your studio at a glance' },
  '/studio-admin/inquiries': { title: 'Inbox',     subtitle: 'Client enquiries waiting for a reply' },
  '/studio-admin/calendar':  { title: 'Calendar',  subtitle: 'Bookings · blackouts · availability' },

  // Clients
  '/studio-admin/bookings':  { title: 'Bookings',  subtitle: 'Every session from request to delivered gallery' },
  '/studio-admin/clients':   { title: 'Clients',   subtitle: 'Client profiles, history, and notes' },
  '/studio-admin/payments':  { title: 'Payments',  subtitle: 'Deposits, balances, and invoices' },

  // Deliverables
  '/studio-admin/galleries': { title: 'Galleries', subtitle: 'Private client photo deliveries' },

  // Website — content
  '/studio-admin/cms/project':     { title: 'Portfolio',    subtitle: 'Portfolio projects shown on the site' },
  '/studio-admin/cms/service':     { title: 'Services',     subtitle: 'Packages, pricing, and offerings' },
  '/studio-admin/cms/article':     { title: 'Articles',     subtitle: 'Journal posts and editorials' },
  '/studio-admin/cms/testimonial': { title: 'Testimonials', subtitle: 'Client reviews and feedback' },
  '/studio-admin/cms/teamMember':  { title: 'Team',         subtitle: 'Staff profiles and roles' },
  '/studio-admin/cms/faq':         { title: 'FAQs',         subtitle: 'Frequently asked questions' },
  '/studio-admin/media':           { title: 'Media Library', subtitle: 'Images and video assets' },

  // Pages
  '/studio-admin/homepage':   { title: 'Homepage',   subtitle: 'Edit homepage sections and content' },
  '/studio-admin/about-page': { title: 'About Page', subtitle: 'Edit the About page story and team' },

  // Settings
  '/studio-admin/availability': { title: 'Availability', subtitle: 'Working hours and blackout dates' },
  '/studio-admin/seo':          { title: 'SEO',          subtitle: 'Search engine and social meta tags' },
  '/studio-admin/social-media': { title: 'Social Media', subtitle: 'Linked social accounts and feeds' },
  '/studio-admin/settings':     { title: 'General',      subtitle: 'Studio info, hours, and contact' },
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const meta =
    pageMeta[pathname] ||
    Object.entries(pageMeta)
      .filter(([p]) => p !== '/studio-admin')
      .find(([p]) => pathname.startsWith(p + '/'))?.[1] ||
    { title: 'Admin', subtitle: 'Studio Operations' };

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[var(--admin-border)] bg-[rgba(255,255,255,0.78)] px-6 backdrop-blur-sm lg:px-8">
      <div>
        <h1 className="text-lg font-bold text-[var(--admin-foreground)] leading-tight">{meta.title}</h1>
        <p className="mt-0.5 text-[12px] text-[var(--admin-muted)]">{meta.subtitle}</p>
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
