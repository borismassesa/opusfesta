import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookHash, verifyPayment } from '@/lib/flutterwave';
import { getStudioSupabaseAdmin } from '@/lib/supabase-admin';
import { recordPayment } from '@/lib/booking-service';

export async function POST(req: NextRequest) {
  try {
    // Validate webhook hash
    const hash = req.headers.get('verif-hash');
    if (!validateWebhookHash(hash)) {
      return NextResponse.json({ error: 'Invalid webhook hash' }, { status: 401 });
    }

    const body = await req.json();
    const { event, data } = body;

    if (event !== 'charge.completed') {
      return NextResponse.json({ status: 'ignored' });
    }

    const transactionId = String(data.id);
    const txRef = data.tx_ref;

    // Idempotency check: already processed?
    const db = getStudioSupabaseAdmin();
    const { data: existingPayment } = await db
      .from('studio_payments')
      .select('id')
      .eq('provider_transaction_id', transactionId)
      .limit(1)
      .single();

    if (existingPayment) {
      return NextResponse.json({ status: 'already_processed' });
    }

    // Find the payment intent by tx_ref
    const { data: intent } = await db
      .from('studio_payment_intents')
      .select('*')
      .eq('provider_tx_ref', txRef)
      .single();

    if (!intent) {
      console.error('[FLUTTERWAVE WEBHOOK] No intent found for tx_ref:', txRef);
      return NextResponse.json({ status: 'intent_not_found' }, { status: 404 });
    }

    // Verify payment with Flutterwave
    const verification = await verifyPayment(transactionId);
    if (!verification.success) {
      await db.from('studio_payment_intents')
        .update({ status: 'failed', failure_reason: 'Webhook verification failed', failed_at: new Date().toISOString() })
        .eq('id', intent.id);
      return NextResponse.json({ status: 'verification_failed' });
    }

    // Mark intent as completed
    await db.from('studio_payment_intents')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', intent.id);

    // Record payment and trigger state transition
    await recordPayment(intent.booking_id, {
      paymentType: intent.payment_type,
      amountTzs: intent.amount_tzs,
      provider: 'flutterwave',
      providerTransactionId: transactionId,
      providerReference: verification.data?.flw_ref,
      paymentIntentId: intent.id,
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('[FLUTTERWAVE WEBHOOK]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
