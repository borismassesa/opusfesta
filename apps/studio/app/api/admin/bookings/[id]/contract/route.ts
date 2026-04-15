import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { createAndSendContract } from '@/lib/booking-service';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioRole('studio_viewer');
    const { id } = await params;
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db
      .from('studio_contracts')
      .select('*, studio_signatures(*)')
      .eq('booking_id', id)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const contracts = (data || []).map((c: Record<string, unknown>) => ({
      ...c,
      signatures: c.studio_signatures || [],
      studio_signatures: undefined,
    }));

    return NextResponse.json({ contracts });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId: clerkId } = await requireStudioRole('studio_editor');
    const { id } = await params;
    const body = await req.json();

    if (!body.contentHtml) {
      return NextResponse.json({ error: 'contentHtml is required' }, { status: 400 });
    }

    const result = await createAndSendContract(id, body.contentHtml, clerkId);
    revalidatePath('/', 'layout');
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
