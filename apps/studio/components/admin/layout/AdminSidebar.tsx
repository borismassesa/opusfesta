'use client';

import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="px-5 py-5 border-b border-gray-200">
        <Link href="/studio-admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold">OF</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">OpusFesta</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Studio Admin</p>
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
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'bg-brand-accent/10 text-brand-accent' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      <div className="px-5 py-4 border-t border-gray-200">
        {canManageSettings && (
          <Link
            href="/studio-admin/settings"
            className={`mb-3 flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${
              isSettingsActive ? 'bg-brand-accent/10 text-brand-accent' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <BsGear className="w-4 h-4 flex-shrink-0" />
            Settings
          </Link>
        )}
        <div className="mb-4 flex items-center gap-2 px-1">
          <UserButton
            afterSignOutUrl="/"
            appearance={{ elements: { avatarBox: 'w-8 h-8 border border-gray-200' } }}
          />
          <span className="text-xs font-medium text-gray-600">Profile</span>
        </div>
        <Link href="/" target="_blank" className="text-xs text-gray-400 hover:text-brand-accent transition-colors">
          View live site &rarr;
        </Link>
      </div>
    </aside>
  );
}
