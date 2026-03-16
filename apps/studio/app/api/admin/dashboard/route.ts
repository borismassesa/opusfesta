import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import type { StudioBookingStatus } from '@/lib/studio-types';
import type { BookingLifecycleStatus } from '@/lib/booking-types';

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------
type BookingRow = {
  id: string;
  name: string;
  email: string;
  event_type: string;
  preferred_date: string | null;
  location: string | null;
  service: string | null;
  status: StudioBookingStatus;
  lifecycle_status: BookingLifecycleStatus | null;
  total_amount_tzs: number;
  deposit_amount_tzs: number;
  balance_due_tzs: number;
  event_date: string | null;
  responded_at: string | null;
  created_at: string;
};

type MessageRow = { booking_id: string | null; sender: string; created_at: string };
type ProjectRow = { id: string; title: string; is_published: boolean; updated_at: string };
type ArticleRow = { id: string; title: string; is_published: boolean; updated_at: string };
type ServiceRow = { id: string; title: string; price: string; is_active: boolean; updated_at: string };
type AvailabilityRow = { date: string; is_available: boolean };
type BookingEventRow = { id: string; booking_id: string; event_type: string; actor: string; description: string | null; created_at: string };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ACTIVE_PIPELINE_STATUSES: StudioBookingStatus[] = ['new', 'contacted', 'quoted', 'confirmed'];
const SUCCESS_STATUSES: StudioBookingStatus[] = ['confirmed', 'completed'];

const LIFECYCLE_PIPELINE: BookingLifecycleStatus[] = [
  'intake_submitted', 'qualified', 'quote_sent', 'quote_accepted',
  'contract_sent', 'contract_signed', 'deposit_pending', 'confirmed',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function asDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getPeriodCount(bookings: BookingRow[], from: Date, to: Date): number {
  return bookings.filter((b) => {
    const c = asDate(b.created_at);
    return !!c && c >= from && c < to;
  }).length;
}

function getDeltaPercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/** Resolve the effective event date — prefer event_date (lifecycle) over preferred_date */
function resolveEventDate(b: BookingRow): Date | null {
  return asDate(b.event_date) || asDate(b.preferred_date);
}

/** Get the Monday of the ISO week for a given date */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return startOfDay(new Date(d.setDate(diff)));
}

function formatWeekLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Lifecycle metrics
// ---------------------------------------------------------------------------
function buildLifecycleMetrics(bookings: BookingRow[]) {
  const counts: Partial<Record<BookingLifecycleStatus, number>> = {};
  let totalRevenue = 0;
  let totalDeposits = 0;
  let totalOutstanding = 0;

  for (const b of bookings) {
    const ls = b.lifecycle_status;
    if (ls) counts[ls] = (counts[ls] || 0) + 1;
    if (ls === 'confirmed' || ls === 'completed') {
      totalRevenue += b.total_amount_tzs || 0;
      totalDeposits += b.deposit_amount_tzs || 0;
    }
    if (ls === 'confirmed') {
      totalOutstanding += b.balance_due_tzs || 0;
    }
  }

  const pipelineCount = LIFECYCLE_PIPELINE.reduce((sum, s) => sum + (counts[s] || 0), 0);

  return {
    statusCounts: counts,
    pipelineCount,
    funnel: {
      intake: counts['intake_submitted'] || 0,
      qualified: counts['qualified'] || 0,
      quoted: counts['quote_sent'] || 0,
      confirmed: counts['confirmed'] || 0,
      completed: counts['completed'] || 0,
    },
    revenue: {
      total_tzs: totalRevenue,
      deposits_collected_tzs: totalDeposits,
      outstanding_balance_tzs: totalOutstanding,
      currency: 'TZS',
    },
  };
}

