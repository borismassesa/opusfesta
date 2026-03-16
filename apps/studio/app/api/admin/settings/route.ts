import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try { await requireStudioRole('studio_admin');
    const { data, error } = await getStudioSupabaseAdmin().from('studio_settings').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: data || [] });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try { await requireStudioRole('studio_admin'); const { key, value } = await req.json();
    if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });
    const { error } = await getStudioSupabaseAdmin().from('studio_settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (e) { if (e instanceof NextResponse) return e; return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
