'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BsActivity, BsArrowRight, BsCalendar, BsExclamationCircle, BsClock, BsPencilSquare, BsFunnel, BsChatSquareText, BsStars, BsGraphUp, BsWallet2 } from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminToast from '@/components/admin/ui/AdminToast';
import AdminBadge from '@/components/admin/ui/AdminBadge';
import AdminTable from '@/components/admin/ui/AdminTable';
import type { StudioBooking, StudioBookingStatus } from '@/lib/studio-types';

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
  stats: {
    totalBookings: number;
    newBookings: number;
    totalProjects: number;
    publishedProjects: number;
    totalArticles: number;
    publishedArticles: number;
    activeServices: number;
  };
  recentBookings: StudioBooking[];
  cms: {
    projects: CmsOverview;
    articles: CmsOverview;
    services: CmsOverview;
    recentUpdates: Array<{
      id: string;
      type: 'project' | 'article' | 'service';
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
  finance: {
    confirmedValue: number;
    pipelineValue: number;
    currency: string;
  };
}

const PIPELINE_ORDER: StudioBookingStatus[] = ['new', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled'];

const STATUS_TONE: Record<StudioBookingStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  quoted: 'bg-violet-100 text-violet-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

function fmtDate(date: string | null) {
  if (!date) return 'Not set';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Not set';
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtCurrency(value: number, currency: string) {
  return `${currency} ${Math.round(value).toLocaleString()}`;
}

function fmtDelta(delta: number) {
  if (!Number.isFinite(delta) || delta === 0) return 'Flat';
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
}

function MetricCard({
  label,
  value,
  hint,
  icon,
  href,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group border border-gray-200 bg-white p-4 transition-all hover:border-brand-accent hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-gray-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-gray-900">{value}</p>
          <p className="mt-2 text-xs text-gray-500">{hint}</p>
        </div>
        <div className="mt-1 border border-brand-accent/20 bg-brand-accent/10 p-2 text-brand-accent">{icon}</div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((payload) => setData(payload))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-28 animate-pulse border border-gray-200 bg-gray-100" />
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
        Failed to load dashboard data.
      </div>
    );
  }

  const {
    priorities,
    kpis,
    pipeline,
    upcoming,
    recentBookings,
    cms,
    performance,
    finance,
  } = data;

  const pipelineChartData = Object.entries(pipeline.statuses).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
  }));

  const pieColors = ['#171717', '#333333', '#555555', '#777777', '#999999'];

  const pipelineBase = Math.max(1, data.stats.totalBookings);

  return (
    <div className="space-y-6">
      <AdminToast />

      <section className="border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-brand-accent">Studio command center</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-gray-900">Operations and CMS Control</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-500">
              Monitor urgent work first, then manage publishing and performance from one admin surface.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/studio-admin/bookings" className="border border-brand-dark bg-brand-dark px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:border-brand-accent hover:bg-brand-accent">
              Open bookings
            </Link>
            <Link href="/studio-admin/messages" className="border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-700 transition-colors hover:border-brand-accent hover:text-brand-accent">
              Open inbox
            </Link>
            <Link href="/studio-admin/articles/new" className="border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-700 transition-colors hover:border-brand-accent hover:text-brand-accent">
              New article
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Quick Glances</h2>
          <div className="flex items-center gap-3">
            {priorities.unreadConversations > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1">
                <BsChatSquareText className="h-3 w-3" />
                {priorities.unreadConversations} Unread
              </span>
            )}
            {priorities.overdueFollowUps > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1">
                <BsExclamationCircle className="h-3 w-3" />
                {priorities.overdueFollowUps} Overdue
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Active pipeline"
            value={pipeline.activeTotal}
            hint={`${kpis.inquiries7d.value} new inquiries (7d)`}
            icon={<BsFunnel className="h-4 w-4" />}
            href="/studio-admin/bookings"
          />
          <MetricCard
            label="Confirmed value"
            value={fmtCurrency(kpis.confirmedValue.value, kpis.confirmedValue.currency)}
            hint={`Pipeline: ${fmtCurrency(kpis.confirmedValue.pipelineValue, kpis.confirmedValue.currency)}`}
            icon={<BsWallet2 className="h-4 w-4" />}
            href="/studio-admin/bookings"
          />
          <MetricCard
            label="Conversion (30d)"
            value={`${kpis.conversion30d.value}%`}
            hint={`${fmtDelta(kpis.conversion30d.deltaPercent)} vs previous 30d`}
            icon={<BsActivity className="h-4 w-4" />}
            href="/studio-admin/bookings"
          />
          <MetricCard
            label="Upcoming Events"
            value={priorities.upcoming7d}
            hint="Confirmed events in next 7 days"
            icon={<BsCalendar className="h-4 w-4" />}
            href="/studio-admin/availability"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="border border-gray-200 bg-white p-5 xl:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Bookings pipeline</h3>
            <Link href="/studio-admin/bookings" className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent hover:text-brand-secondary">
              Manage pipeline
            </Link>
          </div>
          <div className="h-64 mt-4 text-xs font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineChartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="status" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '0', borderColor: '#171717', fontSize: '11px', textTransform: 'uppercase' }} />
                <Bar dataKey="count" fill="#171717" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-gray-200 bg-white p-5 xl:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Today and next 7 days</h3>
            <Link href="/studio-admin/availability" className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent hover:text-brand-secondary">
              Calendar
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming events in the next 7 days.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/studio-admin/bookings/${booking.id}`}
                  className="flex items-start justify-between border border-gray-200 p-3 transition-colors hover:border-brand-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{booking.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{booking.event_type} • {booking.service || 'General enquiry'}</p>
                    <p className="mt-1 text-xs text-gray-500">{fmtDate(booking.preferred_date)}</p>
                  </div>
                  <AdminBadge status={booking.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="border border-gray-200 bg-white p-5 xl:col-span-12">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700">CMS control and health</h3>
            <Link href="/studio-admin/articles" className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent hover:text-brand-secondary">
              Open CMS
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { label: 'Projects', href: '/studio-admin/projects', data: cms.projects },
              { label: 'Articles', href: '/studio-admin/articles', data: cms.articles },
              { label: 'Services', href: '/studio-admin/services', data: cms.services },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-brand-accent hover:bg-white">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-gray-500">{item.label}</p>
                <p className="mt-2 text-xl font-semibold text-gray-900">{item.data.published} / {item.data.total}</p>
                <p className="mt-2 text-xs text-gray-500">{item.data.stale} stale entries</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="border border-gray-200 bg-white p-5 xl:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Performance snapshot</h3>
            <BsGraphUp className="h-4 w-4 text-brand-accent" />
          </div>
          <div className="space-y-8 mt-4">
            <div>
              <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Service Demand</p>
              <div className="h-48">
                {performance.topServices.length === 0 ? (
                  <p className="text-sm text-gray-500">No service demand yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={performance.topServices}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {performance.topServices.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '0', borderColor: '#171717', fontSize: '11px', textTransform: 'uppercase' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Top Event Types</p>
              <div className="space-y-2">
                {performance.topEventTypes.length === 0 ? (
                  <p className="text-sm text-gray-500">No event trend data yet.</p>
                ) : (
                  performance.topEventTypes.map((item) => (
                    <div key={item.name} className="flex items-center justify-between border-b border-gray-100 pb-2 text-sm">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-mono text-gray-500">{item.count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 bg-white p-5 xl:col-span-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Recent booking activity</h3>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <BsWallet2 className="h-3.5 w-3.5 text-brand-accent" />
                Confirmed: {fmtCurrency(finance.confirmedValue, finance.currency)}
              </span>
              <span className="inline-flex items-center gap-1">
                <BsActivity className="h-3.5 w-3.5 text-brand-accent" />
                Pipeline: {fmtCurrency(finance.pipelineValue, finance.currency)}
              </span>
            </div>
          </div>
          <AdminTable
            data={recentBookings}
            keyField="id"
            emptyMessage="No bookings yet."
            onRowClick={(booking) => {
              router.push(`/studio-admin/bookings/${booking.id}`);
            }}
            columns={[
              {
                key: 'client',
                header: 'Client',
                render: (booking) => (
                  <div>
                    <p className="font-medium text-gray-900">{booking.name}</p>
                    <p className="text-xs text-gray-500">{booking.email}</p>
                  </div>
                ),
              },
              { key: 'event', header: 'Event', render: (booking) => booking.event_type },
              { key: 'service', header: 'Service', render: (booking) => booking.service || 'General' },
              { key: 'status', header: 'Status', render: (booking) => <AdminBadge status={booking.status as StudioBookingStatus} /> },
              { key: 'date', header: 'Date', render: (booking) => fmtDate(booking.created_at) },
            ]}
          />
          <div className="mt-3 flex justify-end">
            <Link href="/studio-admin/bookings" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-accent hover:text-brand-secondary">
              Open full booking board
              <BsArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
