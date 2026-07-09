'use client'

import dynamic from 'next/dynamic'
import { StatCard } from '@/components/StatCard'
import { ProfileCompletion } from '@/components/ProfileCompletion'
import { RecentInquiries } from '@/components/RecentInquiries'
import { ConversionFunnel } from '@/components/ConversionFunnel'
import { UpcomingBookings } from '@/components/UpcomingBookings'
import { formatTZS } from '@/lib/bookings'
import type { DashboardData } from '@/lib/dashboard'
import { usePortalT, type Translator } from '@/components/providers/PortalUIStringsProvider'

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

// Sub-label text -> CMS key. A small fixed set repeats across the computed
// lead/performance stats, so we translate by matching the literal English
// text rather than threading a key through lib/dashboard.ts for every sub.
const SUB_KEY_BY_TEXT: Record<string, string> = {
  'This week': 'sub_this_week',
  'This month': 'sub_this_month',
  'Last 30 days': 'sub_last_30_days',
  'vs last month': 'sub_vs_last_month',
}

function translateSub(sub: string | undefined, t: Translator): string | undefined {
  if (!sub) return sub
  const key = SUB_KEY_BY_TEXT[sub]
  return key ? t(key) : sub
}

function buildBannerBySource(t: Translator): Record<DashboardSource['kind'], string | null> {
  return {
    live: null,
    'no-application': t('banner_no_application'),
    'pending-approval': t('banner_pending_approval'),
    suspended: t('banner_suspended'),
    'no-env': t('banner_no_env'),
  }
}

export default function DashboardClient({
  source,
  data,
}: {
  source: DashboardSource
  data: DashboardData
}) {
  const t = usePortalT('dashboard')
  const banner = buildBannerBySource(t)[source.kind]

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
                ? t('empty_title_pending')
                : source.kind === 'suspended'
                  ? t('empty_title_suspended')
                  : t('empty_title_default')}
            </p>
            <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              {t('empty_subtitle')}
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
          {/* Only nudge while the storefront is incomplete; once every required
              section is done the card just adds clutter, so hide it. */}
          {!completion.every((s) => s.done) && (
            <div className="lg:col-span-12 flex items-start">
              <ProfileCompletion sections={completion} />
            </div>
          )}

          <SectionHeader label={t('section_up_next')} hint={t('section_up_next_hint')} />
          <div className="lg:col-span-4">
            <StatCard
              title={t('stat_this_week')}
              value={String(upcoming.thisWeek)}
              trend=""
              sub={t('stat_this_week_sub')}
            />
          </div>
          <div className="lg:col-span-4">
            <StatCard
              title={t('stat_this_month')}
              value={String(upcoming.thisMonth)}
              trend=""
              sub={t('stat_this_month_sub')}
            />
          </div>
          <div className="lg:col-span-4">
            <StatCard
              title={t('stat_confirmed_value')}
              value={
                upcoming.confirmedValue > 0
                  ? formatTZS(upcoming.confirmedValue, { compact: true })
                  : '—'
              }
              trend=""
              sub={t('stat_confirmed_value_sub')}
            />
          </div>
          <div className="lg:col-span-12 flex">
            <UpcomingBookings items={upcoming.items} />
          </div>

          <SectionHeader label={t('section_leads')} hint={t('section_leads_hint')} />
          {leadStats.map((s) => (
            <div key={s.key} className="lg:col-span-3">
              <StatCard
                title={t(`stat_${s.key}`)}
                value={s.value}
                trend={s.trend}
                isPositive={s.isPositive}
                sub={translateSub(s.sub, t)}
              />
            </div>
          ))}
          <div className="lg:col-span-8 flex min-h-[300px]">
            {hasFunnel ? (
              <ConversionFunnel stages={funnel} />
            ) : (
              <EmptyChartCard
                title={t('empty_funnel_title')}
                hint={t('empty_funnel_hint')}
              />
            )}
          </div>
          <div className="lg:col-span-4 flex min-h-[300px]">
            {hasSources ? (
              <LeadSourceChart data={leadSources} />
            ) : (
              <EmptyChartCard
                title={t('empty_sources_title')}
                hint={t('empty_sources_hint')}
              />
            )}
          </div>
          <div className="lg:col-span-12 flex">
            <RecentInquiries rows={recentInquiries} />
          </div>

          <SectionHeader label={t('section_performance')} hint={t('section_performance_hint')} />
          {performanceStats.map((s) => (
            <div key={s.key} className="lg:col-span-4">
              <StatCard
                title={t(`stat_${s.key}`)}
                value={s.value}
                trend={s.trend}
                isPositive={s.isPositive}
                sub={translateSub(s.sub, t)}
              />
            </div>
          ))}
          <div className="lg:col-span-12 flex min-h-[340px]">
            {hasViews ? (
              <LeadsChart data={profileViews} />
            ) : (
              <EmptyChartCard
                title={t('empty_views_title')}
                hint={t('empty_views_hint')}
              />
            )}
          </div>

          <SectionHeader label={t('section_insights')} hint={t('section_insights_hint')} />
          <div className="lg:col-span-12 flex min-h-[380px]">
            {hasBookingsRevenue ? (
              <BookingsChart data={bookingsRevenue} />
            ) : (
              <EmptyChartCard
                title={t('empty_bookings_revenue_title')}
                hint={t('empty_bookings_revenue_hint')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
