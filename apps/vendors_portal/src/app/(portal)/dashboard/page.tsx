import {
  loadDashboardData,
  emptyDashboardData,
  type DashboardData,
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
import DashboardClient, { type DashboardSource } from './DashboardClient'

async function loadDashboard(): Promise<{
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
  const data = await loadDashboardData(supabase, state.vendor)
  return {
    source: { kind: 'live', vendorName: state.vendor.businessName },
    data,
  }
}

export default async function DashboardPage() {
  const { source, data } = await loadDashboard()
  return <DashboardClient source={source} data={data} />
}
