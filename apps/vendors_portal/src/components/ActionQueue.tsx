import Link from 'next/link'
import {
  AlertCircle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import type { ActionItem } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Style = { icon: LucideIcon; iconBg: string; iconFg: string; label: string }

const STYLES: Record<ActionItem['type'], Style> = {
  overdue: {
    icon: AlertCircle,
    iconBg: 'bg-rose-50',
    iconFg: 'text-rose-600',
    label: 'Overdue',
  },
  expiring: {
    icon: Clock,
    iconBg: 'bg-[#FCE9C2]',
    iconFg: 'text-[#B07F2C]',
    label: 'Soon',
  },
  event: {
    icon: CalendarClock,
    iconBg: 'bg-[#F0DFF6]',
    iconFg: 'text-[#7E5896]',
    label: 'Event',
  },
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50',
    iconFg: 'text-emerald-600',
    label: 'Confirmed',
  },
}

export function ActionQueue({ items }: { items: ActionItem[] }) {
  const overdueCount = items.filter((i) => i.type === 'overdue').length

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-start justify-between px-6 pt-6 pb-4">
        <div>
          <h3 className="text-[15px] font-medium text-gray-900">Action queue</h3>
          <p className="text-xs text-gray-500 mt-1">
            {overdueCount > 0
              ? `${overdueCount} overdue · clear these first`
              : 'You’re caught up — nice work.'}
          </p>
        </div>
        {overdueCount > 0 ? (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-rose-50 text-rose-700">
            {overdueCount} overdue
          </span>
        ) : null}
      </div>

      <ul className="divide-y divide-gray-100 flex-1">
        {items.map((item) => {
          const s = STYLES[item.type]
          const Icon = s.icon
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-start gap-3 px-6 py-3 hover:bg-gray-50 transition-colors group"
              >
                <span
                  className={cn(
                    'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5',
                    s.iconBg,
                    s.iconFg,
                  )}
                  aria-label={s.label}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{item.sub}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-700 mt-1 shrink-0 transition-colors" />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
