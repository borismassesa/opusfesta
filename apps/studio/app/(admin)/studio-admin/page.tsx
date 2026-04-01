'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BsActivity, BsArrowRight, BsCalendar, BsExclamationCircle, BsClock,
  BsFunnel, BsChatSquareText, BsGraphUp, BsWallet2, BsArrowUpShort,
  BsArrowDownShort, BsDashLg, BsFileText, BsPerson, BsGear,
} from 'react-icons/bs';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from 'recharts';
import AdminToast from '@/components/admin/ui/AdminToast';
import AdminBadge from '@/components/admin/ui/AdminBadge';
import AdminLifecycleBadge from '@/components/admin/ui/AdminLifecycleBadge';
import AdminTable from '@/components/admin/ui/AdminTable';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/booking-state-machine';
import type { StudioBooking, StudioBookingStatus } from '@/lib/studio-types';
import type { BookingLifecycleStatus } from '@/lib/booking-types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CmsOverview = { total: number; published: number; stale: number };

interface DashboardData {
  priorities: {
    newInquiries: number;
    overdueFollowUps: number;
    openConversations: number;
    unreadConversations: number;
    upcoming7d: number;
    availabilityConflicts: number;
  };
  kpis: {
    inquiries7d: { value: number; deltaPercent: number };
    activePipeline: { value: number; totalBookings: number };
    conversion30d: { value: number; deltaPercent: number };
    confirmedValue: { value: number; currency: string; pipelineValue: number };
    cmsHealth: { value: number; published: number; total: number };
  };
  pipeline: {
    statuses: Record<StudioBookingStatus, number>;
    activeTotal: number;
  };
  upcoming: StudioBooking[];
  recentBookings: StudioBooking[];
  cms: {
    projects: CmsOverview;
    articles: CmsOverview;
    services: CmsOverview;
    recentUpdates: Array<{
      id: string;
      type: 'portfolio' | 'article' | 'service';
      title: string;
      status: 'published' | 'draft' | 'active' | 'inactive';
      updated_at: string;
      href: string;
    }>;
  };
  performance: {
    topServices: Array<{ name: string; count: number }>;
    topEventTypes: Array<{ name: string; count: number }>;
  };
  lifecycle: {
    statusCounts: Partial<Record<BookingLifecycleStatus, number>>;
    pipelineCount: number;
    funnel: Record<string, number>;
    revenue: {
      total_tzs: number;
      deposits_collected_tzs: number;
      outstanding_balance_tzs: number;
      currency: string;
    };
  };
  weeklyInquiries: Array<{ week: string; count: number }>;
  revenueByService: Array<{ service: string; total_tzs: number }>;
  recentActivity: Array<{
    id: string;
    booking_id: string;
    event_type: string;
    actor: string;
    description: string | null;
    created_at: string;
  }>;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDashboardData(payload: unknown): payload is DashboardData {
  if (!isRecord(payload)) return false;
  if (!isRecord(payload.priorities)) return false;
  if (!isRecord(payload.kpis)) return false;
  if (!isRecord(payload.pipeline)) return false;
  if (!isRecord(payload.cms)) return false;
  if (!isRecord(payload.performance)) return false;
  if (!isRecord(payload.lifecycle)) return false;
  if (!isRecord(payload.pipeline.statuses)) return false;
  if (!Array.isArray(payload.upcoming)) return false;
  if (!Array.isArray(payload.recentBookings)) return false;
  if (!Array.isArray(payload.weeklyInquiries)) return false;
  if (!Array.isArray(payload.revenueByService)) return false;
  if (!Array.isArray(payload.recentActivity)) return false;
  return true;
}

function fmtDate(date: string | null) {
  if (!date) return 'Not set';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Not set';
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtCurrency(value: number, currency: string = 'TZS') {
  return `${currency} ${Math.round(value).toLocaleString()}`;
}

function fmtDelta(delta: number) {
  if (!Number.isFinite(delta) || delta === 0) return 'Flat';
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
}

function fmtRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return fmtDate(dateStr);
}

// Chart color mapping for lifecycle statuses
const LIFECYCLE_CHART_COLORS: Record<string, string> = {
  gray: '#9ca3af',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  orange: '#f97316',
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
};

const PIE_COLORS = ['#D6492A', '#B03A20', '#8B2E18', '#E8735A', '#F09A88'];

// ---------------------------------------------------------------------------
// MetricCard component
// ---------------------------------------------------------------------------
function MetricCard({
  label, value, hint, icon, href, delta,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  href: string;
  delta?: number;
}) {
  return (
    <Link
      href={href}
      className="group border border-[var(--admin-border)] bg-[var(--admin-card)] p-4 shadow-[var(--admin-shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--admin-shadow-md)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--admin-muted)]">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-semibold tracking-[-0.03em] text-[var(--admin-card-foreground)]">{value}</p>
            {delta !== undefined && delta !== 0 && (
              <span className={`inline-flex items-center text-xs font-semibold ${delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {delta > 0 ? <BsArrowUpShort className="h-4 w-4" /> : <BsArrowDownShort className="h-4 w-4" />}
                {Math.abs(delta).toFixed(1)}%
              </span>
            )}
            {delta === 0 && (
              <span className="inline-flex items-center text-xs font-medium text-gray-400">
                <BsDashLg className="h-3 w-3 mr-0.5" /> Flat
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-[var(--admin-accent-foreground)]">{hint}</p>
        </div>
        <div className="mt-1 border border-[var(--admin-border)] bg-[var(--admin-secondary)] p-2 text-[var(--admin-primary)]">{icon}</div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function DashboardPage() {
  const [period, setPeriod] = useState<string>('30d');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await fetch(`/api/admin/dashboard?period=${period}`);
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const message = isRecord(payload) && typeof payload.error === 'string' ? payload.error : 'Failed to load dashboard data.';
        throw new Error(message);
      }
      if (!isDashboardData(payload)) throw new Error('Dashboard response was incomplete.');
      setData(payload);
    } catch (error: unknown) {
      setData(null);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadDashboard(); }, [period]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-20 animate-pulse border border-gray-200 bg-gray-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse border border-gray-200 bg-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="h-72 animate-pulse border border-gray-200 bg-gray-100" />
          <div className="h-72 animate-pulse border border-gray-200 bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {errorMessage || 'Failed to load dashboard data.'}
      </div>
    );
  }

  const { priorities, kpis, pipeline, upcoming, recentBookings, cms, performance, lifecycle, weeklyInquiries, revenueByService, recentActivity } = data;

  // Build lifecycle funnel chart data
  const lifecycleFunnelData = Object.entries(lifecycle.statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status: STATUS_LABELS[status as BookingLifecycleStatus] || status,
      count,
      fill: LIFECYCLE_CHART_COLORS[STATUS_COLORS[status as BookingLifecycleStatus]] || '#9ca3af',
    }));

  const hasAlerts = priorities.unreadConversations > 0 || priorities.overdueFollowUps > 0 || priorities.availabilityConflicts > 0 || priorities.newInquiries > 0;

  return (
    <div className="space-y-6">
      <AdminToast />

      {/* ================================================================ */}
      {/* SECTION 1: Header */}
      {/* ================================================================ */}
      <section className="bg-[var(--admin-card)] shadow-[var(--admin-shadow-sm)] border border-[var(--admin-border)]">
        {/* Top Header - Title & Quick Actions */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-5 py-5 border-b border-[var(--admin-border)]">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--admin-muted)]">Studio command center</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--admin-card-foreground)]">Overview</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/studio-admin/bookings/queue" className="border border-green-600 bg-green-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-700 transition-colors hover:bg-green-100 flex items-center gap-1.5 shadow-sm">
              <BsActivity className="w-3.5 h-3.5" /> Open Queue
            </Link>
            <Link href="/studio-admin/articles/new" className="border border-[var(--admin-border)] bg-[var(--admin-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-secondary-foreground)] transition-colors hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] shadow-sm">
              + New Article
            </Link>
          </div>
        </div>

        {/* Sub Header - Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 bg-[var(--admin-secondary)]/50">
          <div className="flex items-center gap-3">
            <label htmlFor="period-filter" className="text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--admin-muted)]">Timeframe</label>
            <select
              id="period-filter"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs font-semibold bg-white border border-[var(--admin-border)] rounded-sm px-2 py-1 outline-none focus:border-[var(--admin-primary)] transition-colors cursor-pointer"
            >
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date (YTD)</option>
              <option value="12m">Last 12 Months</option>
              {/* Note: Disabling 'All Time' as it strains the chart grouping without year buckets */}
            </select>
          </div>
          
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--admin-muted)]">
            Updated today
          </span>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 2: Priority Alerts Strip */}
      {/* ================================================================ */}
      {hasAlerts && (
        <section className="flex flex-wrap gap-2">
          {priorities.unreadConversations > 0 && (
            <Link href="/studio-admin/messages" className="inline-flex items-center gap-1.5 border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-red-700 transition-colors hover:bg-red-100">
              <BsChatSquareText className="h-3 w-3" /> {priorities.unreadConversations} unread messages
            </Link>
          )}
          {priorities.overdueFollowUps > 0 && (
            <Link href="/studio-admin/bookings" className="inline-flex items-center gap-1.5 border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 transition-colors hover:bg-amber-100">
              <BsExclamationCircle className="h-3 w-3" /> {priorities.overdueFollowUps} overdue follow-ups
            </Link>
          )}
          {priorities.availabilityConflicts > 0 && (
            <Link href="/studio-admin/availability" className="inline-flex items-center gap-1.5 border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-700 transition-colors hover:bg-orange-100">
              <BsClock className="h-3 w-3" /> {priorities.availabilityConflicts} availability conflicts
            </Link>
          )}
          {priorities.newInquiries > 0 && (
            <Link href="/studio-admin/bookings" className="inline-flex items-center gap-1.5 border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 transition-colors hover:bg-blue-100">
              <BsFunnel className="h-3 w-3" /> {priorities.newInquiries} new inquiries
            </Link>
          )}
        </section>
      )}

      {/* ================================================================ */}
      {/* SECTION 3: KPI Metric Cards */}
      {/* ================================================================ */}
      <section>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Active pipeline"
            value={pipeline.activeTotal}
            hint={`${kpis.inquiries7d.value} new inquiries (selected period)`}
            icon={<BsFunnel className="h-4 w-4" />}
            href="/studio-admin/bookings"
            delta={kpis.inquiries7d.deltaPercent}
          />
          <MetricCard
            label="Confirmed revenue"
            value={fmtCurrency(lifecycle.revenue.total_tzs)}
            hint={kpis.confirmedValue.pipelineValue > 0 ? `+ ${fmtCurrency(kpis.confirmedValue.pipelineValue)} pending in quotes` : 'No active pipeline value'}
            icon={<BsWallet2 className="h-4 w-4" />}
            href="/studio-admin/bookings"
          />
          <MetricCard
            label={`Conversion`}
            value={`${kpis.conversion30d.value}%`}
            hint={`${fmtDelta(kpis.conversion30d.deltaPercent)} vs previous period`}
            icon={<BsActivity className="h-4 w-4" />}
            href="/studio-admin/bookings"
            delta={kpis.conversion30d.deltaPercent}
          />
          <MetricCard
            label="Upcoming (7d)"
            value={priorities.upcoming7d}
            hint={upcoming.length > 0 ? `Next: ${upcoming[0].name} on ${fmtDate(upcoming[0].preferred_date)}` : 'No upcoming events'}
            icon={<BsCalendar className="h-4 w-4" />}
            href="/studio-admin/availability"
          />
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 4: Lifecycle Funnel + Weekly Inquiry Trend */}
      {/* ================================================================ */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Lifecycle Funnel */}
        <div className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 xl:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-card-foreground)]">Booking lifecycle</h3>
            <Link href="/studio-admin/bookings" className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-primary)] hover:text-[var(--admin-primary)]/80">
              Manage pipeline
            </Link>
          </div>
          <div className="h-64 mt-2 text-xs font-mono">
            {lifecycleFunnelData.length === 0 ? (
              <p className="text-sm text-[var(--admin-muted)]">No bookings in the lifecycle yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lifecycleFunnelData} margin={{ top: 5, right: 10, left: 10, bottom: 30 }}>
                  <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 9, angle: -35, textAnchor: 'end' }} interval={0} height={50} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#fef2ef' }} contentStyle={{ borderRadius: '8px', borderColor: '#e6e6e6', fontSize: '11px' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={32}>
                    {lifecycleFunnelData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Weekly Inquiry Trend */}
        <div className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 xl:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-card-foreground)]">Weekly inquiries</h3>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--admin-muted)]">Past 8 weeks</span>
          </div>
          <div className="h-64 mt-2 text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyInquiries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inquiryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D6492A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#D6492A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', borderColor: '#e6e6e6', fontSize: '11px' }} />
                <Area type="monotone" dataKey="count" stroke="#D6492A" strokeWidth={2} fill="url(#inquiryGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 5: Upcoming Events + Revenue Summary */}
      {/* ================================================================ */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Upcoming Events */}
        <div className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 xl:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-card-foreground)]">Upcoming events</h3>
            <Link href="/studio-admin/availability" className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-primary)] hover:text-[var(--admin-primary)]/80">
              View calendar
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-[var(--admin-muted)]">No upcoming events in the next 7 days.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 5).map((booking) => (
                <Link
                  key={booking.id}
                  href={`/studio-admin/bookings/${booking.id}`}
                  className="flex items-start justify-between border border-[var(--admin-border)] p-3 transition-colors hover:border-[var(--admin-primary)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--admin-card-foreground)]">{booking.name}</p>
                    <p className="mt-1 text-xs text-[var(--admin-muted)]">{booking.event_type} · {booking.service || 'General enquiry'}</p>
                    <p className="mt-1 text-xs text-[var(--admin-muted)]">{fmtDate(booking.preferred_date)}</p>
                  </div>
                  <AdminBadge status={booking.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Summary */}
        <div className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 xl:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-card-foreground)]">Revenue overview</h3>
            <BsWallet2 className="h-4 w-4 text-[var(--admin-primary)]" />
          </div>

          {/* Revenue KPIs */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-2">
              <span className="text-xs text-[var(--admin-muted)]">Confirmed revenue</span>
              <span className="text-sm font-semibold text-[var(--admin-card-foreground)]">{fmtCurrency(lifecycle.revenue.total_tzs)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-2">
              <span className="text-xs text-[var(--admin-muted)]">Deposits collected</span>
              <span className="text-sm font-semibold text-green-600">{fmtCurrency(lifecycle.revenue.deposits_collected_tzs)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--admin-muted)]">Outstanding balance</span>
              <span className="text-sm font-semibold text-amber-600">{fmtCurrency(lifecycle.revenue.outstanding_balance_tzs)}</span>
            </div>
          </div>

          {/* Revenue by Service Chart */}
          {revenueByService.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--admin-muted)]">Revenue by service</p>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByService} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="service" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 9 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', borderColor: '#e6e6e6', fontSize: '11px' }}
                      formatter={(value) => [fmtCurrency(Number(value) || 0), 'Revenue']}
                    />
                    <Bar dataKey="total_tzs" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 6: Recent Bookings + Activity Feed */}
      {/* ================================================================ */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Recent Bookings */}
        <div className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 xl:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-card-foreground)]">Recent bookings</h3>
          </div>
          <AdminTable
            data={recentBookings.slice(0, 5)}
            keyField="id"
            emptyMessage="No bookings yet."
            onRowClick={(booking) => router.push(`/studio-admin/bookings/${booking.id}`)}
            columns={[
              {
                key: 'client',
                header: 'Client',
                render: (booking) => (
                  <div>
                    <p className="font-medium text-[var(--admin-card-foreground)]">{booking.name}</p>
                    <p className="text-xs text-[var(--admin-muted)]">{booking.email}</p>
                  </div>
                ),
              },
              { key: 'event', header: 'Event', render: (b) => b.event_type },
              {
                key: 'status',
                header: 'Status',
                render: (b) => {
                  const ls = (b as unknown as Record<string, unknown>).lifecycle_status as BookingLifecycleStatus | null;
                  return ls ? <AdminLifecycleBadge status={ls} /> : <AdminBadge status={b.status as StudioBookingStatus} />;
                },
              },
              { key: 'date', header: 'Date', render: (b) => fmtDate(b.created_at) },
            ]}
          />
          <div className="mt-3 flex justify-end">
            <Link href="/studio-admin/bookings" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-primary)] hover:text-[var(--admin-primary)]/80">
              View all bookings <BsArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 xl:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-card-foreground)]">Recent activity</h3>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-[var(--admin-muted)]">No activity recorded yet.</p>
          ) : (
            <div className="space-y-0">
              {recentActivity.slice(0, 8).map((event) => (
                <Link
                  key={event.id}
                  href={`/studio-admin/bookings/${event.booking_id}`}
                  className="flex items-start gap-3 border-b border-[var(--admin-border)] py-3 last:border-b-0 transition-colors hover:bg-[var(--admin-secondary)]"
                >
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--admin-primary)]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[var(--admin-card-foreground)] truncate">
                      {event.description || event.event_type.replace(/_/g, ' ')}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[var(--admin-muted)]">
                      <span className="inline-flex items-center gap-1">
                        {event.actor === 'admin' ? <BsGear className="h-2.5 w-2.5" /> : <BsPerson className="h-2.5 w-2.5" />}
                        {event.actor}
                      </span>
                      <span>{fmtRelativeTime(event.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 7: CMS Health + Performance */}
      {/* ================================================================ */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* CMS Health */}
        <div className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 xl:col-span-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-card-foreground)]">CMS health</h3>
            <Link href="/studio-admin/articles/new" className="border border-[var(--admin-primary)] bg-[var(--admin-primary)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-primary-foreground)] transition-colors hover:bg-[#e67900]">
              + New article
            </Link>
          </div>

          {/* Health progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--admin-muted)]">Published content</span>
              <span className="text-xs font-semibold text-[var(--admin-card-foreground)]">{kpis.cmsHealth.value}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${kpis.cmsHealth.value}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-[var(--admin-muted)]">{kpis.cmsHealth.published} of {kpis.cmsHealth.total} items published</p>
          </div>

          {/* CMS cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Portfolio', href: '/studio-admin/portfolio', data: cms.projects },
              { label: 'Articles', href: '/studio-admin/articles', data: cms.articles },
              { label: 'Services', href: '/studio-admin/services', data: cms.services },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="border border-[var(--admin-border)] bg-[var(--admin-secondary)] p-3 transition-colors hover:border-[var(--admin-primary)]">
                <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--admin-muted)]">{item.label}</p>
                <p className="mt-1 text-base font-semibold text-[var(--admin-card-foreground)]">{item.data.published}/{item.data.total}</p>
                {item.data.stale > 0 && <p className="mt-1 text-[10px] text-amber-600">{item.data.stale} stale</p>}
              </Link>
            ))}
          </div>

          {/* Recent CMS updates */}
          {cms.recentUpdates.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--admin-muted)]">Recently updated</p>
              <div className="space-y-0">
                {cms.recentUpdates.slice(0, 4).map((item) => (
                  <Link key={item.id} href={item.href} className="flex items-center justify-between py-2 border-b border-[var(--admin-border)] last:border-b-0 hover:bg-[var(--admin-secondary)] transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`shrink-0 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                        item.type === 'portfolio' ? 'bg-violet-50 text-violet-600' :
                        item.type === 'article' ? 'bg-blue-50 text-blue-600' :
                        'bg-green-50 text-green-600'
                      }`}>{item.type}</span>
                      <span className="text-xs text-[var(--admin-card-foreground)] truncate">{item.title}</span>
                    </div>
                    <span className="shrink-0 text-[10px] text-[var(--admin-muted)] ml-2">{fmtRelativeTime(item.updated_at)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Performance */}
        <div className="border border-[var(--admin-border)] bg-[var(--admin-card)] p-5 xl:col-span-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-card-foreground)]">Performance</h3>
            <BsGraphUp className="h-4 w-4 text-[var(--admin-primary)]" />
          </div>

          {/* Service Demand Pie + Legend */}
          <div className="mb-6">
            <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--admin-muted)]">Service demand</p>
            {performance.topServices.length === 0 ? (
              <p className="text-sm text-[var(--admin-muted)]">No service demand data yet.</p>
            ) : (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={performance.topServices} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={2}>
                      {performance.topServices.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', borderColor: '#e6e6e6', fontSize: '11px' }} />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Event Types */}
          <div>
            <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--admin-muted)]">Top event types</p>
            {performance.topEventTypes.length === 0 ? (
              <p className="text-sm text-[var(--admin-muted)]">No event data yet.</p>
            ) : (
              <div className="space-y-2">
                {performance.topEventTypes.slice(0, 4).map((item) => {
                  const maxCount = performance.topEventTypes[0]?.count || 1;
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[var(--admin-card-foreground)]">{item.name}</span>
                        <span className="font-mono text-[var(--admin-muted)]">{item.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 overflow-hidden">
                        <div className="h-full bg-[var(--admin-primary)] transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
