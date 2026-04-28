'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, ListChecks, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = { href: string; label: string; icon: typeof ListChecks }

const TABS: Tab[] = [
  { href: '/bookings', label: 'Pipeline', icon: ListChecks },
  { href: '/bookings/calendar', label: 'Calendar', icon: CalendarDays },
]

export default function BookingsListLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col min-h-full">
      <div className="px-8 pt-2 border-b border-gray-100 flex items-center gap-3">
        <nav className="flex items-center gap-1" aria-label="Bookings views">
          {TABS.map((t) => {
            const active = pathname === t.href
            const Icon = t.icon
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-t-md border-b-2 transition-colors',
                  active
                    ? 'text-gray-900 border-gray-900'
                    : 'text-gray-500 hover:text-gray-900 border-transparent',
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </Link>
            )
          })}
        </nav>
        <button
          type="button"
          className="ml-auto mb-2 inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New booking
        </button>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
