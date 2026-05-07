'use client'

import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import type { UpcomingBookingItem } from '@/lib/dashboard'
import { STAGE_META, formatTZS, relativeDays, shortEventDate } from '@/lib/bookings'
import { cn } from '@/lib/utils'

export function UpcomingBookings({ items }: { items: UpcomingBookingItem[] }) {
  const next = items.slice(0, 4)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full p-5 lg:p-6 flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {next[0]
            ? `Next event ${relativeDays(next[0].date).toLowerCase()} — ${next[0].couple}`
            : 'No upcoming events'}
        </h3>
        <Link
          href="/bookings"
          className="text-xs font-semibold text-gray-700 hover:text-gray-900 inline-flex items-center gap-1 shrink-0"
        >
          Open bookings
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {next.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
          <p className="text-sm text-gray-500">
            Nothing on the horizon yet. Quoted couples will appear here once they reserve.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 -mx-1">
          {next.map((b) => {
            const stage = STAGE_META[b.stage]
            return (
              <li key={b.id}>
                <Link
                  href={`/bookings/${b.id}`}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-1 py-3 hover:bg-gray-50 transition-colors rounded-md"
                >
                  <div className="text-center min-w-[48px]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {shortEventDate(b.date).split(' ')[1]}
                    </p>
                    <p className="text-base font-semibold text-gray-900 tabular-nums leading-none mt-0.5">
                      {shortEventDate(b.date).split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {relativeDays(b.date)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {b.couple}
                    </p>
                    <p className="text-xs text-gray-500 truncate inline-flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{b.location}</span>
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {b.totalValue > 0 ? formatTZS(b.totalValue, { compact: true }) : '—'}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border',
                      stage.pillClass,
                    )}
                  >
                    {stage.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
