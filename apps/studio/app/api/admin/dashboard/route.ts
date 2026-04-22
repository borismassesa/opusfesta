import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type DocRow = {
  id: string;
  type: string;
  draft_content: Record<string, unknown> | null;
  published_content: Record<string, unknown> | null;
  updated_at: string;
};

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

function overviewFromDocs(rows: DocRow[], staleThreshold: Date): ContentOverview {
  const total = rows.length;
  const published = rows.filter((r) => r.published_content !== null).length;
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

    const [docsResult, inquiriesResult] = await Promise.all([
      db
        .from('studio_documents')
        .select('id, type, draft_content, published_content, updated_at')
        .is('deleted_at', null)
        .limit(5000),
      db
        .from('studio_inquiries')
        .select('id, name, email, project_type, status, created_at')
        .order('created_at', { ascending: false })
        .limit(2000),
    ]);

    if (docsResult.error) {
      console.error('[dashboard] studio_documents query failed', docsResult.error);
      return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
    }
    if (inquiriesResult.error) {
      console.error('[dashboard] studio_inquiries query failed', inquiriesResult.error);
      return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 });
    }

    const allDocs = (docsResult.data ?? []) as DocRow[];
    const byType = (t: string) => allDocs.filter((d) => d.type === t);

    const projects     = byType('project');
    const articles     = byType('article');
    const services     = byType('service');
    const testimonials = byType('testimonial');
    const faqs         = byType('faq');
    const team         = byType('teamMember');
    const inquiries    = (inquiriesResult.data ?? []) as InquiryRow[];

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
      projects:     overviewFromDocs(projects, staleThreshold),
      articles:     overviewFromDocs(articles, staleThreshold),
      services:     overviewFromDocs(services, staleThreshold),
      testimonials: overviewFromDocs(testimonials, staleThreshold),
      faqs:         overviewFromDocs(faqs, staleThreshold),
      team:         overviewFromDocs(team, staleThreshold),
    };

    const totalContent = Object.values(cms).reduce((s, c) => s + c.total, 0);
    const publishedContent = Object.values(cms).reduce((s, c) => s + c.published, 0);
    const staleContent = Object.values(cms).reduce((s, c) => s + c.stale, 0);
    const cmsHealthPercent = totalContent ? Math.round((publishedContent / totalContent) * 100) : 0;

    const docTitle = (d: DocRow) =>
      (d.draft_content?.title ?? d.published_content?.title ?? d.id) as string;

    const recentUpdates = [
      ...projects.map((d) => ({ id: d.id, type: 'project' as const, title: docTitle(d), status: d.published_content ? 'published' : 'draft', updated_at: d.updated_at, href: `/studio-admin/cms/project/${d.id}` })),
      ...articles.map((d) => ({ id: d.id, type: 'article' as const, title: docTitle(d), status: d.published_content ? 'published' : 'draft', updated_at: d.updated_at, href: `/studio-admin/cms/article/${d.id}` })),
      ...services.map((d) => ({ id: d.id, type: 'service' as const, title: docTitle(d), status: d.published_content ? 'published' : 'draft', updated_at: d.updated_at, href: `/studio-admin/cms/service/${d.id}` })),
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

    // Daily buckets for the trend chart — bucket size adapts for long ranges
    const periodDays = Math.max(
      1,
      Math.round((today.getTime() - filterStartDate.getTime()) / (24 * 60 * 60 * 1000)),
    );
    const bucketDays = periodDays > 120 ? 7 : 1;
    const bucketCount = Math.ceil(periodDays / bucketDays);
    const inquiriesDaily: { date: string; count: number }[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const bucketStart = addDays(filterStartDate, i * bucketDays);
      const bucketEnd = addDays(bucketStart, bucketDays);
      const count = inquiries.filter((q) => {
        const c = asDate(q.created_at);
        return !!c && c >= bucketStart && c < bucketEnd;
      }).length;
      inquiriesDaily.push({ date: toIsoDay(bucketStart), count });
    }

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
        daily: inquiriesDaily,
        bucketDays,
      },
      period: periodParam,
      generatedAt: toIsoDay(now),
    });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
