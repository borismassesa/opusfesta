import { NextRequest, NextResponse } from 'next/server';
import { validateClientToken } from '@/lib/booking-tokens';
import { signContract } from '@/lib/booking-service';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, signerName, signatureData, signatureType } = body;

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }
    if (!signerName || !signatureData || !signatureType) {
      return NextResponse.json(
        { error: 'signerName, signatureData, and signatureType are required' },
        { status: 400 }
      );
    }
    if (!['draw', 'type'].includes(signatureType)) {
      return NextResponse.json({ error: 'signatureType must be "draw" or "type"' }, { status: 400 });
    }

    const validated = validateClientToken(token);
    if (!validated.valid) {
      return NextResponse.json(
        { error: validated.expired ? 'Token has expired' : 'Invalid token' },
        { status: 401 }
      );
    }

    if (validated.action !== 'sign_contract') {
      return NextResponse.json({ error: 'Invalid token action' }, { status: 400 });
    }

    // Get the unsigned contract
    const db = getStudioSupabaseAdmin();
    const { data: contract } = await db
      .from('studio_contracts')
      .select('id, booking_id')
      .eq('booking_id', validated.bookingId)
      .is('signed_at', null)
      .is('voided_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!contract) {
      return NextResponse.json({ error: 'No unsigned contract found' }, { status: 404 });
    }

    // Get booking email for signature record
    const { data: booking } = await db
      .from('studio_bookings')
      .select('email')
      .eq('id', validated.bookingId)
      .single();

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;

    const result = await signContract(validated.bookingId, contract.id, {
      signerName,
      signerEmail: booking?.email || '',
      signatureData,
      signatureType,
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined,
    });

    return NextResponse.json({
      bookingId: result.id,
      lifecycleStatus: result.lifecycle_status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sign contract' },
      { status: 500 }
    );
  }
}
