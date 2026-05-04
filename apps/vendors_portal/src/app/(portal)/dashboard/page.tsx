import type { CompletionSection, InquiryRow, LeadStat } from '@/lib/mock-data'
import {
  completion as mockCompletion,
  leadStats as mockLeadStats,
  recentInquiries as mockRecentInquiries,
} from '@/lib/mock-data'
import { createClerkSupabaseServerClient } from '@/lib/supabase'
import { getCurrentVendor, type CurrentVendor } from '@/lib/vendor'
import DashboardClient, { type DashboardSource } from './DashboardClient'

const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop'

type DbInquiryStatus =
  | 'pending'
  | 'responded'
  | 'accepted'
  | 'declined'
  | 'closed'

const STATUS_TO_UI: Record<DbInquiryStatus, InquiryRow['status']> = {
  pending: 'new',
  responded: 'replied',
  accepted: 'booked',
  declined: 'declined',
  closed: 'closed',
}

type InquiryRowFromDb = {
  id: string
  name: string | null
  event_date: string | null
  budget: string | null
  location: string | null
  status: DbInquiryStatus | null
  created_at: string
  responded_at: string | null
}

function formatEventDate(date: string | null): string {
  if (!date) return 'Date TBC'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'Date TBC'
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function mapStatus(status: DbInquiryStatus | null): InquiryRow['status'] {
  if (!status) return 'new'
  return STATUS_TO_UI[status] ?? 'new'
}

function mapInquiryRow(row: InquiryRowFromDb): InquiryRow {
  return {
    id: row.id,
    couple: row.name ?? 'Anonymous lead',
    date: formatEventDate(row.event_date),
    budget: row.budget ?? '—',
    location: row.location ?? '—',
    status: mapStatus(row.status),
    avatarUrl: PLACEHOLDER_AVATAR,
  }
}

function startOfWeek(now: Date): Date {
  const d = new Date(now)
  const day = d.getDay()
  const diff = (day + 6) % 7 // Monday = 0
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function computeLeadStats(rows: InquiryRowFromDb[]): LeadStat[] {
  const now = new Date()
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  const newThisWeek = rows.filter(
    (r) => r.status === 'pending' && new Date(r.created_at) >= weekStart,
  ).length

  const bookedThisMonth = rows.filter(
    (r) => r.status === 'accepted' && new Date(r.created_at) >= monthStart,
  ).length

  const totalThisMonth = rows.filter(
    (r) => new Date(r.created_at) >= monthStart,
  ).length

  const conversionRate =
    totalThisMonth === 0
      ? '—'
      : `${Math.round((bookedThisMonth / totalThisMonth) * 100 * 10) / 10}%`

  // Average response time across responded leads in the last 30 days.
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const responded = rows.filter(
    (r) =>
      r.responded_at &&
      new Date(r.created_at) >= thirtyDaysAgo &&
      new Date(r.responded_at) >= new Date(r.created_at),
  )
  let avgResponse = '—'
  if (responded.length > 0) {
    const totalMs = responded.reduce(
      (sum, r) =>
        sum + (new Date(r.responded_at!).getTime() - new Date(r.created_at).getTime()),
      0,
    )
    const avgMin = totalMs / responded.length / 60000
    avgResponse =
      avgMin >= 60
        ? `${Math.floor(avgMin / 60)}h ${Math.round(avgMin % 60)}m`
        : `${Math.round(avgMin)}m`
  }

  return [
    { label: 'New inquiries', value: String(newThisWeek), trend: '', sub: 'This week', isPositive: true },
    { label: 'Conversion rate', value: conversionRate, trend: '', sub: 'This month', isPositive: true },
    { label: 'Avg response time', value: avgResponse, trend: '', sub: 'Last 30 days', isPositive: true },
    { label: 'Booked leads', value: String(bookedThisMonth), trend: '', sub: 'This month', isPositive: true },
  ]
}

function deriveCompletion(vendor: CurrentVendor): CompletionSection[] {
  // Phase 1: derive only what we can from current vendor row. Other sections
  // (services, packages, FAQ, team, availability, reviews) come in later phases.
  return [
    { id: 'name', label: 'Business name', done: !!vendor.businessName },
    { id: 'category', label: 'Category', done: !!vendor.category },
    { id: 'bio', label: 'Bio', done: !!vendor.bio && vendor.bio.length > 0 },
    { id: 'logo', label: 'Logo', done: !!vendor.logo },
    { id: 'cover', label: 'Cover image', done: !!vendor.coverImage },
  ]
}

async function loadDashboard(): Promise<{
  source: DashboardSource
  completion: CompletionSection[]
  leadStats: LeadStat[]
  recentInquiries: InquiryRow[]
}> {
  const state = await getCurrentVendor()

  if (state.kind === 'no-env') {
    return {
      source: { kind: 'no-env' },
      completion: mockCompletion,
      leadStats: mockLeadStats,
      recentInquiries: mockRecentInquiries,
    }
  }

  if (state.kind === 'no-application') {
    return {
      source: { kind: 'no-application' },
      completion: [],
      leadStats: [],
      recentInquiries: [],
    }
  }

  if (state.kind === 'pending-approval') {
    return {
      source: { kind: 'pending-approval', vendorName: state.vendorName },
      completion: [],
      leadStats: [],
      recentInquiries: [],
    }
  }

  if (state.kind === 'suspended') {
    return {
      source: { kind: 'suspended' },
      completion: [],
      leadStats: [],
      recentInquiries: [],
    }
  }

  const supabase = await createClerkSupabaseServerClient()
  // TODO (Phase 2/6): move stats aggregation server-side via an RPC. Today
  // computeLeadStats runs on the same row set we render in RecentInquiries,
  // so a busy vendor with >500 leads in the lookback windows will silently
  // undercount. The 500 cap covers ~30 leads/day for 30 days.
  const inquiries = await supabase
    .from('inquiries')
    .select('id, name, event_date, budget, location, status, created_at, responded_at')
    .eq('vendor_id', state.vendor.id)
    .order('created_at', { ascending: false })
    .limit(500)
    .returns<InquiryRowFromDb[]>()

  if (inquiries.error) {
    throw new Error(
      `[dashboard] inquiries query failed: ${inquiries.error.code} ${inquiries.error.message}`,
    )
  }

  const rows = inquiries.data ?? []
  return {
    source: { kind: 'live', vendorName: state.vendor.businessName },
    completion: deriveCompletion(state.vendor),
    leadStats: computeLeadStats(rows),
    recentInquiries: rows.slice(0, 6).map(mapInquiryRow),
  }
}

export default async function DashboardPage() {
  const props = await loadDashboard()
  return <DashboardClient {...props} />
}
