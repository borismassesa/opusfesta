'use client'

import dynamic from 'next/dynamic'
import { StatCard } from '@/components/StatCard'
import { ProfileCompletion } from '@/components/ProfileCompletion'
import { RecentInquiries } from '@/components/RecentInquiries'
import { ConversionFunnel } from '@/components/ConversionFunnel'
import { UpcomingBookings, getUpcomingStats } from '@/components/UpcomingBookings'
import { formatTZS } from '@/lib/bookings'
import type { CompletionSection, InquiryRow, LeadStat } from '@/lib/mock-data'
import {
  performanceStats,
  profileViews,
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

export type DashboardSource =
  | { kind: 'live'; vendorName: string }
  | { kind: 'no-application' }
  | { kind: 'pending-approval'; vendorName: string }
  | { kind: 'suspended' }
  | { kind: 'no-env' }

const BANNER_BY_SOURCE: Record<DashboardSource['kind'], string | null> = {
  live: null,
  'no-application':
    "You haven't started a vendor application yet. Apply to do business on OpusFesta to access the dashboard.",
  'pending-approval':
    'Your vendor application is awaiting OpusFesta verification. The dashboard unlocks once your account is approved.',
  suspended:
    'Your vendor account is suspended. Contact OpusFesta support if you believe this is a mistake.',
  'no-env':
    'DEV: Vendor backend not connected — showing seed data. Check Supabase env vars and that migrations are applied to your Supabase project.',
}

type DashboardClientProps = {
  source: DashboardSource
  completion: CompletionSection[]
  leadStats: LeadStat[]
  recentInquiries: InquiryRow[]
}

export default function DashboardClient({
  source,
  completion,
  leadStats,
  recentInquiries,
}: DashboardClientProps) {
  const upcomingStats = getUpcomingStats()
  const banner = BANNER_BY_SOURCE[source.kind]
  const greeting =
    source.kind === 'live' ? `Welcome back, ${source.vendorName}` : null

  // Locked-out states: anything that isn't a live, approved vendor. The
  // (portal) layout already redirects these to /pending — this empty-state
  // render is defense-in-depth in case the layout gate is ever removed.
  if (
    source.kind === 'no-application' ||
    source.kind === 'pending-approval' ||
    source.kind === 'suspended'
  ) {
    return (
      <div className="p-8 pb-12">
        <div className="max-w-[1400px] mx-auto">
          {banner && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
              {banner}
            </div>
          )}
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-700">
              {source.kind === 'pending-approval'
                ? 'Your dashboard will appear here once OpusFesta approves your vendor profile.'
                : source.kind === 'suspended'
                  ? 'Your vendor account is suspended.'
                  : "Your dashboard will appear here once you've applied and been approved."}
            </p>
            <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              You&rsquo;ll see leads, upcoming events, and storefront performance once
              your account is active.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 pb-12">
      <div className="max-w-[1400px] mx-auto">
        {banner && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
            {banner}
          </div>
        )}
        {greeting && (
          <h1 className="mb-6 text-2xl font-semibold text-gray-900">
            {greeting}
          </h1>
        )}
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
