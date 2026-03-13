import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import type { StudioBookingStatus } from '@/lib/studio-types';

type BookingRow = {
  id: string;
  name: string;
  email: string;
  event_type: string;
  preferred_date: string | null;
  location: string | null;
  service: string | null;
  status: StudioBookingStatus;
  responded_at: string | null;
  created_at: string;
};

type MessageRow = {
  booking_id: string | null;
  sender: string;
  created_at: string;
};

type ProjectRow = {
  id: string;
  title: string;
  is_published: boolean;
  updated_at: string;
};

type ArticleRow = {
  id: string;
  title: string;
  is_published: boolean;
  updated_at: string;
};

type ServiceRow = {
  id: string;
  title: string;
  price: string;
  is_active: boolean;
  updated_at: string;
};

type AvailabilityRow = {
  date: string;
  is_available: boolean;
};

const ACTIVE_PIPELINE_STATUSES: StudioBookingStatus[] = ['new', 'contacted', 'quoted', 'confirmed'];
const SUCCESS_STATUSES: StudioBookingStatus[] = ['confirmed', 'completed'];

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
  return bookings.filter((booking) => {
    const createdAt = asDate(booking.created_at);
    return !!createdAt && createdAt >= from && createdAt < to;
  }).length;
}

function getDeltaPercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function parseServiceValue(price: string): number {
  const numeric = Number(price.replace(/[^\d]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

function resolveServiceValue(serviceName: string | null, services: ServiceRow[]): number {
  if (!serviceName) return 0;
  const normalized = serviceName.trim().toLowerCase();
  if (!normalized) return 0;

  const directMatch = services.find((service) => service.title.trim().toLowerCase() === normalized);
  if (directMatch) return parseServiceValue(directMatch.price);

  const partialMatch = services.find((service) => {
    const title = service.title.trim().toLowerCase();
    return title.includes(normalized) || normalized.includes(title);
  });

  return partialMatch ? parseServiceValue(partialMatch.price) : 0;
}

export async function GET() {
  try {
    await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();

    const [
      bookingsResult,
      messagesResult,
      projectsResult,
      articlesResult,
      servicesResult,
      availabilityResult,
    ] = await Promise.all([
      db.from('studio_bookings').select('id, name, email, event_type, preferred_date, location, service, status, responded_at, created_at').limit(5000),
      db.from('studio_messages').select('booking_id, sender, created_at').limit(10000),
      db.from('studio_projects').select('id, title, is_published, updated_at').limit(2000),
      db.from('studio_articles').select('id, title, is_published, updated_at').limit(2000),
      db.from('studio_services').select('id, title, price, is_active, updated_at').limit(2000),
      db.from('studio_availability').select('date, is_available').eq('is_available', false).eq('time_slot', 'all-day').limit(5000),
    ]);

    const queryError =
      bookingsResult.error ||
      messagesResult.error ||
      projectsResult.error ||
      articlesResult.error ||
      servicesResult.error ||
      availabilityResult.error;
    if (queryError) return NextResponse.json({ error: queryError.message }, { status: 500 });

    const bookings = (bookingsResult.data || []) as BookingRow[];
    const messages = (messagesResult.data || []) as MessageRow[];
    const projects = (projectsResult.data || []) as ProjectRow[];
    const articles = (articlesResult.data || []) as ArticleRow[];
    const services = (servicesResult.data || []) as ServiceRow[];
    const blockedAvailability = (availabilityResult.data || []) as AvailabilityRow[];

    const now = new Date();
    const today = startOfDay(now);
    const sevenDaysAgo = addDays(today, -7);
    const fourteenDaysAgo = addDays(today, -14);
    const thirtyDaysAgo = addDays(today, -30);
    const sixtyDaysAgo = addDays(today, -60);
    const inSevenDays = addDays(today, 7);
    const staleThreshold = addDays(today, -30);
    const overdueThreshold = addDays(now, -1);

    const statusCounts = {
      new: 0,
      contacted: 0,
      quoted: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    } as Record<StudioBookingStatus, number>;

    for (const booking of bookings) {
      statusCounts[booking.status] += 1;
    }

    const recentBookings = [...bookings]
      .sort((a, b) => (asDate(b.created_at)?.getTime() || 0) - (asDate(a.created_at)?.getTime() || 0))
      .slice(0, 6);

    const openConversationIds = new Set(
      bookings
        .filter((booking) => booking.status !== 'completed' && booking.status !== 'cancelled')
        .map((booking) => booking.id)
    );

    let unreadConversations = 0;
    if (messages.length > 0) {
      const byBooking = new Map<string, MessageRow[]>();
      for (const message of messages) {
        if (!message.booking_id) continue;
        const bucket = byBooking.get(message.booking_id) || [];
        bucket.push(message);
        byBooking.set(message.booking_id, bucket);
      }

      for (const bookingId of openConversationIds) {
        const thread = byBooking.get(bookingId);
        if (!thread || thread.length === 0) continue;
        thread.sort((a, b) => (asDate(a.created_at)?.getTime() || 0) - (asDate(b.created_at)?.getTime() || 0));
        const last = thread[thread.length - 1];
        if (last.sender !== 'admin') unreadConversations += 1;
      }
    }

    const upcomingBookings = bookings
      .filter((booking) => {
        if (booking.status === 'cancelled' || booking.status === 'completed') return false;
        const date = asDate(booking.preferred_date);
        return !!date && date >= today && date <= inSevenDays;
      })
      .sort((a, b) => (asDate(a.preferred_date)?.getTime() || 0) - (asDate(b.preferred_date)?.getTime() || 0));

    const blockedDays = new Set(blockedAvailability.map((item) => item.date));
    const availabilityConflicts = bookings.filter((booking) => {
      if (booking.status === 'cancelled' || booking.status === 'completed') return false;
      if (!booking.preferred_date) return false;
      return blockedDays.has(booking.preferred_date);
    }).length;

    const overdueFollowUps = bookings.filter((booking) => {
      if (!['new', 'contacted'].includes(booking.status)) return false;
      if (booking.responded_at) return false;
      const createdAt = asDate(booking.created_at);
      return !!createdAt && createdAt < overdueThreshold;
    }).length;

    const inquiries7d = getPeriodCount(bookings, sevenDaysAgo, now);
    const inquiriesPrev7d = getPeriodCount(bookings, fourteenDaysAgo, sevenDaysAgo);

    const recent30 = bookings.filter((booking) => {
      const createdAt = asDate(booking.created_at);
      return !!createdAt && createdAt >= thirtyDaysAgo;
    });
    const prev30 = bookings.filter((booking) => {
      const createdAt = asDate(booking.created_at);
      return !!createdAt && createdAt >= sixtyDaysAgo && createdAt < thirtyDaysAgo;
    });

    const conversionRecent = recent30.length
      ? Math.round((recent30.filter((booking) => SUCCESS_STATUSES.includes(booking.status)).length / recent30.length) * 1000) / 10
      : 0;
    const conversionPrev = prev30.length
      ? Math.round((prev30.filter((booking) => SUCCESS_STATUSES.includes(booking.status)).length / prev30.length) * 1000) / 10
      : 0;

    const confirmedValue = bookings
      .filter((booking) => booking.status === 'confirmed')
      .reduce((sum, booking) => sum + resolveServiceValue(booking.service, services), 0);
    const activePipelineValue = bookings
      .filter((booking) => ACTIVE_PIPELINE_STATUSES.includes(booking.status))
      .reduce((sum, booking) => sum + resolveServiceValue(booking.service, services), 0);

    const publishedProjects = projects.filter((project) => project.is_published).length;
    const publishedArticles = articles.filter((article) => article.is_published).length;
    const activeServices = services.filter((service) => service.is_active).length;

    const totalContent = projects.length + articles.length + services.length;
    const publishedContent = publishedProjects + publishedArticles + activeServices;
    const cmsHealthPercent = totalContent ? Math.round((publishedContent / totalContent) * 100) : 0;

    const staleProjects = projects.filter((project) => {
      const updatedAt = asDate(project.updated_at);
      return !!updatedAt && updatedAt < staleThreshold;
    }).length;
    const staleArticles = articles.filter((article) => {
      const updatedAt = asDate(article.updated_at);
      return !!updatedAt && updatedAt < staleThreshold;
    }).length;
    const staleServices = services.filter((service) => {
      const updatedAt = asDate(service.updated_at);
      return !!updatedAt && updatedAt < staleThreshold;
    }).length;

    const cmsRecentUpdates = [
      ...projects.map((project) => ({
        id: project.id,
        type: 'project',
        title: project.title,
        status: project.is_published ? 'published' : 'draft',
        updated_at: project.updated_at,
        href: `/studio-admin/projects/${project.id}`,
      })),
      ...articles.map((article) => ({
        id: article.id,
        type: 'article',
        title: article.title,
        status: article.is_published ? 'published' : 'draft',
        updated_at: article.updated_at,
        href: `/studio-admin/articles/${article.id}`,
      })),
      ...services.map((service) => ({
        id: service.id,
        type: 'service',
        title: service.title,
        status: service.is_active ? 'active' : 'inactive',
        updated_at: service.updated_at,
        href: `/studio-admin/services/${service.id}`,
      })),
    ]
      .sort((a, b) => (asDate(b.updated_at)?.getTime() || 0) - (asDate(a.updated_at)?.getTime() || 0))
      .slice(0, 8);

    const topServices = Object.entries(
      bookings.reduce<Record<string, number>>((acc, booking) => {
        const name = booking.service?.trim() || 'Unspecified';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topEventTypes = Object.entries(
      bookings.reduce<Record<string, number>>((acc, booking) => {
        const name = booking.event_type?.trim() || 'Other';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

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
        inquiries7d: {
          value: inquiries7d,
          deltaPercent: getDeltaPercent(inquiries7d, inquiriesPrev7d),
        },
        activePipeline: {
          value: ACTIVE_PIPELINE_STATUSES.reduce((sum, status) => sum + statusCounts[status], 0),
          totalBookings: bookings.length,
        },
        conversion30d: {
          value: conversionRecent,
          deltaPercent: Math.round((conversionRecent - conversionPrev) * 10) / 10,
        },
        confirmedValue: {
          value: confirmedValue,
          currency: 'TZS',
          pipelineValue: activePipelineValue,
        },
        cmsHealth: {
          value: cmsHealthPercent,
          published: publishedContent,
          total: totalContent,
        },
      },
      pipeline: {
        statuses: statusCounts,
        activeTotal: ACTIVE_PIPELINE_STATUSES.reduce((sum, status) => sum + statusCounts[status], 0),
      },
      upcoming: upcomingBookings.slice(0, 8),
      stats: {
        totalBookings: bookings.length,
        newBookings: statusCounts.new,
        totalProjects: projects.length,
        publishedProjects,
        totalArticles: articles.length,
        publishedArticles,
        activeServices: activeServices,
      },
      recentBookings,
      cms: {
        projects: { total: projects.length, published: publishedProjects, stale: staleProjects },
        articles: { total: articles.length, published: publishedArticles, stale: staleArticles },
        services: { total: services.length, published: activeServices, stale: staleServices },
        recentUpdates: cmsRecentUpdates,
      },
      performance: {
        topServices,
        topEventTypes,
      },
      finance: {
        confirmedValue,
        pipelineValue: activePipelineValue,
        currency: 'TZS',
      },
      generatedAt: toIsoDay(now),
    });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
