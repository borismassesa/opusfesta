import { NextRequest, NextResponse } from 'next/server';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { verifyPayment } from '@/lib/flutterwave';
import { recordPayment } from '@/lib/booking-service';
import { generateClientToken } from '@/lib/booking-tokens';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://studio.opusfesta.com';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const transactionId = searchParams.get('transaction_id');
  const intentId = searchParams.get('intent_id');

  if (!intentId) {
    return NextResponse.redirect(`${APP_URL}/book?payment=error&reason=missing_intent`);
  }

  const db = getStudioSupabaseAdmin();

  // Get the payment intent
  const { data: intent } = await db
    .from('studio_payment_intents')
    .select('*')
    .eq('id', intentId)
    .single();

  if (!intent) {
    return NextResponse.redirect(`${APP_URL}/book?payment=error&reason=intent_not_found`);
  }

  // If already completed, skip
  if (intent.status === 'completed') {
    const viewToken = generateClientToken(intent.booking_id, 'view_booking');
    return NextResponse.redirect(`${APP_URL}/book/status/${viewToken}?payment=success`);
  }

  if (status !== 'successful' || !transactionId) {
    await db.from('studio_payment_intents')
      .update({
        status: 'failed',
        failure_reason: `Payment ${status || 'unknown'}`,
        failed_at: new Date().toISOString(),
      })
      .eq('id', intentId);

    const viewToken = generateClientToken(intent.booking_id, 'view_booking');
    return NextResponse.redirect(`${APP_URL}/book/status/${viewToken}?payment=failed`);
  }

  try {
    // Verify with Flutterwave
    const verification = await verifyPayment(transactionId);
    if (!verification.success) {
      await db.from('studio_payment_intents')
        .update({ status: 'failed', failure_reason: 'Verification failed', failed_at: new Date().toISOString() })
        .eq('id', intentId);

      const viewToken = generateClientToken(intent.booking_id, 'view_booking');
      return NextResponse.redirect(`${APP_URL}/book/status/${viewToken}?payment=failed`);
    }

    // Mark intent as completed
    await db.from('studio_payment_intents')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', intentId);

    // Record the payment
    await recordPayment(intent.booking_id, {
      paymentType: intent.payment_type,
      amountTzs: intent.amount_tzs,
      provider: 'flutterwave',
      providerTransactionId: transactionId,
      providerReference: verification.data?.flw_ref,
      paymentIntentId: intentId,
    });

    const viewToken = generateClientToken(intent.booking_id, 'view_booking');
    return NextResponse.redirect(`${APP_URL}/book/status/${viewToken}?payment=success`);
  } catch (error) {
    console.error('[PAYMENT CALLBACK]', error);
    const viewToken = generateClientToken(intent.booking_id, 'view_booking');
    return NextResponse.redirect(`${APP_URL}/book/status/${viewToken}?payment=error`);
  }
}
