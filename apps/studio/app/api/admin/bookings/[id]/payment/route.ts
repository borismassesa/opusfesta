import { NextRequest, NextResponse } from 'next/server';
import { requireStudioRole } from '@/lib/admin-auth';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { recordPayment } from '@/lib/booking-service';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireStudioRole('studio_viewer');
    const { id } = await params;
    const db = getStudioSupabaseAdmin();
    const { data, error } = await db
      .from('studio_payments')
      .select('*')
      .eq('booking_id', id)
      .order('paid_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ payments: data || [] });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { clerkId } = await requireStudioRole('studio_editor');
    const { id } = await params;
    const body = await req.json();

    if (!body.amount || !body.paymentType) {
      return NextResponse.json({ error: 'amount and paymentType are required' }, { status: 400 });
    }

    const booking = await recordPayment(id, {
      paymentType: body.paymentType,
      amountTzs: body.amount,
      provider: body.provider || 'manual',
      providerReference: body.reference || undefined,
    }, `admin:${clerkId}`);

    return NextResponse.json({ booking });
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
