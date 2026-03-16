import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { createAndSendQuote } from '@/lib/booking-service';
import type { CreateQuoteInput } from '@/lib/booking-types';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioRole('studio_viewer');
    const { id } = await params;
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db
      .from('studio_quotes')
      .select('*, studio_quote_line_items(*)')
      .eq('booking_id', id)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const quotes = (data || []).map((q: Record<string, unknown>) => ({
      ...q,
      line_items: q.studio_quote_line_items || [],
      studio_quote_line_items: undefined,
    }));

    return NextResponse.json({ quotes });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clerkId } = await requireStudioRole('studio_editor');
    const { id } = await params;
    const body: CreateQuoteInput = await req.json();

    if (!body.line_items || body.line_items.length === 0) {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 });
    }

    const quote = await createAndSendQuote(id, body, clerkId);
    revalidatePath('/', 'layout');
    return NextResponse.json({ quote });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
