import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  try { await requireStudioRole('studio_editor'); const { date } = await params;
    const { error } = await getStudioSupabaseAdmin().from('studio_availability').delete().eq('date', date);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
