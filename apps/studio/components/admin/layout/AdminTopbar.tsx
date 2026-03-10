'use client';

import { UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/bookings': 'Bookings',
  '/admin/messages': 'Messages',
  '/admin/projects': 'Projects',
  '/admin/articles': 'Articles',
  '/admin/services': 'Services',
  '/admin/availability': 'Availability',
  '/admin/testimonials': 'Testimonials',
  '/admin/faqs': 'FAQs',
  '/admin/team': 'Team',
  '/admin/media': 'Media Library',
  '/admin/seo': 'SEO',
  '/admin/settings': 'Settings',
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || Object.entries(pageTitles).find(([p]) => pathname.startsWith(p + '/'))?.[1] || 'Admin';

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5" />
        </button>
        <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
      </div>
    </header>
  );
}
