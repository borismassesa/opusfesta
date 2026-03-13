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
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Notifications">
        <BsBell className="w-5 h-5" />
      </button>
    </header>
  );
}
