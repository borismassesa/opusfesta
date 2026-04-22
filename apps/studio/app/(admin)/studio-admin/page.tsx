'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BsArrowRight, BsInbox, BsExclamationTriangle, BsPlusLg,
  BsFolder2Open, BsWrench, BsFileText, BsStar, BsPeople, BsQuestionCircle,
  BsImage, BsClock, BsCalendar2Check,
} from 'react-icons/bs';
import AdminBadge from '@/components/admin/ui/AdminBadge';

// ---------------------------------------------------------------------------
// Today's schedule types
// ---------------------------------------------------------------------------
interface TodayBooking {
  id: string;
  client_name: string;
  service_name: string | null;
  start_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  location: string | null;
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---------------------------------------------------------------------------
// Types (mirror of /api/admin/dashboard response)
// ---------------------------------------------------------------------------
type ContentOverview = { total: number; published: number; stale: number };

interface RecentUpdate {
  id: string;
  type: 'portfolio' | 'article' | 'service';
  title: string;
  status: string;
  updated_at: string;
  href: string;
}

interface RecentInquiry {
  id: string;
  name: string;
  email: string;
  project_type: string | null;
  status: string;
  created_at: string;
}

interface DashboardData {
  kpis: {
    totalContent: { value: number; published: number };
    cmsHealth: { value: number; published: number; total: number };
    staleContent: { value: number };
    inquiriesInPeriod: { value: number; deltaPercent: number };
  };
  priorities: {
    newInquiries: number;
    staleContent: number;
  };
  cms: {
    projects: ContentOverview;
    articles: ContentOverview;
    services: ContentOverview;
    testimonials: ContentOverview;
    faqs: ContentOverview;
    team: ContentOverview;
    recentUpdates: RecentUpdate[];
  };
  inquiries: {
    statusCounts: Record<string, number>;
    recent: RecentInquiry[];
    totalInPeriod: number;
    daily: { date: string; count: number }[];
    bucketDays: number;
  };
  period: string;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / (60 * 1000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

// ---------------------------------------------------------------------------
// Quick-create catalogue — the most common "I need to add X" actions.
// Links into the existing CMS new-item flow at /studio-admin/cms/<type>/new.
// ---------------------------------------------------------------------------
const QUICK_CREATES: {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  minRole?: 'viewer' | 'editor' | 'admin';
}[] = [
  { key: 'project',     label: 'Project',     icon: BsFolder2Open,    href: '/studio-admin/cms/project/new'     },
  { key: 'service',     label: 'Service',     icon: BsWrench,         href: '/studio-admin/cms/service/new'     },
  { key: 'article',     label: 'Article',     icon: BsFileText,       href: '/studio-admin/cms/article/new'     },
  { key: 'testimonial', label: 'Testimonial', icon: BsStar,           href: '/studio-admin/cms/testimonial/new' },
  { key: 'teamMember',  label: 'Team member', icon: BsPeople,         href: '/studio-admin/cms/teamMember/new'  },
  { key: 'faq',         label: 'FAQ',         icon: BsQuestionCircle, href: '/studio-admin/cms/faq/new'         },
  { key: 'booking',     label: 'Booking',     icon: BsCalendar2Check, href: '/studio-admin/bookings'            },
  { key: 'media',       label: 'Upload media', icon: BsImage,         href: '/studio-admin/media'               },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayBookings, setTodayBookings] = useState<TodayBooking[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/dashboard?period=30d`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((payload: DashboardData) => { if (!cancelled) setData(payload); })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    // Today's schedule — best effort; if bookings table doesn't exist yet,
    // swallow the error and leave the section empty.
    const today = todayIso();
    fetch(`/api/admin/bookings?date_from=${today}&date_to=${today}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.bookings) setTodayBookings(d.bookings); })
      .catch(() => {});
  }, []);

  const draftCounts = useMemo(() => {
    if (!data) return [];
    const rows = [
      { key: 'project',     label: 'Portfolio',    href: '/studio-admin/cms/project',     overview: data.cms.projects,     icon: BsFolder2Open    },
      { key: 'service',     label: 'Services',     href: '/studio-admin/cms/service',     overview: data.cms.services,     icon: BsWrench         },
      { key: 'article',     label: 'Articles',     href: '/studio-admin/cms/article',     overview: data.cms.articles,     icon: BsFileText       },
      { key: 'testimonial', label: 'Testimonials', href: '/studio-admin/cms/testimonial', overview: data.cms.testimonials, icon: BsStar           },
      { key: 'teamMember',  label: 'Team',         href: '/studio-admin/cms/teamMember',  overview: data.cms.team,         icon: BsPeople         },
      { key: 'faq',         label: 'FAQs',         href: '/studio-admin/cms/faq',         overview: data.cms.faqs,         icon: BsQuestionCircle },
    ];
    return rows
      .map((r) => ({ ...r, draftCount: Math.max(0, r.overview.total - r.overview.published) }))
      .filter((r) => r.draftCount > 0);
  }, [data]);

  // --- Loading / error -------------------------------------------------------
  if (loading && !data) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-[var(--admin-sidebar-border)]" />
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="h-56 bg-[var(--admin-sidebar-border)]" />
            <div className="h-56 bg-[var(--admin-sidebar-border)]" />
          </div>
          <div className="h-64 bg-[var(--admin-sidebar-border)] mt-4" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <p className="text-sm text-red-600">
          Unable to load dashboard data. {error ?? 'Unknown error.'}
        </p>
      </div>
    );
  }

  const { priorities, cms, inquiries } = data;
  const newInquiries = inquiries.recent.filter((i) => i.status === 'new');

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">

      {/* ── PRIORITY STRIP ─────────────────────────────────────────────── */}
      {(priorities.newInquiries > 0 || priorities.staleContent > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {priorities.newInquiries > 0 && (
            <Link
              href="/studio-admin/inquiries?status=new"
              className="flex items-center justify-between gap-3 bg-white border border-[var(--admin-primary)]/30 hover:border-[var(--admin-primary)] transition-colors px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[var(--admin-primary)]/10 flex items-center justify-center">
                  <BsInbox className="w-4 h-4 text-[var(--admin-primary)]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--admin-foreground)]">
                    {priorities.newInquiries} new {priorities.newInquiries === 1 ? 'enquiry' : 'enquiries'} waiting
                  </p>
                  <p className="text-[11px] text-[var(--admin-muted)]">Fast reply {'='} better conversion</p>
                </div>
              </div>
              <BsArrowRight className="w-4 h-4 text-[var(--admin-muted)]" />
            </Link>
          )}
          {priorities.staleContent > 0 && (
            <div className="flex items-center gap-3 bg-white border border-[var(--admin-sidebar-border)] px-4 py-3">
              <div className="w-9 h-9 bg-amber-100 flex items-center justify-center">
                <BsExclamationTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--admin-foreground)]">
                  {priorities.staleContent} stale {priorities.staleContent === 1 ? 'item' : 'items'}
                </p>
                <p className="text-[11px] text-[var(--admin-muted)]">Not updated in 30+ days</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── QUICK CREATE ───────────────────────────────────────────────── */}
      <section className="bg-white border border-[var(--admin-sidebar-border)]">
        <div className="px-5 py-3 border-b border-[var(--admin-sidebar-border)]">
          <h2 className="text-[13px] font-semibold text-[var(--admin-foreground)]">Quick create</h2>
          <p className="text-[11px] text-[var(--admin-muted)] mt-0.5">Start a new item without leaving the dashboard.</p>
        </div>
        <ul className="flex flex-wrap gap-2 p-4">
          {QUICK_CREATES.map(({ key, label, href, icon: Icon }) => (
            <li key={key}>
              <Link
                href={href}
                className="group inline-flex items-center gap-2 bg-white border border-[var(--admin-sidebar-border)] hover:border-[var(--admin-primary)] hover:text-[var(--admin-primary)] transition-colors px-3 py-2 text-[12px] font-medium text-[var(--admin-foreground)]"
              >
                <BsPlusLg className="w-3 h-3 text-[var(--admin-muted)] group-hover:text-[var(--admin-primary)] transition-colors" />
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── TODAY'S SCHEDULE ─────────────────────────────────────────── */}
      <section className="bg-white border border-[var(--admin-sidebar-border)]">
        <div className="px-5 py-3 border-b border-[var(--admin-sidebar-border)] flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-[var(--admin-foreground)]">Today&apos;s schedule</h2>
            <p className="text-[11px] text-[var(--admin-muted)] mt-0.5">
              {todayBookings.length > 0
                ? `${todayBookings.length} ${todayBookings.length === 1 ? 'session' : 'sessions'} on the calendar`
                : 'Nothing booked for today.'}
            </p>
          </div>
          <Link
            href="/studio-admin/bookings"
            className="text-[11px] font-medium text-[var(--admin-primary)] hover:underline"
          >
            All bookings →
          </Link>
        </div>
        {todayBookings.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <BsCalendar2Check className="w-6 h-6 text-[var(--admin-muted)] mx-auto mb-2" />
            <p className="text-[12px] text-[var(--admin-muted)]">
              A clear day. Use Quick create → Booking to schedule a session.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--admin-sidebar-border)]">
            {todayBookings.map((b) => (
              <li key={b.id}>
                <Link
                  href="/studio-admin/bookings"
                  className="grid grid-cols-[80px_1fr_auto] items-center gap-4 px-5 py-3 hover:bg-[var(--admin-sidebar-accent)] transition-colors"
                >
                  <span className="text-[13px] font-semibold tabular-nums text-[var(--admin-foreground)]">
                    {b.start_time.slice(0, 5)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[var(--admin-foreground)] truncate">
                      {b.client_name}
                      {b.service_name && (
                        <span className="ml-2 font-normal text-[var(--admin-muted)]">
                          · {b.service_name}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-[var(--admin-muted)] truncate">
                      {b.duration_minutes} min{b.location ? ` · ${b.location}` : ''}
                    </p>
                  </div>
                  <AdminBadge variant={b.status === 'confirmed' ? 'success' : 'warning'}>
                    {b.status.replace('_', ' ')}
                  </AdminBadge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── INBOX + DRAFTS (two columns) ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* New enquiries */}
        <section className="bg-white border border-[var(--admin-sidebar-border)] flex flex-col">
          <div className="px-5 py-3 border-b border-[var(--admin-sidebar-border)] flex items-center justify-between">
            <div>
              <h2 className="text-[13px] font-semibold text-[var(--admin-foreground)]">New enquiries</h2>
              <p className="text-[11px] text-[var(--admin-muted)] mt-0.5">
                {newInquiries.length > 0
                  ? `${newInquiries.length} waiting for first reply`
                  : 'Nothing waiting — you\u2019re on top of it.'}
              </p>
            </div>
            <Link
              href="/studio-admin/inquiries"
              className="text-[11px] font-medium text-[var(--admin-primary)] hover:underline"
            >
              Go to Inbox →
            </Link>
          </div>
          <ul className="divide-y divide-[var(--admin-sidebar-border)] flex-1">
            {newInquiries.length === 0 && inquiries.recent.length === 0 && (
              <li className="px-5 py-8 text-[12px] text-[var(--admin-muted)] text-center">
                No enquiries yet.
              </li>
            )}
            {newInquiries.length === 0 && inquiries.recent.length > 0 && (
              <li className="px-5 py-8 text-[12px] text-[var(--admin-muted)] text-center">
                All caught up. Showing recent enquiries below.
              </li>
            )}
            {(newInquiries.length > 0 ? newInquiries : inquiries.recent).slice(0, 5).map((i) => (
              <li key={i.id}>
                <Link
                  href={`/studio-admin/inquiries/${i.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--admin-sidebar-accent)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[var(--admin-foreground)] truncate">{i.name}</p>
                    <p className="text-[11px] text-[var(--admin-muted)] truncate mt-0.5">
                      {i.project_type ? `${i.project_type} · ` : ''}{i.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <AdminBadge variant={i.status === 'new' ? 'warning' : 'default'}>{i.status}</AdminBadge>
                    <span className="text-[10px] text-[var(--admin-muted)]">{formatRelative(i.created_at)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Drafts to finish */}
        <section className="bg-white border border-[var(--admin-sidebar-border)] flex flex-col">
          <div className="px-5 py-3 border-b border-[var(--admin-sidebar-border)]">
            <h2 className="text-[13px] font-semibold text-[var(--admin-foreground)]">Drafts to finish</h2>
            <p className="text-[11px] text-[var(--admin-muted)] mt-0.5">
              {draftCounts.length > 0
                ? `Unpublished items waiting to go live`
                : 'Nothing unpublished — everything is live.'}
            </p>
          </div>
          <ul className="divide-y divide-[var(--admin-sidebar-border)] flex-1">
            {draftCounts.length === 0 && (
              <li className="px-5 py-8 text-[12px] text-[var(--admin-muted)] text-center">
                Use Quick create above to draft something new.
              </li>
            )}
            {draftCounts.map(({ key, label, href, draftCount, icon: Icon }) => (
              <li key={key}>
                <Link
                  href={`${href}?status=draft`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--admin-sidebar-accent)] transition-colors"
                >
                  <Icon className="w-4 h-4 text-[var(--admin-muted)]" />
                  <span className="text-[12px] font-semibold text-[var(--admin-foreground)] flex-1">{label}</span>
                  <span className="text-[11px] text-[var(--admin-muted)] tabular-nums">
                    {draftCount} draft{draftCount === 1 ? '' : 's'}
                  </span>
                  <BsArrowRight className="w-3.5 h-3.5 text-[var(--admin-muted)]" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── RECENT ACTIVITY ───────────────────────────────────────────── */}
      <section className="bg-white border border-[var(--admin-sidebar-border)]">
        <div className="px-5 py-3 border-b border-[var(--admin-sidebar-border)] flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-[var(--admin-foreground)]">Recent activity</h2>
            <p className="text-[11px] text-[var(--admin-muted)] mt-0.5">Latest content edits across the site.</p>
          </div>
          <BsClock className="w-3.5 h-3.5 text-[var(--admin-muted)]" />
        </div>
        <ul className="divide-y divide-[var(--admin-sidebar-border)]">
          {cms.recentUpdates.length === 0 && (
            <li className="px-5 py-8 text-[12px] text-[var(--admin-muted)] text-center">
              No edits yet. Publish your first project to get started.
            </li>
          )}
          {cms.recentUpdates.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--admin-sidebar-accent)] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[var(--admin-foreground)] truncate">{item.title}</p>
                  <p className="text-[11px] text-[var(--admin-muted)] mt-0.5">
                    {item.type} · {formatRelative(item.updated_at)}
                  </p>
                </div>
                <AdminBadge variant={item.status === 'published' || item.status === 'active' ? 'success' : 'default'}>
                  {item.status}
                </AdminBadge>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
