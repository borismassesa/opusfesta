'use client'

import Link from "next/link";
import { Bell, ChevronRight, HelpCircle } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  cms: 'Website CMS',
  homepage: 'Homepage',
  hero: 'Hero',
  vendors: 'Vendors',
  'planning-tools': 'Planning Tools',
  'advice-and-ideas': 'Advice & Ideas',
  'attire-and-rings': 'Attire & Rings',
  guests: 'Guests',
  'wedding-websites': 'Wedding Websites',
  pages: 'Pages',
  media: 'Media Library',
  forms: 'Forms',
  taxonomy: 'Categories & Tags',
  navigation: 'Navigation',
  operations: 'Operations',
  bookings: 'Bookings',
  clients: 'Clients',
  reviews: 'Reviews & Moderation',
  calendar: 'Calendar',
  finance: 'Finance',
  invoices: 'Invoices',
  payments: 'Payments',
  payouts: 'Vendor Payouts',
  refunds: 'Refunds',
  tax: 'Tax & VAT',
  mpesa: 'M-Pesa Reconciliation',
  workforce: 'Workforce',
  employees: 'Employees',
  schedule: 'Schedule',
  payroll: 'Payroll',
  leave: 'Leave & Attendance',
  roles: 'Roles & Permissions',
  recruitment: 'Recruitment',
  insights: 'Insights',
  analytics: 'Analytics',
  activity: 'Activity Log',
  audit: 'Audit Log',
  inbox: 'Inbox',
  notifications: 'Notifications',
  integrations: 'Integrations',
  help: 'Help Center',
  feedback: 'Feedback',
  settings: 'Settings',
}

function humanize(seg: string): string {
  return seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

type Crumb = { label: string; href: string }

function buildCrumbs(pathname: string): Crumb[] {
  if (pathname === '/') return [{ label: 'Dashboard', href: '/' }]
  const segs = pathname.split('/').filter(Boolean)
  return segs.map((seg, i) => ({
    label: SEGMENT_LABELS[seg] ?? humanize(seg),
    href: '/' + segs.slice(0, i + 1).join('/'),
  }))
}

export function Header() {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname)

  return (
    <header className="flex items-center justify-between py-6 px-8 bg-gray-50/50 relative z-10 w-full shrink-0">
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500 truncate">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1
            return (
              <li key={c.href} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" aria-hidden />}
                {isLast ? (
                  <span className="font-semibold text-gray-900 truncate">{c.label}</span>
                ) : (
                  <Link
                    href={c.href}
                    className="hover:text-gray-900 transition-colors truncate"
                  >
                    {c.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="flex items-center gap-4 shrink-0">
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-500 border-2 border-gray-50 rounded-full"></span>
        </button>

        <UserButton
          appearance={{
            elements: { avatarBox: 'w-10 h-10 ring-2 ring-white shadow-sm' },
          }}
        />
      </div>
    </header>
  );
}
