import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BookingStage,
  BookingsRevenuePoint,
  CompletionSection,
  FunnelStage,
  InquiryRow,
  InsightPoint,
  LeadSource,
  LeadStat,
  ProfileViewsRange,
} from './mock-data'
import type { CurrentVendor } from './vendor'

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

type VendorViewRow = {
  source: string | null
  viewed_at: string
}

type InvoiceRow = {
  inquiry_id: string
  total_amount: number | string
  paid_amount: number | string
  status: string
}

export type UpcomingBookingItem = {
  id: string
  date: string // YYYY-MM-DD
  couple: string
  location: string
  totalValue: number
  // Subset of BookingStage that's valid for upcoming items: a quoted/completed/
  // cancelled booking can never appear here. Derived from BookingStage so
  // renames in the canonical union surface here as compile errors.
  stage: Extract<BookingStage, 'confirmed' | 'reserved'>
}

export type DashboardData = {
  completion: CompletionSection[]
  leadStats: LeadStat[]
  recentInquiries: InquiryRow[]
  upcoming: {
    thisWeek: number
    thisMonth: number
    confirmedValue: number
    items: UpcomingBookingItem[]
  }
  funnel: FunnelStage[]
  leadSources: LeadSource[]
  performanceStats: LeadStat[]
  profileViews: Record<ProfileViewsRange, InsightPoint[]>
  bookingsRevenue: BookingsRevenuePoint[]
}

function startOfDay(now: Date): Date {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfWeek(now: Date): Date {
  const d = startOfDay(now)
  const day = d.getDay()
  const diff = (day + 6) % 7 // Monday-aligned
  d.setDate(d.getDate() - diff)
  return d
}

function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function daysAgo(now: Date, n: number): Date {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return d
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

function mapInquiryStatus(status: DbInquiryStatus | null): InquiryRow['status'] {
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
    status: mapInquiryStatus(row.status),
    avatarUrl: PLACEHOLDER_AVATAR,
  }
}

function formatDuration(ms: number): string {
  const minutes = ms / 60000
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 1000) / 10
}

function pctDelta(current: number, prior: number): {
  trend: string
  isPositive: boolean
} {
  if (prior === 0) {
    if (current === 0) return { trend: '', isPositive: true }
    return { trend: '+new', isPositive: true }
  }
  const change = ((current - prior) / prior) * 100
  const rounded = Math.round(change)
  if (rounded === 0) return { trend: '', isPositive: true }
  return {
    trend: `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)}%`,
    isPositive: rounded > 0,
  }
}

function computeLeadStats(rows: InquiryRowFromDb[], now: Date): LeadStat[] {
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)
  const priorMonthStart = new Date(monthStart)
  priorMonthStart.setMonth(priorMonthStart.getMonth() - 1)

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
    totalThisMonth === 0 ? '—' : `${pct(bookedThisMonth, totalThisMonth)}%`

  const thirtyDaysAgo = daysAgo(now, 30)
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
    avgResponse = formatDuration(totalMs / responded.length)
  }

  return [
    { label: 'New inquiries', value: String(newThisWeek), trend: '', sub: 'This week', isPositive: true },
    { label: 'Conversion rate', value: conversionRate, trend: '', sub: 'This month', isPositive: true },
    { label: 'Avg response time', value: avgResponse, trend: '', sub: 'Last 30 days', isPositive: true },
    { label: 'Booked leads', value: String(bookedThisMonth), trend: '', sub: 'This month', isPositive: true },
  ]
}

function computeFunnel(rows: InquiryRowFromDb[], now: Date): FunnelStage[] {
  const ninetyDaysAgo = daysAgo(now, 90)
  const window = rows.filter((r) => new Date(r.created_at) >= ninetyDaysAgo)

  const inquiries = window.length
  const replied = window.filter(
    (r) => r.responded_at !== null || r.status === 'responded' || r.status === 'accepted' || r.status === 'declined',
  ).length
  // No quote table on marketplace yet — proxy "Quoted" with replies that
  // led to a positive next step (accepted) plus those still in flight after
  // the vendor responded but before declined. Drops to 0 when nobody has
  // engaged yet.
  const quoted = window.filter(
    (r) => r.status === 'accepted' || (r.status === 'responded' && r.responded_at !== null),
  ).length
  const booked = window.filter((r) => r.status === 'accepted').length

  return [
    { name: 'Inquiries', value: inquiries, color: '#7E5896' },
    { name: 'Replied', value: replied, color: '#C9A0DC' },
    { name: 'Quoted', value: quoted, color: '#F5C77E' },
    { name: 'Booked', value: booked, color: '#9FE870' },
  ]
}

