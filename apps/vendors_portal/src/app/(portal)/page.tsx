'use client'

import dynamic from 'next/dynamic'
import { StatCard } from '@/components/StatCard'
import { ProfileCompletion } from '@/components/ProfileCompletion'
import { RecentInquiries } from '@/components/RecentInquiries'
import { ConversionFunnel } from '@/components/ConversionFunnel'
import { UpcomingBookings, getUpcomingStats } from '@/components/UpcomingBookings'
import { formatTZS } from '@/lib/bookings'
import {
  completion,
  leadStats,
  performanceStats,
  profileViews,
  recentInquiries,
  bookingsRevenue,
  leadSources,
  conversionFunnel,
} from '@/lib/mock-data'

// Recharts components mount the DOM on first paint and read element widths;
// loading them client-side avoids SSR hydration warnings on the dashboard.
const LeadsChart = dynamic(
  () => import('@/components/LeadsChart').then((m) => m.LeadsChart),
  { ssr: false },
)
const BookingsChart = dynamic(
  () => import('@/components/BookingsChart').then((m) => m.BookingsChart),
  { ssr: false },
)
const LeadSourceChart = dynamic(
  () => import('@/components/LeadSourceChart').then((m) => m.LeadSourceChart),
  { ssr: false },
)

function SectionHeader({
  label,
  hint,
}: {
  label: string
  hint?: string
}) {
  return (
    <div className="lg:col-span-12 flex items-baseline gap-3 mt-2 first:mt-0">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
        {label}
      </h2>
      {hint ? <span className="text-xs text-gray-400">{hint}</span> : null}
      <span className="flex-1 h-px bg-gray-100" aria-hidden />
    </div>
  )
}

export default function DashboardPage() {
  const upcomingStats = getUpcomingStats()
  return (
    <div className="p-8 pb-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-min">
          {/* Top: at-a-glance */}
          <div className="lg:col-span-12 flex items-start">
            <ProfileCompletion sections={completion} />
          </div>

          {/* Up next */}
          <SectionHeader label="Up next" hint="Upcoming events and reservations" />
          <div className="lg:col-span-4">
            <StatCard
              title="This week"
              value={String(upcomingStats.thisWeek)}
              trend=""
              sub="events scheduled"
            />
          </div>
          <div className="lg:col-span-4">
            <StatCard
              title="This month"
              value={String(upcomingStats.thisMonth)}
              trend=""
              sub="upcoming bookings"
            />
          </div>
          <div className="lg:col-span-4">
            <StatCard
              title="Confirmed value"
              value={formatTZS(upcomingStats.confirmedValue, { compact: true })}
              trend=""
              sub="across all confirmed events"
            />
          </div>
          <div className="lg:col-span-12 flex">
            <UpcomingBookings />
          </div>

          {/* Leads */}
          <SectionHeader label="Leads" hint="Inquiries, conversion, sources" />
          {leadStats.map((s) => (
            <div key={s.label} className="lg:col-span-3">
              <StatCard
                title={s.label}
                value={s.value}
                trend={s.trend}
                isPositive={s.isPositive}
                sub={s.sub}
              />
            </div>
          ))}
          <div className="lg:col-span-8 flex min-h-[300px]">
            <ConversionFunnel stages={conversionFunnel} />
          </div>
          <div className="lg:col-span-4 flex min-h-[300px]">
            <LeadSourceChart data={leadSources} />
          </div>
          <div className="lg:col-span-12 flex">
            <RecentInquiries rows={recentInquiries} />
          </div>

          {/* Performance */}
          <SectionHeader label="Performance" hint="How your storefront is doing" />
          {performanceStats.map((s) => (
            <div key={s.label} className="lg:col-span-4">
              <StatCard
                title={s.label}
                value={s.value}
                trend={s.trend}
                isPositive={s.isPositive}
                sub={s.sub}
              />
            </div>
          ))}
          <div className="lg:col-span-12 flex min-h-[340px]">
            <LeadsChart data={profileViews} />
          </div>

          {/* Insights */}
          <SectionHeader label="Insights" hint="Bookings and revenue trends" />
          <div className="lg:col-span-12 flex min-h-[380px]">
            <BookingsChart data={bookingsRevenue} />
          </div>
        </div>
      </div>
    </div>
  )
}
