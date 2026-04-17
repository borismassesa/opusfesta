import { NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

const VALID_STATUSES = new Set(['new', 'contacted', 'qualified', 'closed_won', 'closed_lost', 'spam']);

export async function GET(request: Request) {
  try {
    await requireStudioRole('studio_viewer');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(Number(searchParams.get('limit') ?? '100'), 500);

    const sb = getStudioSupabaseAdmin();
    let query = sb
      .from('studio_inquiries')
      .select('id, name, email, phone, project_type, budget_range, timeline, message, status, assigned_to, internal_notes, created_at, updated_at, contacted_at, closed_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status && VALID_STATUSES.has(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ inquiries: data ?? [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
