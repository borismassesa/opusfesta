'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  BsArrowRight, BsInbox, BsExclamationCircle, BsFileText,
  BsFolder2Open, BsWrench, BsStar, BsQuestionCircle, BsPeople,
  BsArrowUpShort, BsArrowDownShort, BsDashLg,
} from 'react-icons/bs';
import AdminBadge from '@/components/admin/ui/AdminBadge';

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
  };
  period: string;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
type Period = '7d' | '30d' | '90d' | '12m' | 'ytd';

const PERIOD_LABELS: Record<Period, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '12m': 'Last 12 months',
  'ytd': 'Year to date',
};

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

function DeltaIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
        <BsArrowUpShort className="w-3.5 h-3.5" />
        {Math.abs(value)}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-red-600">
        <BsArrowDownShort className="w-3.5 h-3.5" />
        {Math.abs(value)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[var(--admin-muted)]">
      <BsDashLg className="w-3 h-3" />
      0%
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/dashboard?period=${period}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((payload) => setData(payload))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading && !data) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-[var(--admin-sidebar-border)]" />
          <div className="h-4 w-96 bg-[var(--admin-sidebar-border)]" />
          <div className="grid grid-cols-4 gap-4 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-[var(--admin-sidebar-border)]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[var(--admin-foreground)] mb-2">Dashboard</h1>
        <p className="text-sm text-red-600">
          Unable to load dashboard data. {error ?? 'Unknown error.'}
        </p>
      </div>
    );
  }

  const { kpis, priorities, cms, inquiries } = data;

  const contentCards = [
    { key: 'project',      label: 'Portfolio',    icon: BsFolder2Open,    overview: cms.projects,     href: '/studio-admin/cms/project'      },
    { key: 'article',      label: 'Articles',     icon: BsFileText,       overview: cms.articles,     href: '/studio-admin/cms/article'      },
    { key: 'service',      label: 'Services',     icon: BsWrench,         overview: cms.services,     href: '/studio-admin/cms/service'      },
    { key: 'testimonial',  label: 'Testimonials', icon: BsStar,           overview: cms.testimonials, href: '/studio-admin/cms/testimonial'  },
    { key: 'faq',          label: 'FAQs',         icon: BsQuestionCircle, overview: cms.faqs,         href: '/studio-admin/cms/faq'          },
    { key: 'teamMember',   label: 'Team',         icon: BsPeople,         overview: cms.team,         href: '/studio-admin/cms/teamMember'   },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-foreground)] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--admin-muted)] mt-1">
            Content overview and recent inquiries · updated {formatRelative(data.generatedAt)}
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="text-[12px] font-medium px-3 py-2 bg-white border border-[var(--admin-sidebar-border)] text-[var(--admin-foreground)] focus:outline-none focus:border-[var(--admin-primary)]"
        >
          {Object.entries(PERIOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Priorities strip */}
      {(priorities.newInquiries > 0 || priorities.staleContent > 0) && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {priorities.newInquiries > 0 && (
            <Link
              href="/studio-admin/inquiries?status=new"
              className="flex items-center justify-between gap-3 bg-white border border-[var(--admin-sidebar-border)] hover:border-[var(--admin-primary)] transition-colors px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[var(--admin-primary)]/10 flex items-center justify-center">
                  <BsInbox className="w-4 h-4 text-[var(--admin-primary)]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--admin-foreground)]">
                    {priorities.newInquiries} new {priorities.newInquiries === 1 ? 'inquiry' : 'inquiries'}
                  </p>
                  <p className="text-[11px] text-[var(--admin-muted)]">Waiting for first response</p>
                </div>
              </div>
              <BsArrowRight className="w-4 h-4 text-[var(--admin-muted)]" />
            </Link>
          )}
          {priorities.staleContent > 0 && (
            <div className="flex items-center gap-3 bg-white border border-[var(--admin-sidebar-border)] px-4 py-3">
              <div className="w-9 h-9 bg-amber-100 flex items-center justify-center">
                <BsExclamationCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--admin-foreground)]">
                  {priorities.staleContent} stale {priorities.staleContent === 1 ? 'item' : 'items'}
                </p>
                <p className="text-[11px] text-[var(--admin-muted)]">Not updated in over 30 days</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[var(--admin-sidebar-border)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)] mb-2">Total Content</p>
          <p className="text-3xl font-bold text-[var(--admin-foreground)] leading-none">{kpis.totalContent.value}</p>
          <p className="text-[11px] text-[var(--admin-muted)] mt-2">{kpis.totalContent.published} published</p>
        </div>
        <div className="bg-white border border-[var(--admin-sidebar-border)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)] mb-2">CMS Health</p>
          <p className="text-3xl font-bold text-[var(--admin-foreground)] leading-none">{kpis.cmsHealth.value}%</p>
          <p className="text-[11px] text-[var(--admin-muted)] mt-2">{kpis.cmsHealth.published}/{kpis.cmsHealth.total} published</p>
        </div>
        <div className="bg-white border border-[var(--admin-sidebar-border)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)] mb-2">Stale Content</p>
          <p className="text-3xl font-bold text-[var(--admin-foreground)] leading-none">{kpis.staleContent.value}</p>
          <p className="text-[11px] text-[var(--admin-muted)] mt-2">Not updated in 30+ days</p>
        </div>
        <div className="bg-white border border-[var(--admin-sidebar-border)] p-5">
          <div className="flex items-start justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)]">Inquiries</p>
            <DeltaIndicator value={kpis.inquiriesInPeriod.deltaPercent} />
          </div>
          <p className="text-3xl font-bold text-[var(--admin-foreground)] leading-none">{kpis.inquiriesInPeriod.value}</p>
          <p className="text-[11px] text-[var(--admin-muted)] mt-2">{PERIOD_LABELS[period]}</p>
        </div>
      </div>

      {/* Content overview grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--admin-foreground)]">Content Overview</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {contentCards.map(({ key, label, icon: Icon, overview, href }) => (
            <Link
              key={key}
              href={href}
              className="group bg-white border border-[var(--admin-sidebar-border)] hover:border-[var(--admin-primary)] transition-colors p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-[var(--admin-muted)] group-hover:text-[var(--admin-primary)] transition-colors" />
                  <span className="text-[12px] font-semibold text-[var(--admin-foreground)]">{label}</span>
                </div>
                <BsArrowRight className="w-3.5 h-3.5 text-[var(--admin-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="text-2xl font-bold text-[var(--admin-foreground)] leading-none">{overview.total}</p>
                <p className="text-[11px] text-[var(--admin-muted)]">total</p>
              </div>
              <p className="text-[11px] text-[var(--admin-muted)]">
                {overview.published} published{overview.stale > 0 && ` · ${overview.stale} stale`}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent updates + recent inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[var(--admin-sidebar-border)]">
          <div className="px-5 py-3 border-b border-[var(--admin-sidebar-border)] flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-[var(--admin-foreground)]">Recent content updates</h3>
          </div>
          <ul className="divide-y divide-[var(--admin-sidebar-border)]">
            {cms.recentUpdates.length === 0 && (
              <li className="px-5 py-6 text-[12px] text-[var(--admin-muted)]">No updates yet.</li>
            )}
            {cms.recentUpdates.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--admin-sidebar-accent)] transition-colors">
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
        </div>

        <div className="bg-white border border-[var(--admin-sidebar-border)]">
          <div className="px-5 py-3 border-b border-[var(--admin-sidebar-border)] flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-[var(--admin-foreground)]">Recent inquiries</h3>
            <Link href="/studio-admin/inquiries" className="text-[11px] font-medium text-[var(--admin-primary)] hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-[var(--admin-sidebar-border)]">
            {inquiries.recent.length === 0 && (
              <li className="px-5 py-6 text-[12px] text-[var(--admin-muted)]">No inquiries yet.</li>
            )}
            {inquiries.recent.map((i) => (
              <li key={i.id} className="px-5 py-3">
                <div className="flex items-center gap-3">
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
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
