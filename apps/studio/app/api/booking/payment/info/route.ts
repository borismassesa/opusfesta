import { NextRequest, NextResponse } from 'next/server';
import { validateClientToken } from '@/lib/booking-tokens';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

  const validated = validateClientToken(token);
  if (!validated.valid) {
    return NextResponse.json({ error: validated.expired ? 'Token expired' : 'Invalid token' }, { status: 401 });
  }

  const db = getStudioSupabaseAdmin();
  const { data: booking } = await db
    .from('studio_bookings')
    .select('name, event_type, deposit_amount_tzs, balance_due_tzs, lifecycle_status')
    .eq('id', validated.bookingId)
    .single();

  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  return NextResponse.json({ booking });
}
