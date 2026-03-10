import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();

    const [bookings, newBookings, projects, articles, services, recent] = await Promise.all([
      db.from('studio_bookings').select('id', { count: 'exact', head: true }),
      db.from('studio_bookings').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      db.from('studio_projects').select('id, is_published'),
      db.from('studio_articles').select('id, is_published'),
      db.from('studio_services').select('id', { count: 'exact', head: true }).eq('is_active', true),
      db.from('studio_bookings').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    const publishedProjects = projects.data?.filter((p) => p.is_published).length || 0;
    const publishedArticles = articles.data?.filter((a) => a.is_published).length || 0;

    return NextResponse.json({
      stats: {
        totalBookings: bookings.count || 0,
        newBookings: newBookings.count || 0,
        totalProjects: projects.data?.length || 0,
        publishedProjects,
        totalArticles: articles.data?.length || 0,
        publishedArticles,
        activeServices: services.count || 0,
      },
      recentBookings: recent.data || [],
    });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
