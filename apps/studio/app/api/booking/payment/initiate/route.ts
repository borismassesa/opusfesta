import { NextRequest, NextResponse } from 'next/server';
import { validateClientToken } from '@/lib/booking-tokens';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { initiatePayment } from '@/lib/flutterwave';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://studio.opusfesta.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, paymentType } = body;

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    const validated = validateClientToken(token);
    if (!validated.valid) {
      return NextResponse.json(
        { error: validated.expired ? 'Token has expired' : 'Invalid token' },
        { status: 401 }
      );
    }

    if (validated.action !== 'make_payment') {
      return NextResponse.json({ error: 'Invalid token action' }, { status: 400 });
    }

    const db = getStudioSupabaseAdmin();
    const { data: booking } = await db
      .from('studio_bookings')
      .select('*')
      .eq('id', validated.bookingId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Determine amount based on payment type
    const type = paymentType || 'deposit';
    let amount: number;
    if (type === 'deposit') {
      amount = booking.deposit_amount_tzs;
    } else if (type === 'balance') {
      amount = booking.balance_due_tzs;
    } else {
      return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'No amount due for this payment type' }, { status: 400 });
    }

    // Create payment intent
    const { data: intent, error: intentError } = await db
      .from('studio_payment_intents')
      .insert({
        booking_id: validated.bookingId,
        payment_type: type,
        amount_tzs: amount,
        provider: 'flutterwave',
        status: 'pending',
        redirect_url: `${APP_URL}/api/booking/payment/callback`,
      })
      .select()
      .single();

    if (intentError || !intent) {
      throw new Error(`Failed to create payment intent: ${intentError?.message}`);
    }

    // Initiate Flutterwave payment
    const result = await initiatePayment({
      amount,
      email: booking.email,
      name: booking.name,
      phone: booking.phone || undefined,
      bookingId: validated.bookingId,
      paymentType: type,
      redirectUrl: `${APP_URL}/api/booking/payment/callback?intent_id=${intent.id}`,
    });

    if (!result.success) {
      await db.from('studio_payment_intents')
        .update({ status: 'failed', failure_reason: result.error, failed_at: new Date().toISOString() })
        .eq('id', intent.id);
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    // Update intent with Flutterwave data
    await db.from('studio_payment_intents')
      .update({
        status: 'processing',
        provider_tx_ref: result.txRef,
        payment_link: result.paymentLink,
      })
      .eq('id', intent.id);

    return NextResponse.json({
      paymentLink: result.paymentLink,
      intentId: intent.id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment initiation failed' },
      { status: 500 }
    );
  }
}
