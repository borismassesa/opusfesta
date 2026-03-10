import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try { await requireStudioRole('studio_viewer');
    const month = new URL(req.url).searchParams.get('month');
    if (!month) return NextResponse.json({ error: 'month parameter required (YYYY-MM)' }, { status: 400 });
    const start = `${month}-01`;
    const [y, m] = month.split('-').map(Number);
    const end = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const { data, error } = await getStudioSupabaseAdmin().from('studio_availability').select('*').gte('date', start).lt('date', end);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ availability: data || [] });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try { await requireStudioRole('studio_editor');
    const items: { date: string; is_available: boolean; note?: string }[] = await req.json();
    const db = getStudioSupabaseAdmin();
    const { error } = await db.from('studio_availability').upsert(items.map((i) => ({ date: i.date, is_available: i.is_available, note: i.note || null })), { onConflict: 'date' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