// ---------------------------------------------------------------------------
// Weekly inquiry bucketing (past 8 weeks)
// ---------------------------------------------------------------------------
function buildWeeklyInquiries(bookings: BookingRow[], now: Date): Array<{ week: string; count: number }> {
  const weeks: Array<{ start: Date; label: string; count: number }> = [];
  const currentWeekStart = getWeekStart(now);

  for (let i = 7; i >= 0; i--) {
    const weekStart = addDays(currentWeekStart, -7 * i);
    weeks.push({ start: weekStart, label: formatWeekLabel(weekStart), count: 0 });
  }

  for (const b of bookings) {
    const created = asDate(b.created_at);
    if (!created) continue;
    const bWeekStart = getWeekStart(created);
    const match = weeks.find((w) => w.start.getTime() === bWeekStart.getTime());
    if (match) match.count += 1;
  }

  return weeks.map((w) => ({ week: w.label, count: w.count }));
}

// ---------------------------------------------------------------------------
// Revenue by service (top 5)
// ---------------------------------------------------------------------------
function buildRevenueByService(bookings: BookingRow[]): Array<{ service: string; total_tzs: number }> {
  const map: Record<string, number> = {};
  for (const b of bookings) {
    if (b.status !== 'confirmed' && b.status !== 'completed') continue;
    if (!b.total_amount_tzs) continue;
    const svc = b.service?.trim() || 'Unspecified';
    map[svc] = (map[svc] || 0) + (b.total_amount_tzs || 0);
  }
  return Object.entries(map)
    .map(([service, total_tzs]) => ({ service, total_tzs }))
    .sort((a, b) => b.total_tzs - a.total_tzs)
    .slice(0, 5);
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();

    // Single consolidated query set
    const [
      bookingsResult,
      messagesResult,
      projectsResult,
      articlesResult,
      servicesResult,
      availabilityResult,
      eventsResult,
    ] = await Promise.all([
      // Single booking query with all columns (lifecycle + CRM)
      db.from('studio_bookings')
        .select('id, name, email, event_type, preferred_date, location, service, status, responded_at, created_at, lifecycle_status, total_amount_tzs, deposit_amount_tzs, balance_due_tzs, event_date')
        .limit(5000),
      db.from('studio_messages').select('booking_id, sender, created_at').limit(10000),
      db.from('studio_projects').select('id, title, is_published, updated_at').limit(2000),
      db.from('studio_articles').select('id, title, is_published, updated_at').limit(2000),
      db.from('studio_services').select('id, title, price, is_active, updated_at').limit(2000),
      db.from('studio_availability').select('date, is_available').eq('is_available', false).eq('time_slot', 'all-day').limit(5000),
      // Activity feed — recent booking events
      db.from('studio_booking_events').select('id, booking_id, event_type, actor, description, created_at').order('created_at', { ascending: false }).limit(8),
    ]);

    const queryError =
      bookingsResult.error || messagesResult.error || projectsResult.error ||
      articlesResult.error || servicesResult.error || availabilityResult.error;
    if (queryError) return NextResponse.json({ error: queryError.message }, { status: 500 });

    const bookings = (bookingsResult.data || []) as BookingRow[];
    const messages = (messagesResult.data || []) as MessageRow[];
    const projects = (projectsResult.data || []) as ProjectRow[];
    const articles = (articlesResult.data || []) as ArticleRow[];
    const services = (servicesResult.data || []) as ServiceRow[];
    const blockedAvailability = (availabilityResult.data || []) as AvailabilityRow[];
    const recentActivity = (eventsResult.data || []) as BookingEventRow[];

    // -----------------------------------------------------------------------
    // Computed values
    // -----------------------------------------------------------------------
    const now = new Date();
    const today = startOfDay(now);
    const sevenDaysAgo = addDays(today, -7);
    const fourteenDaysAgo = addDays(today, -14);
    const thirtyDaysAgo = addDays(today, -30);
    const sixtyDaysAgo = addDays(today, -60);
    const inSevenDays = addDays(today, 7);
    const staleThreshold = addDays(today, -30);
    const overdueThreshold = addDays(now, -1);

    // Status counts (legacy)
    const statusCounts: Record<StudioBookingStatus, number> = {
      new: 0, contacted: 0, quoted: 0, confirmed: 0, completed: 0, cancelled: 0,
    };
    for (const b of bookings) statusCounts[b.status] += 1;

    // Recent bookings (5)
    const recentBookings = [...bookings]
      .sort((a, b) => (asDate(b.created_at)?.getTime() || 0) - (asDate(a.created_at)?.getTime() || 0))
      .slice(0, 5);

    // Unread conversations
    const openConversationIds = new Set(
      bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled').map((b) => b.id)
    );
    let unreadConversations = 0;
    if (messages.length > 0) {
      const byBooking = new Map<string, MessageRow[]>();
      for (const m of messages) {
        if (!m.booking_id) continue;
        const bucket = byBooking.get(m.booking_id) || [];
        bucket.push(m);
        byBooking.set(m.booking_id, bucket);
      }
      for (const bookingId of openConversationIds) {
        const thread = byBooking.get(bookingId);
        if (!thread || thread.length === 0) continue;
        thread.sort((a, b) => (asDate(a.created_at)?.getTime() || 0) - (asDate(b.created_at)?.getTime() || 0));
        if (thread[thread.length - 1].sender !== 'admin') unreadConversations += 1;
      }
    }

    // Upcoming events (5) — prefer event_date over preferred_date
    const upcomingBookings = bookings
      .filter((b) => {
        if (b.status === 'cancelled' || b.status === 'completed') return false;
        const date = resolveEventDate(b);
        return !!date && date >= today && date <= inSevenDays;
      })
      .sort((a, b) => (resolveEventDate(a)?.getTime() || 0) - (resolveEventDate(b)?.getTime() || 0))
      .slice(0, 5);

    // Availability conflicts
    const blockedDays = new Set(blockedAvailability.map((i) => i.date));
    const availabilityConflicts = bookings.filter((b) => {
      if (b.status === 'cancelled' || b.status === 'completed') return false;
      if (!b.preferred_date) return false;
      return blockedDays.has(b.preferred_date);
    }).length;

    // Overdue follow-ups
    const overdueFollowUps = bookings.filter((b) => {
      if (!['new', 'contacted'].includes(b.status)) return false;
      if (b.responded_at) return false;
      const c = asDate(b.created_at);
      return !!c && c < overdueThreshold;
    }).length;

    // Inquiry KPIs
    const inquiries7d = getPeriodCount(bookings, sevenDaysAgo, now);
    const inquiriesPrev7d = getPeriodCount(bookings, fourteenDaysAgo, sevenDaysAgo);

    // Conversion
    const recent30 = bookings.filter((b) => { const c = asDate(b.created_at); return !!c && c >= thirtyDaysAgo; });
    const prev30 = bookings.filter((b) => { const c = asDate(b.created_at); return !!c && c >= sixtyDaysAgo && c < thirtyDaysAgo; });
    const conversionRecent = recent30.length
      ? Math.round((recent30.filter((b) => SUCCESS_STATUSES.includes(b.status)).length / recent30.length) * 1000) / 10
      : 0;
    const conversionPrev = prev30.length
      ? Math.round((prev30.filter((b) => SUCCESS_STATUSES.includes(b.status)).length / prev30.length) * 1000) / 10
      : 0;

    // CMS
    const publishedProjects = projects.filter((p) => p.is_published).length;
    const publishedArticles = articles.filter((a) => a.is_published).length;
    const activeServices = services.filter((s) => s.is_active).length;
    const totalContent = projects.length + articles.length + services.length;
    const publishedContent = publishedProjects + publishedArticles + activeServices;
    const cmsHealthPercent = totalContent ? Math.round((publishedContent / totalContent) * 100) : 0;

    const staleProjects = projects.filter((p) => { const u = asDate(p.updated_at); return !!u && u < staleThreshold; }).length;
    const staleArticles = articles.filter((a) => { const u = asDate(a.updated_at); return !!u && u < staleThreshold; }).length;
    const staleServices = services.filter((s) => { const u = asDate(s.updated_at); return !!u && u < staleThreshold; }).length;

    const cmsRecentUpdates: Array<{ id: string; type: string; title: string; status: string; updated_at: string; href: string }> = [
      ...projects.map((p) => ({ id: p.id, type: 'project', title: p.title, status: p.is_published ? 'published' : 'draft', updated_at: p.updated_at, href: `/studio-admin/projects/${p.id}` })),
      ...articles.map((a) => ({ id: a.id, type: 'article', title: a.title, status: a.is_published ? 'published' : 'draft', updated_at: a.updated_at, href: `/studio-admin/articles/${a.id}` })),
      ...services.map((s) => ({ id: s.id, type: 'service', title: s.title, status: s.is_active ? 'active' : 'inactive', updated_at: s.updated_at, href: `/studio-admin/services/${s.id}` })),
    ].sort((a, b) => (asDate(b.updated_at)?.getTime() || 0) - (asDate(a.updated_at)?.getTime() || 0)).slice(0, 4);

    // Performance
    const topServices = Object.entries(
      bookings.reduce<Record<string, number>>((acc, b) => { const n = b.service?.trim() || 'Unspecified'; acc[n] = (acc[n] || 0) + 1; return acc; }, {})
    ).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

    const topEventTypes = Object.entries(
      bookings.reduce<Record<string, number>>((acc, b) => { const n = b.event_type?.trim() || 'Other'; acc[n] = (acc[n] || 0) + 1; return acc; }, {})
    ).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 4);

    // Lifecycle metrics
    const lifecycle = buildLifecycleMetrics(bookings);

    // Weekly inquiry trend (past 8 weeks)
    const weeklyInquiries = buildWeeklyInquiries(bookings, now);

    // Revenue by service (top 5)
    const revenueByService = buildRevenueByService(bookings);

    // -----------------------------------------------------------------------
    // Response
    // -----------------------------------------------------------------------
    return NextResponse.json({
      priorities: {
        newInquiries: statusCounts.new,
        overdueFollowUps,
        openConversations: openConversationIds.size,
        unreadConversations,
        upcoming7d: upcomingBookings.length,
        availabilityConflicts,
      },
      kpis: {
        inquiries7d: { value: inquiries7d, deltaPercent: getDeltaPercent(inquiries7d, inquiriesPrev7d) },
        activePipeline: { value: ACTIVE_PIPELINE_STATUSES.reduce((sum, s) => sum + statusCounts[s], 0), totalBookings: bookings.length },
        conversion30d: { value: conversionRecent, deltaPercent: Math.round((conversionRecent - conversionPrev) * 10) / 10 },
        confirmedValue: { value: lifecycle.revenue.total_tzs, currency: 'TZS', pipelineValue: 0 },
        cmsHealth: { value: cmsHealthPercent, published: publishedContent, total: totalContent },
      },
      pipeline: { statuses: statusCounts, activeTotal: ACTIVE_PIPELINE_STATUSES.reduce((sum, s) => sum + statusCounts[s], 0) },
      upcoming: upcomingBookings,
      recentBookings,
      cms: {
        projects: { total: projects.length, published: publishedProjects, stale: staleProjects },
        articles: { total: articles.length, published: publishedArticles, stale: staleArticles },
        services: { total: services.length, published: activeServices, stale: staleServices },
        recentUpdates: cmsRecentUpdates,
      },
      performance: { topServices, topEventTypes },
      lifecycle,
      weeklyInquiries,
      revenueByService,
      recentActivity,
      generatedAt: toIsoDay(now),
    });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