const SOURCE_LABEL: Record<string, { label: string; color: string }> = {
  search: { label: 'Search', color: '#7E5896' },
  listing: { label: 'Search', color: '#7E5896' },
  recommendation: { label: 'Featured', color: '#9FE870' },
  featured: { label: 'Featured', color: '#9FE870' },
  saved: { label: 'Direct', color: '#F5C77E' },
  direct: { label: 'Direct', color: '#F5C77E' },
  referral: { label: 'Referral', color: '#7BA7BC' },
}

function computeLeadSources(views: VendorViewRow[]): LeadSource[] {
  if (views.length === 0) return []
  const tally = new Map<string, { label: string; color: string; count: number }>()
  for (const v of views) {
    const raw = (v.source ?? 'direct').toLowerCase()
    const meta = SOURCE_LABEL[raw] ?? { label: 'Direct', color: '#F5C77E' }
    const prev = tally.get(meta.label)
    if (prev) {
      prev.count += 1
    } else {
      tally.set(meta.label, { label: meta.label, color: meta.color, count: 1 })
    }
  }
  const total = views.length
  return Array.from(tally.values())
    .map((t) => ({
      name: t.label,
      color: t.color,
      value: Math.round((t.count / total) * 100),
    }))
    .sort((a, b) => b.value - a.value)
}

function computePerformance(
  views: VendorViewRow[],
  rows: InquiryRowFromDb[],
  now: Date,
): LeadStat[] {
  const last30 = daysAgo(now, 30)
  const prior30 = daysAgo(now, 60)

  const viewsLast30 = views.filter((v) => new Date(v.viewed_at) >= last30).length
  const viewsPrior30 = views.filter(
    (v) => new Date(v.viewed_at) >= prior30 && new Date(v.viewed_at) < last30,
  ).length

  const inquiriesLast30 = rows.filter((r) => new Date(r.created_at) >= last30).length

  const inquiryRate = viewsLast30 === 0 ? 0 : (inquiriesLast30 / viewsLast30) * 100
  const inquiryRatePrior =
    viewsPrior30 === 0
      ? 0
      : (rows.filter(
          (r) =>
            new Date(r.created_at) >= prior30 && new Date(r.created_at) < last30,
        ).length /
          viewsPrior30) *
        100

  const responded = rows.filter(
    (r) =>
      r.responded_at &&
      new Date(r.created_at) >= last30 &&
      new Date(r.responded_at) >= new Date(r.created_at),
  )
  const respondedPrior = rows.filter(
    (r) =>
      r.responded_at &&
      new Date(r.created_at) >= prior30 &&
      new Date(r.created_at) < last30 &&
      new Date(r.responded_at) >= new Date(r.created_at),
  )
  const avgMs = (set: typeof responded) =>
    set.length === 0
      ? 0
      : set.reduce(
          (s, r) =>
            s + (new Date(r.responded_at!).getTime() - new Date(r.created_at).getTime()),
          0,
        ) / set.length

  const avg = avgMs(responded)
  const avgPrior = avgMs(respondedPrior)

  const viewsDelta = pctDelta(viewsLast30, viewsPrior30)
  const inquiryRateDelta = pctDelta(inquiryRate, inquiryRatePrior)
  // Faster response time is better — invert positive when current < prior.
  const responseFaster = avg !== 0 && avgPrior !== 0 && avg < avgPrior
  const responseDeltaPct =
    avgPrior === 0
      ? ''
      : `${avg < avgPrior ? '−' : '+'}${Math.round(Math.abs(((avg - avgPrior) / avgPrior) * 100))}%`

  return [
    {
      label: 'Profile views',
      value: viewsLast30.toLocaleString('en-GB'),
      trend: viewsDelta.trend,
      isPositive: viewsDelta.isPositive,
      sub: 'vs last month',
    },
    {
      label: 'Inquiry rate',
      value: viewsLast30 === 0 ? '—' : `${inquiryRate.toFixed(1)}%`,
      trend: inquiryRateDelta.trend,
      isPositive: inquiryRateDelta.isPositive,
      sub: 'vs last month',
    },
    {
      label: 'Response time',
      value: responded.length === 0 ? '—' : formatDuration(avg),
      trend: responseDeltaPct,
      isPositive: responseFaster,
      sub: 'vs last month',
    },
  ]
}

