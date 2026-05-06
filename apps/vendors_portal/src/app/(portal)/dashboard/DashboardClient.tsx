'use client'

import dynamic from 'next/dynamic'
import { StatCard } from '@/components/StatCard'
import { ProfileCompletion } from '@/components/ProfileCompletion'
import { RecentInquiries } from '@/components/RecentInquiries'
import { ConversionFunnel } from '@/components/ConversionFunnel'
import { UpcomingBookings } from '@/components/UpcomingBookings'
import { formatTZS } from '@/lib/bookings'
import type { DashboardData } from '@/lib/dashboard'

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

function SectionHeader({ label, hint }: { label: string; hint?: string }) {
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

function EmptyChartCard({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full h-full flex flex-col">
      <h3 className="text-[15px] font-medium text-gray-900">{title}</h3>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-gray-500 text-center max-w-xs">{hint}</p>
      </div>
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

export default function DashboardClient({
  source,
  data,
}: {
  source: DashboardSource
  data: DashboardData
}) {
  const banner = BANNER_BY_SOURCE[source.kind]

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

  const { upcoming, leadStats, recentInquiries, completion, funnel, leadSources, performanceStats, profileViews, bookingsRevenue } = data
  const hasFunnel = funnel.length > 0 && funnel[0].value > 0
  const hasSources = leadSources.length > 0
  const hasViews = profileViews.month.some((p) => p.value > 0)
  const hasBookingsRevenue = bookingsRevenue.some(
    (p) => p.bookings > 0 || p.revenue > 0,
  )

  return (
    <div className="p-8 pb-12">
      <div className="max-w-[1400px] mx-auto">
        {banner && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
            {banner}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-min">
          <div className="lg:col-span-12 flex items-start">
            <ProfileCompletion sections={completion} />
          </div>

          <SectionHeader label="Up next" hint="Upcoming events and reservations" />
          <div className="lg:col-span-4">
            <StatCard
              title="This week"
              value={String(upcoming.thisWeek)}
              trend=""
              sub="events scheduled"
            />
          </div>
          <div className="lg:col-span-4">
            <StatCard
              title="This month"
              value={String(upcoming.thisMonth)}
              trend=""
              sub="upcoming bookings"
            />
          </div>
          <div className="lg:col-span-4">
            <StatCard
              title="Confirmed value"
              value={
                upcoming.confirmedValue > 0
                  ? formatTZS(upcoming.confirmedValue, { compact: true })
                  : '—'
              }
              trend=""
              sub="across all confirmed events"
            />
          </div>
          <div className="lg:col-span-12 flex">
            <UpcomingBookings items={upcoming.items} />
          </div>

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
            {hasFunnel ? (
              <ConversionFunnel stages={funnel} />
            ) : (
              <EmptyChartCard
                title="Conversion funnel"
                hint="No inquiries in the last 90 days yet. Your funnel will appear once couples start reaching out."
              />
            )}
          </div>
          <div className="lg:col-span-4 flex min-h-[300px]">
            {hasSources ? (
              <LeadSourceChart data={leadSources} />
            ) : (
              <EmptyChartCard
                title="Where leads come from"
                hint="Once couples discover your storefront, you'll see the breakdown here."
              />
            )}
          </div>
          <div className="lg:col-span-12 flex">
            <RecentInquiries rows={recentInquiries} />
          </div>

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
            {hasViews ? (
              <LeadsChart data={profileViews} />
            ) : (
              <EmptyChartCard
                title="Profile views"
                hint="Your storefront hasn't been viewed yet. Track activity will show here as visits roll in."
              />
            )}
          </div>

          <SectionHeader label="Insights" hint="Bookings and revenue trends" />
          <div className="lg:col-span-12 flex min-h-[380px]">
            {hasBookingsRevenue ? (
              <BookingsChart data={bookingsRevenue} />
            ) : (
              <EmptyChartCard
                title="Bookings & revenue"
                hint="No confirmed bookings yet. This trend chart unlocks once you accept and invoice your first event."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
