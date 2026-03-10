import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try { await requireStudioRole('studio_editor'); const items: { id: string; sort_order: number }[] = await req.json();
    const db = getStudioSupabaseAdmin();
    await Promise.all(items.map((i) => db.from('studio_faqs').update({ sort_order: i.sort_order }).eq('id', i.id)));
    return NextResponse.json({ success: true });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