function computeProfileViewsSeries(
  views: VendorViewRow[],
  now: Date,
): Record<ProfileViewsRange, InsightPoint[]> {
  const byDay = new Map<string, number>()
  for (const v of views) {
    const d = new Date(v.viewed_at)
    const key = d.toISOString().slice(0, 10)
    byDay.set(key, (byDay.get(key) ?? 0) + 1)
  }

  const day: InsightPoint[] = []
  for (let i = 13; i >= 0; i -= 1) {
    const d = daysAgo(now, i)
    const key = d.toISOString().slice(0, 10)
    day.push({
      name: d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit' }),
      value: byDay.get(key) ?? 0,
    })
  }

  const week: InsightPoint[] = []
  for (let i = 11; i >= 0; i -= 1) {
    let count = 0
    for (let j = 0; j < 7; j += 1) {
      const d = daysAgo(now, i * 7 + j)
      const key = d.toISOString().slice(0, 10)
      count += byDay.get(key) ?? 0
    }
    week.push({
      name: `W${12 - i}`,
      value: count,
    })
  }

  const month: InsightPoint[] = []
  for (let i = 11; i >= 0; i -= 1) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const next = new Date(ref.getFullYear(), ref.getMonth() + 1, 1)
    let count = 0
    for (const v of views) {
      const t = new Date(v.viewed_at).getTime()
      if (t >= ref.getTime() && t < next.getTime()) count += 1
    }
    month.push({
      name: ref.toLocaleDateString('en-GB', { month: 'short' }),
      value: count,
    })
  }

  return { day, week, month }
}

function computeUpcoming(
  rows: InquiryRowFromDb[],
  invoices: InvoiceRow[],
  now: Date,
): DashboardData['upcoming'] {
  const today = startOfDay(now)
  const todayKey = today.toISOString().slice(0, 10)
  const weekEnd = new Date(today.getTime() + 7 * 86_400_000)
  // "This month" means the remainder of the current calendar month so the
  // StatCard label matches what the vendor sees on their wall calendar —
  // not a rolling 30-day window.
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const invoiceTotal = new Map<string, number>()
  for (const inv of invoices) {
    if (inv.status === 'CANCELLED') continue
    const total = typeof inv.total_amount === 'string' ? parseFloat(inv.total_amount) : inv.total_amount
    invoiceTotal.set(inv.inquiry_id, (invoiceTotal.get(inv.inquiry_id) ?? 0) + (Number.isFinite(total) ? total : 0))
  }

  const upcoming = rows
    .filter(
      (r) =>
        r.status === 'accepted' &&
        r.event_date !== null &&
        r.event_date >= todayKey,
    )
    .sort((a, b) => (a.event_date ?? '').localeCompare(b.event_date ?? ''))

  const items: UpcomingBookingItem[] = upcoming.slice(0, 4).map((r) => ({
    id: r.id,
    date: r.event_date!,
    couple: r.name ?? 'Couple',
    location: r.location ?? '—',
    totalValue: invoiceTotal.get(r.id) ?? 0,
    stage: invoiceTotal.has(r.id) ? 'confirmed' : 'reserved',
  }))

  const thisWeek = upcoming.filter(
    (r) => new Date(r.event_date!).getTime() <= weekEnd.getTime(),
  ).length
  const thisMonth = upcoming.filter(
    (r) => new Date(r.event_date!).getTime() <= monthEnd.getTime(),
  ).length

  const confirmedValue = upcoming.reduce(
    (sum, r) => sum + (invoiceTotal.get(r.id) ?? 0),
    0,
  )

  return { thisWeek, thisMonth, confirmedValue, items }
}

function computeBookingsRevenue(
  rows: InquiryRowFromDb[],
  invoices: InvoiceRow[],
  now: Date,
): BookingsRevenuePoint[] {
  const buckets: BookingsRevenuePoint[] = []
  const inquiryToInvoice = new Map<string, number>()
  for (const inv of invoices) {
    if (inv.status === 'CANCELLED') continue
    const total =
      typeof inv.total_amount === 'string' ? parseFloat(inv.total_amount) : inv.total_amount
    inquiryToInvoice.set(
      inv.inquiry_id,
      (inquiryToInvoice.get(inv.inquiry_id) ?? 0) + (Number.isFinite(total) ? total : 0),
    )
  }

  for (let i = 5; i >= 0; i -= 1) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const next = new Date(ref.getFullYear(), ref.getMonth() + 1, 1)
    let bookings = 0
    let revenue = 0
    for (const r of rows) {
      if (r.status !== 'accepted') continue
      if (!r.event_date) continue
      const t = new Date(r.event_date).getTime()
      if (t >= ref.getTime() && t < next.getTime()) {
        bookings += 1
        revenue += inquiryToInvoice.get(r.id) ?? 0
      }
    }
    buckets.push({
      name: ref.toLocaleDateString('en-GB', { month: 'short' }),
      bookings,
      // Display revenue in millions for the chart's "TSh M" axis.
      revenue: Math.round(revenue / 1_000_000),
    })
  }
  return buckets
}

