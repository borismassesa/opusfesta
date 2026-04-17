import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ContentRow = {
  id: string;
  is_published?: boolean;
  is_active?: boolean;
  updated_at: string;
};

type TitledContentRow = ContentRow & { title: string };

type InquiryRow = {
  id: string;
  name: string;
  email: string;
  project_type: string | null;
  status: string;
  created_at: string;
};

type ContentOverview = {
  total: number;
  published: number;
  stale: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function asDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDeltaPercent(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function overview(
  rows: ContentRow[],
  publishedKey: 'is_published' | 'is_active',
  staleThreshold: Date
): ContentOverview {
  const total = rows.length;
  const published = rows.filter((r) => r[publishedKey]).length;
  const stale = rows.filter((r) => {
    const u = asDate(r.updated_at);
    return !!u && u < staleThreshold;
  }).length;
  return { total, published, stale };
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  try {
    await requireStudioRole('studio_viewer');
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get('period') || '30d';

    const db = getStudioSupabaseAdmin();

    const [
      projectsResult,
      articlesResult,
      servicesResult,
      testimonialsResult,
      faqsResult,
      teamResult,
      inquiriesResult,
    ] = await Promise.all([
      db.from('studio_projects').select('id, title, is_published, updated_at').limit(2000),
      db.from('studio_articles').select('id, title, is_published, updated_at').limit(2000),
      db.from('studio_services').select('id, title, is_active, updated_at').limit(2000),
      db.from('studio_testimonials').select('id, updated_at, is_published, author').limit(2000),
      db.from('studio_faqs').select('id, updated_at, is_published, question').limit(2000),
      db.from('studio_team_members').select('id, updated_at, is_published, name').limit(2000),
      db.from('studio_inquiries').select('id, name, email, project_type, status, created_at').order('created_at', { ascending: false }).limit(2000),
    ]);

    const queryError =
      projectsResult.error || articlesResult.error || servicesResult.error ||
      testimonialsResult.error || faqsResult.error || teamResult.error || inquiriesResult.error;
    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    const projects = (projectsResult.data || []) as TitledContentRow[];
    const articles = (articlesResult.data || []) as TitledContentRow[];
    const services = (servicesResult.data || []) as TitledContentRow[];
    const testimonials = (testimonialsResult.data || []) as ContentRow[];
    const faqs = (faqsResult.data || []) as ContentRow[];
    const team = (teamResult.data || []) as ContentRow[];
    const inquiries = (inquiriesResult.data || []) as InquiryRow[];

    // -----------------------------------------------------------------------
    // Date ranges
    // -----------------------------------------------------------------------
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const staleThreshold = addDays(today, -30);

    let filterStartDate: Date;
    let prevFilterStartDate: Date;
    switch (periodParam) {
      case 'ytd':
        filterStartDate = new Date(today.getFullYear(), 0, 1);
        prevFilterStartDate = new Date(today.getFullYear() - 1, 0, 1);
        break;
      case '12m':
        filterStartDate = addDays(today, -365);
        prevFilterStartDate = addDays(today, -730);
        break;
      case '90d':
        filterStartDate = addDays(today, -90);
        prevFilterStartDate = addDays(today, -180);
        break;
      case '7d':
        filterStartDate = addDays(today, -7);
        prevFilterStartDate = addDays(today, -14);
        break;
      case '30d':
      default:
        filterStartDate = addDays(today, -30);
        prevFilterStartDate = addDays(today, -60);
        break;
    }

    // -----------------------------------------------------------------------
    // CMS overview
    // -----------------------------------------------------------------------
    const cms = {
      projects:     overview(projects, 'is_published', staleThreshold),
      articles:     overview(articles, 'is_published', staleThreshold),
      services:     overview(services, 'is_active', staleThreshold),
      testimonials: overview(testimonials, 'is_published', staleThreshold),
      faqs:         overview(faqs, 'is_published', staleThreshold),
      team:         overview(team, 'is_published', staleThreshold),
    };

    const totalContent = Object.values(cms).reduce((s, c) => s + c.total, 0);
    const publishedContent = Object.values(cms).reduce((s, c) => s + c.published, 0);
    const staleContent = Object.values(cms).reduce((s, c) => s + c.stale, 0);
    const cmsHealthPercent = totalContent ? Math.round((publishedContent / totalContent) * 100) : 0;

    // Recent CMS updates (top 8 across all types)
    const recentUpdates = [
      ...projects.map((p) => ({ id: p.id, type: 'portfolio' as const, title: p.title, status: p.is_published ? 'published' : 'draft', updated_at: p.updated_at, href: `/studio-admin/portfolio/${p.id}` })),
      ...articles.map((a) => ({ id: a.id, type: 'article' as const, title: a.title, status: a.is_published ? 'published' : 'draft', updated_at: a.updated_at, href: `/studio-admin/articles/${a.id}` })),
      ...services.map((s) => ({ id: s.id, type: 'service' as const, title: s.title, status: s.is_active ? 'active' : 'inactive', updated_at: s.updated_at, href: `/studio-admin/services/${s.id}` })),
    ]
      .sort((a, b) => (asDate(b.updated_at)?.getTime() || 0) - (asDate(a.updated_at)?.getTime() || 0))
      .slice(0, 8);

    // -----------------------------------------------------------------------
    // Inquiry metrics
    // -----------------------------------------------------------------------
    const inquiriesInPeriod = inquiries.filter((i) => {
      const c = asDate(i.created_at);
      return !!c && c >= filterStartDate;
    });
    const inquiriesPrevPeriod = inquiries.filter((i) => {
      const c = asDate(i.created_at);
      return !!c && c >= prevFilterStartDate && c < filterStartDate;
    });

    const inquiryStatusCounts: Record<string, number> = {
      new: 0, contacted: 0, qualified: 0, closed_won: 0, closed_lost: 0, spam: 0,
    };
    for (const i of inquiries) {
      inquiryStatusCounts[i.status] = (inquiryStatusCounts[i.status] || 0) + 1;
    }
    const newInquiriesCount = inquiryStatusCounts.new || 0;

    const recentInquiries = inquiries.slice(0, 5);

    // -----------------------------------------------------------------------
    // Response
    // -----------------------------------------------------------------------
    return NextResponse.json({
      kpis: {
        totalContent: { value: totalContent, published: publishedContent },
        cmsHealth: { value: cmsHealthPercent, published: publishedContent, total: totalContent },
        staleContent: { value: staleContent },
        inquiriesInPeriod: {
          value: inquiriesInPeriod.length,
          deltaPercent: getDeltaPercent(inquiriesInPeriod.length, inquiriesPrevPeriod.length),
        },
      },
      priorities: {
        newInquiries: newInquiriesCount,
        staleContent,
      },
      cms: { ...cms, recentUpdates },
      inquiries: {
        statusCounts: inquiryStatusCounts,
        recent: recentInquiries,
        totalInPeriod: inquiriesInPeriod.length,
      },
      period: periodParam,
      generatedAt: toIsoDay(now),
    });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
