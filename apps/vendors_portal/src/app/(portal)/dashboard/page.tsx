import {
  loadDashboardData,
  emptyDashboardData,
  type DashboardData,
  type FunnelStageLabels,
  type LeadSourceLabels,
} from '@/lib/dashboard'
import {
  completion as mockCompletion,
  leadStats as mockLeadStats,
  recentInquiries as mockRecentInquiries,
  performanceStats as mockPerformanceStats,
  profileViews as mockProfileViews,
  bookingsRevenue as mockBookingsRevenue,
  leadSources as mockLeadSources,
  conversionFunnel as mockFunnel,
} from '@/lib/mock-data'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'
import { getLocale } from '@/lib/cms/locale'
import { loadPortalUiStrings } from '@/lib/cms/portal-ui'
import { PortalUIStringsProvider } from '@/components/providers/PortalUIStringsProvider'
import DashboardClient, { type DashboardSource } from './DashboardClient'

async function loadDashboard(
  labels: { funnelStages: FunnelStageLabels; leadSources: LeadSourceLabels },
): Promise<{
  source: DashboardSource
  data: DashboardData
}> {
  const state = await getCurrentVendor()

  if (state.kind === 'no-env') {
    // DEV fallback: portal boots without Supabase env vars; show seed numbers
    // so designers can iterate offline. The banner makes this state explicit.
    return {
      source: { kind: 'no-env' },
      data: {
        ...emptyDashboardData(),
        completion: mockCompletion,
        leadStats: mockLeadStats,
        recentInquiries: mockRecentInquiries,
        funnel: mockFunnel,
        leadSources: mockLeadSources,
        performanceStats: mockPerformanceStats,
        profileViews: mockProfileViews,
        bookingsRevenue: mockBookingsRevenue,
        // Mock has no upcoming-bookings projection; keep zeroed so the seed
        // dashboard doesn't claim fictitious revenue we can't trace to a row.
        upcoming: { thisWeek: 0, thisMonth: 0, confirmedValue: 0, items: [] },
      },
    }
  }

  if (state.kind === 'no-application') {
    return { source: { kind: 'no-application' }, data: emptyDashboardData() }
  }

  if (state.kind === 'pending-approval') {
    return {
      source: { kind: 'pending-approval', vendorName: state.vendorName },
      data: emptyDashboardData(),
    }
  }

  if (state.kind === 'suspended') {
    return { source: { kind: 'suspended' }, data: emptyDashboardData() }
  }

  const supabase = await createClerkSupabaseServerClient()
  const data = await loadDashboardData(supabase, state.vendor, labels)
  return {
    source: { kind: 'live', vendorName: state.vendor.businessName },
    data,
  }
}

export default async function DashboardPage() {
  const locale = await getLocale()
  const dashboardStrings = await loadPortalUiStrings('dashboard', locale)
  const labels = {
    funnelStages: {
      inquiries: dashboardStrings.funnel_stage_inquiries,
      replied: dashboardStrings.funnel_stage_replied,
      quoted: dashboardStrings.funnel_stage_quoted,
      booked: dashboardStrings.funnel_stage_booked,
    },
    leadSources: {
      search: dashboardStrings.source_search,
      featured: dashboardStrings.source_featured,
      direct: dashboardStrings.source_direct,
      referral: dashboardStrings.source_referral,
    },
  }
  const { source, data } = await loadDashboard(labels)
  return (
    <PortalUIStringsProvider bundles={{ dashboard: dashboardStrings }}>
      <DashboardClient source={source} data={data} />
    </PortalUIStringsProvider>
  )
}