export function deriveCompletion(vendor: CurrentVendor): CompletionSection[] {
  return [
    { id: 'name', label: 'Business name', done: !!vendor.businessName },
    { id: 'category', label: 'Category', done: !!vendor.category },
    { id: 'bio', label: 'Bio', done: !!vendor.bio && vendor.bio.length > 0 },
    { id: 'logo', label: 'Logo', done: !!vendor.logo },
    { id: 'cover', label: 'Cover image', done: !!vendor.coverImage },
  ]
}

/**
 * Run the dashboard read fan-out for a live vendor.
 *
 * Three vendor-scoped queries fire in parallel: inquiries (last 500 by
 * created_at), vendor_views (last 365 days, narrowed in-process for the
 * 90-day source mix), invoices (all non-cancelled, linked to inquiries
 * by inquiry_id in-process). Aggregates are computed locally so the page
 * renders in a single server round-trip. Revisit when the 500-row cap
 * starts truncating active windows for high-volume vendors.
 */
export async function loadDashboardData(
  supabase: SupabaseClient,
  vendor: CurrentVendor,
  now: Date = new Date(),
): Promise<DashboardData> {
  const ninetyDaysAgo = daysAgo(now, 90)
  const oneYearAgo = daysAgo(now, 365)

  const [inquiriesRes, viewsRes, invoicesRes] = await Promise.all([
    supabase
      .from('inquiries')
      .select('id, name, event_date, budget, location, status, created_at, responded_at')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .limit(500)
      .returns<InquiryRowFromDb[]>(),
    supabase
      .from('vendor_views')
      .select('source, viewed_at')
      .eq('vendor_id', vendor.id)
      .gte('viewed_at', oneYearAgo.toISOString())
      .returns<VendorViewRow[]>(),
    supabase
      .from('invoices')
      .select('inquiry_id, total_amount, paid_amount, status')
      .eq('vendor_id', vendor.id)
      .returns<InvoiceRow[]>(),
  ])

  if (inquiriesRes.error) {
    throw new Error(
      `[dashboard] inquiries query failed: ${inquiriesRes.error.code} ${inquiriesRes.error.message}`,
    )
  }
  // Views and invoices are best-effort: a fresh vendor with neither table
  // populated still has a renderable dashboard (zeroed stats). We log so
  // a real schema error doesn't get silently swallowed.
  if (viewsRes.error) {
    console.warn(
      `[dashboard] vendor_views query failed: ${viewsRes.error.code} ${viewsRes.error.message}`,
    )
  }
  if (invoicesRes.error) {
    console.warn(
      `[dashboard] invoices query failed: ${invoicesRes.error.code} ${invoicesRes.error.message}`,
    )
  }

  const rows = inquiriesRes.data ?? []
  const views = viewsRes.data ?? []
  const last90Views = views.filter((v) => new Date(v.viewed_at) >= ninetyDaysAgo)
  const invoices = invoicesRes.data ?? []

  return {
    completion: deriveCompletion(vendor),
    leadStats: computeLeadStats(rows, now),
    recentInquiries: rows.slice(0, 6).map(mapInquiryRow),
    upcoming: computeUpcoming(rows, invoices, now),
    funnel: computeFunnel(rows, now),
    leadSources: computeLeadSources(last90Views),
    performanceStats: computePerformance(views, rows, now),
    profileViews: computeProfileViewsSeries(views, now),
    bookingsRevenue: computeBookingsRevenue(rows, invoices, now),
  }
}

export function emptyDashboardData(): DashboardData {
  return {
    completion: [],
    leadStats: [],
    recentInquiries: [],
    upcoming: { thisWeek: 0, thisMonth: 0, confirmedValue: 0, items: [] },
    funnel: [],
    leadSources: [],
    performanceStats: [],
    profileViews: { day: [], week: [], month: [] },
    bookingsRevenue: [],
  }
}
