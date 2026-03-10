import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  try {
    await requireStudioRole('studio_viewer');
    const db = getStudioSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));

    let query = db.from('studio_bookings').select('*', { count: 'exact' });
    if (status && status !== 'all') query = query.eq('status', status);
    query = query.order('created_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    const { data, count, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ bookings: data || [], total: count || 0, page, totalPages: Math.ceil((count || 0) / PAGE_SIZE) });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
