import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    await requireStudioRole('studio_editor');
    const items: { id: string; sort_order: number }[] = await req.json();
    const db = getStudioSupabaseAdmin();
    await Promise.all(items.map((item) => db.from('studio_services').update({ sort_order: item.sort_order }).eq('id', item.id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
