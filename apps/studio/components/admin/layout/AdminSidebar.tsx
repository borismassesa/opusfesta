'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FolderOpen, FileText, Wrench, CalendarCheck,
  CalendarDays, MessageSquare, Star, HelpCircle, Users, Image,
  Search, Settings,
} from 'lucide-react';
import type { StudioRole } from '@/lib/studio-types';
import { hasMinimumRole } from '@/lib/admin-auth-client';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  minRole: StudioRole;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, minRole: 'studio_viewer' },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck, minRole: 'studio_viewer' },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare, minRole: 'studio_viewer' },
  { label: 'Projects', href: '/admin/projects', icon: FolderOpen, minRole: 'studio_viewer' },
  { label: 'Articles', href: '/admin/articles', icon: FileText, minRole: 'studio_viewer' },
  { label: 'Services', href: '/admin/services', icon: Wrench, minRole: 'studio_viewer' },
  { label: 'Availability', href: '/admin/availability', icon: CalendarDays, minRole: 'studio_viewer' },
  { label: 'Testimonials', href: '/admin/testimonials', icon: Star, minRole: 'studio_viewer' },
  { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle, minRole: 'studio_viewer' },
  { label: 'Team', href: '/admin/team', icon: Users, minRole: 'studio_viewer' },
  { label: 'Media', href: '/admin/media', icon: Image, minRole: 'studio_editor' },
  { label: 'SEO', href: '/admin/seo', icon: Search, minRole: 'studio_editor' },
  { label: 'Settings', href: '/admin/settings', icon: Settings, minRole: 'studio_admin' },
];

export default function AdminSidebar({ role }: { role: StudioRole }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="px-5 py-5 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2">
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
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
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
        <Link href="/" target="_blank" className="text-xs text-gray-400 hover:text-brand-accent transition-colors">
          View live site &rarr;
        </Link>
      </div>
    </aside>
  );
}
