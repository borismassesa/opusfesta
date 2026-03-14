// ============================================================================
// Booking Service Layer — Server-side orchestration
// Coordinates DB operations, state transitions, emails, and audit logging
// ============================================================================

import { randomBytes } from 'crypto';
import { getStudioSupabaseAdmin } from './supabase-admin';
import { sendEmail } from './resend';
import { canTransition, getRefundPolicy, getRescheduleFee, calculateBalanceDueDate, computeDeadlineDate } from './booking-state-machine';
import { generateClientToken } from './booking-tokens';
import { formatTZS, type BookingLifecycleStatus, type BookingIntakeData, type CreateQuoteInput, type StudioBookingLifecycle, type StudioQuote, type StudioQuoteLineItem, type BookingWithRelations } from './booking-types';
import * as emails from './booking-emails';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://studio.opusfesta.com';
const STUDIO_ADMIN_EMAIL = 'studio@opusfesta.com';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateHoldToken(): string {
  return randomBytes(16).toString('hex');
}

function generateQuoteNumber(): string {
  const prefix = 'Q';
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${date}-${rand}`;
}

function generateContractNumber(): string {
  const prefix = 'C';
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${date}-${rand}`;
}

async function logEvent(
  bookingId: string,
  eventType: string,
  actor: string,
  fromStatus?: BookingLifecycleStatus | null,
  toStatus?: BookingLifecycleStatus | null,
  description?: string,
  metadata?: Record<string, unknown>
) {
  const db = getStudioSupabaseAdmin();
  await db.from('studio_booking_events').insert({
    booking_id: bookingId,
    event_type: eventType,
    actor,
    from_status: fromStatus || null,
    to_status: toStatus || null,
    description,
    metadata: metadata || {},
  });
}

async function transitionBooking(
  bookingId: string,
  fromStatus: BookingLifecycleStatus,
  toStatus: BookingLifecycleStatus,
  actor: string,
  extraUpdates: Record<string, unknown> = {},
  eventDescription?: string
): Promise<StudioBookingLifecycle> {
  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(`Invalid transition: ${fromStatus} → ${toStatus}`);
  }

  const db = getStudioSupabaseAdmin();
  const { data, error } = await db
    .from('studio_bookings')
    .update({ lifecycle_status: toStatus, ...extraUpdates })
    .eq('id', bookingId)
    .eq('lifecycle_status', fromStatus) // optimistic lock
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to transition booking: ${error?.message || 'Booking not found or status changed'}`);
  }

  await logEvent(bookingId, 'status_change', actor, fromStatus, toStatus, eventDescription);

  return data as StudioBookingLifecycle;
}

// ---------------------------------------------------------------------------
// Slot Holds
// ---------------------------------------------------------------------------

export async function createSlotHold(
  date: string,
  timeSlot: string,
  email?: string,
  sessionId?: string
): Promise<{ holdToken: string; expiresAt: string }> {
  const db = getStudioSupabaseAdmin();

  // Check if slot is already booked
  const { data: existingBooking } = await db
    .from('studio_bookings')
    .select('id')
    .eq('event_date', date)
    .eq('event_time_slot', timeSlot)
    .in('lifecycle_status', ['confirmed', 'rescheduled', 'deposit_pending', 'contract_signed', 'contract_sent', 'quote_accepted', 'quote_sent', 'qualified', 'intake_submitted'])
    .limit(1)
    .single();

  if (existingBooking) {
    throw new Error('This slot is already booked');
  }

  const holdToken = generateHoldToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  const { error } = await db.from('studio_slot_holds').insert({
    hold_token: holdToken,
    date,
    time_slot: timeSlot,
    held_by_email: email || null,
    held_by_session: sessionId || null,
    expires_at: expiresAt,
    is_active: true,
  });

  if (error) {
    if (error.code === '23505') { // unique violation
      throw new Error('This slot is currently being held by another customer');
    }
    throw new Error(`Failed to create slot hold: ${error.message}`);
  }

  return { holdToken, expiresAt };
}

export async function releaseSlotHold(holdToken: string): Promise<void> {
  const db = getStudioSupabaseAdmin();
  await db
    .from('studio_slot_holds')
    .update({ is_active: false, released_at: new Date().toISOString() })
    .eq('hold_token', holdToken)
    .eq('is_active', true);
}

// ---------------------------------------------------------------------------
// Intake Submission
// ---------------------------------------------------------------------------

export async function submitIntake(
  holdToken: string,
  intake: BookingIntakeData
): Promise<{ booking: StudioBookingLifecycle; viewToken: string }> {
  const db = getStudioSupabaseAdmin();

  // Validate hold
  const { data: hold, error: holdError } = await db
    .from('studio_slot_holds')
    .select('*')
    .eq('hold_token', holdToken)
    .eq('is_active', true)
    .single();

  if (holdError || !hold) {
    throw new Error('Slot hold not found or expired. Please select a new time slot.');
  }

  if (new Date(hold.expires_at) < new Date()) {
    await releaseSlotHold(holdToken);
    throw new Error('Slot hold has expired. Please select a new time slot.');
  }

  // Create or find client profile
  const { data: existingClient } = await db
    .from('studio_client_profiles')
    .select('id')
    .eq('email', intake.email)
    .single();

  let clientId: string;
  if (existingClient) {
    clientId = existingClient.id;
    // Update name/phone if provided
    await db.from('studio_client_profiles').update({
      name: intake.name,
      phone: intake.phone || null,
      whatsapp: intake.whatsapp || null,
    }).eq('id', clientId);
  } else {
    const { data: newClient, error: clientError } = await db
      .from('studio_client_profiles')
      .insert({
        email: intake.email,
        name: intake.name,
        phone: intake.phone || null,
        whatsapp: intake.whatsapp || null,
      })
      .select()
      .single();

    if (clientError || !newClient) {
      throw new Error(`Failed to create client profile: ${clientError?.message}`);
    }
    clientId = newClient.id;
  }

  // Create booking
  const { data: booking, error: bookingError } = await db
    .from('studio_bookings')
    .insert({
      name: intake.name,
      email: intake.email,
      phone: intake.phone || null,
      event_type: intake.event_type,
      preferred_date: intake.preferred_date || hold.date,
      location: intake.location || null,
      service: intake.service || null,
      message: intake.message || null,
      status: 'new', // legacy status for backward compat
      lifecycle_status: 'intake_submitted',
      client_id: clientId,
      package_id: intake.package_id || null,
      event_date: hold.date,
      event_time_slot: hold.time_slot,
      guest_count: intake.guest_count || null,
    })
    .select()
    .single();

  if (bookingError || !booking) {
    throw new Error(`Failed to create booking: ${bookingError?.message}`);
  }

  // Link hold to booking
  await db.from('studio_slot_holds')
    .update({ booking_id: booking.id })
    .eq('hold_token', holdToken);

  // Log event
  await logEvent(booking.id, 'intake_submitted', `client:${intake.email}`, null, 'intake_submitted', 'Booking request submitted');

  // Generate view token
  const viewToken = generateClientToken(booking.id, 'view_booking');

  // Send emails
  const typedBooking = booking as StudioBookingLifecycle;
  const clientEmail = emails.intakeReceivedEmail(typedBooking);
  const adminEmail = emails.intakeNotificationEmail(typedBooking);

  await Promise.all([
    sendEmail({ to: intake.email, ...clientEmail, replyTo: STUDIO_ADMIN_EMAIL }),
    sendEmail({ to: STUDIO_ADMIN_EMAIL, ...adminEmail, replyTo: intake.email }),
  ]);

  return { booking: typedBooking, viewToken };
}

// ---------------------------------------------------------------------------
// Admin: Qualify Booking
// ---------------------------------------------------------------------------

export async function qualifyBooking(
  bookingId: string,
  adminClerkId: string
): Promise<StudioBookingLifecycle> {
  const db = getStudioSupabaseAdmin();
  const { data: booking } = await db
    .from('studio_bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  return transitionBooking(
    bookingId,
    booking.lifecycle_status,
    'qualified',
    `admin:${adminClerkId}`,
    { status: 'contacted' }, // sync legacy status
    'Admin qualified the booking'
  );
}

// ---------------------------------------------------------------------------
// Admin: Create & Send Quote
// ---------------------------------------------------------------------------

export async function createAndSendQuote(
  bookingId: string,
  input: CreateQuoteInput,
  adminClerkId: string
): Promise<StudioQuote> {
  const db = getStudioSupabaseAdmin();

  const { data: booking } = await db
    .from('studio_bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  // Calculate totals
  const subtotal = input.line_items.reduce((sum, li) => sum + li.unit_price_tzs * li.quantity, 0);
  const discount = input.discount_tzs || 0;
  const tax = input.tax_tzs || 0;
  const total = subtotal - discount + tax;
  const depositPercent = input.deposit_percent || 50;
  const depositAmount = Math.ceil(total * depositPercent / 100);
  const validHours = input.valid_hours || 72;
  const validUntil = new Date(Date.now() + validHours * 60 * 60 * 1000).toISOString();

  // Create quote
  const { data: quote, error: quoteError } = await db
    .from('studio_quotes')
    .insert({
      booking_id: bookingId,
      quote_number: generateQuoteNumber(),
      subtotal_tzs: subtotal,
      discount_tzs: discount,
      discount_reason: input.discount_reason || null,
      tax_tzs: tax,
      total_tzs: total,
      deposit_percent: depositPercent,
      deposit_amount_tzs: depositAmount,
      notes: input.notes || null,
      valid_until: validUntil,
      sent_at: new Date().toISOString(),
      created_by: adminClerkId,
    })
    .select()
    .single();

  if (quoteError || !quote) {
    throw new Error(`Failed to create quote: ${quoteError?.message}`);
  }

  // Create line items
  const lineItemRows = input.line_items.map((li, i) => ({
    quote_id: quote.id,
    description: li.description,
    quantity: li.quantity,
    unit_price_tzs: li.unit_price_tzs,
    total_tzs: li.unit_price_tzs * li.quantity,
    item_type: li.item_type,
    package_id: li.package_id || null,
    add_on_id: li.add_on_id || null,
    sort_order: i,
  }));

  const { data: lineItems } = await db
    .from('studio_quote_line_items')
    .insert(lineItemRows)
    .select();

  // Transition booking
  const updatedBooking = await transitionBooking(
    bookingId,
    booking.lifecycle_status,
    'quote_sent',
    `admin:${adminClerkId}`,
    {
      status: 'quoted',
      total_amount_tzs: total,
      deposit_amount_tzs: depositAmount,
      balance_due_tzs: total - depositAmount,
    },
    `Quote ${quote.quote_number} sent — ${formatTZS(total)}`
  );

  // Send quote email
  const acceptToken = generateClientToken(bookingId, 'accept_quote');
  const acceptUrl = `${APP_URL}/book/quote/${acceptToken}`;
  const quoteWithItems = { ...quote, line_items: (lineItems || []) as StudioQuoteLineItem[] };
  const email = emails.quoteSentEmail(updatedBooking, quoteWithItems, acceptUrl);
  await sendEmail({ to: booking.email, ...email, replyTo: STUDIO_ADMIN_EMAIL });

  return quoteWithItems;
}

// ---------------------------------------------------------------------------
// Client: Accept Quote
// ---------------------------------------------------------------------------

export async function acceptQuote(
  bookingId: string,
  quoteId: string
): Promise<StudioBookingLifecycle> {
  const db = getStudioSupabaseAdmin();

  const { data: booking } = await db
    .from('studio_bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  // Mark quote as accepted
  const { error } = await db
    .from('studio_quotes')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', quoteId)
    .eq('booking_id', bookingId)
    .is('accepted_at', null)
    .is('rejected_at', null);

  if (error) throw new Error(`Failed to accept quote: ${error.message}`);

  return transitionBooking(
    bookingId,
    booking.lifecycle_status,
    'quote_accepted',
    `client:${booking.email}`,
    {},
    'Client accepted the quote'
  );
}

// ---------------------------------------------------------------------------
// Admin: Create & Send Contract
// ---------------------------------------------------------------------------

export async function createAndSendContract(
  bookingId: string,
  contentHtml: string,
  adminClerkId: string
): Promise<{ contractId: string; contractNumber: string }> {
  const db = getStudioSupabaseAdmin();

  const { data: booking } = await db
    .from('studio_bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  // Get the accepted quote
  const { data: quote } = await db
    .from('studio_quotes')
    .select('id')
    .eq('booking_id', bookingId)
    .not('accepted_at', 'is', null)
    .order('accepted_at', { ascending: false })
    .limit(1)
    .single();

  const signDeadline = computeDeadlineDate('contract_sent');
  const contractNumber = generateContractNumber();

  const { data: contract, error } = await db
    .from('studio_contracts')
    .insert({
      booking_id: bookingId,
      quote_id: quote?.id || null,
      contract_number: contractNumber,
      content_html: contentHtml,
      sent_at: new Date().toISOString(),
      sign_deadline: signDeadline?.toISOString() || null,
      created_by: adminClerkId,
    })
    .select()
    .single();

  if (error || !contract) {
    throw new Error(`Failed to create contract: ${error?.message}`);
  }

  // Transition booking
  const updatedBooking = await transitionBooking(
    bookingId,
    booking.lifecycle_status,
    'contract_sent',
    `admin:${adminClerkId}`,
    {},
    `Contract ${contractNumber} sent`
  );

  // Send email
  const signToken = generateClientToken(bookingId, 'sign_contract');
  const signUrl = `${APP_URL}/book/contract/${signToken}`;
  const email = emails.contractSentEmail(updatedBooking, signUrl, signDeadline?.toISOString() || '');
  await sendEmail({ to: booking.email, ...email, replyTo: STUDIO_ADMIN_EMAIL });

  return { contractId: contract.id, contractNumber };
}

// ---------------------------------------------------------------------------
// Client: Sign Contract
// ---------------------------------------------------------------------------

export async function signContract(
  bookingId: string,
  contractId: string,
  signatureData: {
    signerName: string;
    signerEmail: string;
    signatureData: string;
    signatureType: 'draw' | 'type';
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<StudioBookingLifecycle> {
  const db = getStudioSupabaseAdmin();

  const { data: booking } = await db
    .from('studio_bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  // Record signature
  await db.from('studio_signatures').insert({
    contract_id: contractId,
    signer_name: signatureData.signerName,
    signer_email: signatureData.signerEmail,
    signature_data: signatureData.signatureData,
    signature_type: signatureData.signatureType,
    ip_address: signatureData.ipAddress || null,
    user_agent: signatureData.userAgent || null,
  });

  // Mark contract as signed
  await db.from('studio_contracts')
    .update({ signed_at: new Date().toISOString() })
    .eq('id', contractId);

  // Transition: contract_sent → contract_signed → deposit_pending
  const signed = await transitionBooking(
    bookingId,
    booking.lifecycle_status,
    'contract_signed',
    `client:${signatureData.signerEmail}`,
    {},
    'Client signed the contract'
  );

  const depositPending = await transitionBooking(
    bookingId,
    'contract_signed',
    'deposit_pending',
    'system',
    {},
    'Awaiting deposit payment'
  );

  // Send deposit request email
  const payToken = generateClientToken(bookingId, 'make_payment');
  const payUrl = `${APP_URL}/book/pay/${payToken}`;
  const email = emails.depositRequestEmail(depositPending, payUrl);
  await sendEmail({ to: booking.email, ...email, replyTo: STUDIO_ADMIN_EMAIL });

  return depositPending;
}

// ---------------------------------------------------------------------------
// Record Payment (deposit or balance)
// ---------------------------------------------------------------------------

export async function recordPayment(
  bookingId: string,
  paymentData: {
    paymentType: 'deposit' | 'balance' | 'reschedule_fee';
    amountTzs: number;
    provider: 'flutterwave' | 'manual';
    providerReference?: string;
    providerTransactionId?: string;
    receiptUrl?: string;
    paymentIntentId?: string;
  },
  actor: string = 'system'
): Promise<StudioBookingLifecycle> {
  const db = getStudioSupabaseAdmin();

  const { data: booking } = await db
    .from('studio_bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  // Record payment
  await db.from('studio_payments').insert({
    booking_id: bookingId,
    payment_intent_id: paymentData.paymentIntentId || null,
    payment_type: paymentData.paymentType,
    amount_tzs: paymentData.amountTzs,
    provider: paymentData.provider,
    provider_reference: paymentData.providerReference || null,
    provider_transaction_id: paymentData.providerTransactionId || null,
    receipt_url: paymentData.receiptUrl || null,
  });

  // If deposit payment and booking is in deposit_pending, confirm
  if (paymentData.paymentType === 'deposit' && booking.lifecycle_status === 'deposit_pending') {
    const balanceDueDate = booking.event_date ? calculateBalanceDueDate(booking.event_date) : null;

    const confirmed = await transitionBooking(
      bookingId,
      'deposit_pending',
      'confirmed',
      actor,
      {
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        balance_due_date: balanceDueDate,
      },
      `Deposit of ${formatTZS(paymentData.amountTzs)} received via ${paymentData.provider}`
    );

    // Send confirmation email
    const viewToken = generateClientToken(bookingId, 'view_booking');
    const statusUrl = `${APP_URL}/book/status/${viewToken}`;
    const email = emails.bookingConfirmedEmail(confirmed, statusUrl);
    await sendEmail({ to: booking.email, ...email, replyTo: STUDIO_ADMIN_EMAIL });

    return confirmed;
  }

  // Log payment event without transition
  await logEvent(
    bookingId,
    'payment_received',
    actor,
    null,
    null,
    `${paymentData.paymentType} payment of ${formatTZS(paymentData.amountTzs)} received`,
    { amount: paymentData.amountTzs, type: paymentData.paymentType, provider: paymentData.provider }
  );

  // Update balance
  if (paymentData.paymentType === 'balance') {
    const newBalance = Math.max(0, booking.balance_due_tzs - paymentData.amountTzs);
    await db.from('studio_bookings')
      .update({ balance_due_tzs: newBalance })
      .eq('id', bookingId);
  }

  return { ...booking } as StudioBookingLifecycle;
}

// ---------------------------------------------------------------------------
// Request Reschedule
// ---------------------------------------------------------------------------

export async function requestReschedule(
  bookingId: string,
  newDate: string,
  newTimeSlot: string,
  actor: string
): Promise<{ booking: StudioBookingLifecycle; fee: number }> {
  const db = getStudioSupabaseAdmin();

  const { data: booking } = await db
    .from('studio_bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  const rescheduleCalc = getRescheduleFee(booking as StudioBookingLifecycle);
  if (!rescheduleCalc.allowed) {
    throw new Error(rescheduleCalc.reason);
  }

  const oldDate = booking.event_date;

  const updated = await transitionBooking(
    bookingId,
    booking.lifecycle_status,
    'reschedule_requested',
    actor,
    {},
    `Reschedule requested: ${oldDate} → ${newDate}`
  );

  // Auto-approve and transition to rescheduled → confirmed
  const rescheduled = await transitionBooking(
    bookingId,
    'reschedule_requested',
    'rescheduled',
    'system',
    {
      event_date: newDate,
      event_time_slot: newTimeSlot,
      reschedule_count: (booking.reschedule_count || 0) + 1,
      balance_due_date: calculateBalanceDueDate(newDate),
    },
    `Rescheduled from ${oldDate} to ${newDate}`
  );

  const confirmed = await transitionBooking(
    bookingId,
    'rescheduled',
    'confirmed',
    'system',
    {},
    'Booking re-confirmed after reschedule'
  );

  // Send email
  const viewToken = generateClientToken(bookingId, 'view_booking');
  const statusUrl = `${APP_URL}/book/status/${viewToken}`;
  const email = emails.rescheduleConfirmationEmail(
    confirmed, oldDate || '', newDate, rescheduleCalc.fee, statusUrl
  );
  await sendEmail({ to: booking.email, ...email, replyTo: STUDIO_ADMIN_EMAIL });

  return { booking: confirmed, fee: rescheduleCalc.fee };
}

// ---------------------------------------------------------------------------
// Cancel Booking
// ---------------------------------------------------------------------------

export async function cancelBooking(
  bookingId: string,
  reason: string,
  actor: string
): Promise<{ booking: StudioBookingLifecycle; refund: ReturnType<typeof getRefundPolicy> }> {
  const db = getStudioSupabaseAdmin();

  const { data: booking } = await db
    .from('studio_bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  const refund = getRefundPolicy(booking as StudioBookingLifecycle);

  const cancelled = await transitionBooking(
    bookingId,
    booking.lifecycle_status,
    'cancelled',
    actor,
    {
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
    },
    `Booking cancelled: ${reason}. ${refund.policyApplied}`
  );

  // Release any active slot holds
  await db.from('studio_slot_holds')
    .update({ is_active: false, released_at: new Date().toISOString() })
    .eq('booking_id', bookingId)
    .eq('is_active', true);

  // Send cancellation email
  const email = emails.cancellationEmail(cancelled, refund);
  await sendEmail({ to: booking.email, ...email, replyTo: STUDIO_ADMIN_EMAIL });

  return { booking: cancelled, refund };
}

// ---------------------------------------------------------------------------
// Admin Override Transition
// ---------------------------------------------------------------------------

export async function adminOverrideTransition(
  bookingId: string,
  toStatus: BookingLifecycleStatus,
  reason: string,
  adminClerkId: string
): Promise<StudioBookingLifecycle> {
  const db = getStudioSupabaseAdmin();

  const { data: booking } = await db
    .from('studio_bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  // Admin override bypasses normal transition rules
  const { data: updated, error } = await db
    .from('studio_bookings')
    .update({
      lifecycle_status: toStatus,
      admin_override_by: adminClerkId,
      admin_override_reason: reason,
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error || !updated) {
    throw new Error(`Failed to override: ${error?.message}`);
  }

  await logEvent(
    bookingId,
    'admin_override',
    `admin:${adminClerkId}`,
    booking.lifecycle_status,
    toStatus,
    `Admin override: ${reason}`,
    { reason, from: booking.lifecycle_status, to: toStatus }
  );

  return updated as StudioBookingLifecycle;
}

// ---------------------------------------------------------------------------
// Complete Booking
// ---------------------------------------------------------------------------

export async function completeBooking(
  bookingId: string,
  adminClerkId: string
): Promise<StudioBookingLifecycle> {
  const db = getStudioSupabaseAdmin();

  const { data: booking } = await db
    .from('studio_bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  return transitionBooking(
    bookingId,
    booking.lifecycle_status,
    'completed',
    `admin:${adminClerkId}`,
    {
      status: 'completed',
      completed_at: new Date().toISOString(),
    },
    'Booking marked as completed'
  );
}

// ---------------------------------------------------------------------------
// Get Booking with Relations
// ---------------------------------------------------------------------------

export async function getBookingWithRelations(bookingId: string): Promise<BookingWithRelations | null> {
  const db = getStudioSupabaseAdmin();

  const { data: booking } = await db
    .from('studio_bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) return null;

  // Fetch relations in parallel
  const [clientRes, packageRes, resourceRes, quotesRes, contractsRes, paymentsRes, eventsRes] = await Promise.all([
    booking.client_id
      ? db.from('studio_client_profiles').select('*').eq('id', booking.client_id).single()
      : { data: null },
    booking.package_id
      ? db.from('studio_packages').select('*').eq('id', booking.package_id).single()
      : { data: null },
    booking.assigned_resource_id
      ? db.from('studio_resources').select('*').eq('id', booking.assigned_resource_id).single()
      : { data: null },
    db.from('studio_quotes').select('*, studio_quote_line_items(*)').eq('booking_id', bookingId).order('created_at', { ascending: false }),
    db.from('studio_contracts').select('*, studio_signatures(*)').eq('booking_id', bookingId).order('created_at', { ascending: false }),
    db.from('studio_payments').select('*').eq('booking_id', bookingId).order('paid_at', { ascending: false }),
    db.from('studio_booking_events').select('*').eq('booking_id', bookingId).order('created_at', { ascending: true }),
  ]);

  // Map quotes with nested line items
  const quotes = (quotesRes.data || []).map((q: Record<string, unknown>) => ({
    ...q,
    line_items: (q.studio_quote_line_items as StudioQuoteLineItem[]) || [],
    studio_quote_line_items: undefined,
  }));

  // Map contracts with nested signatures
  const contracts = (contractsRes.data || []).map((c: Record<string, unknown>) => ({
    ...c,
    signatures: (c.studio_signatures as unknown[]) || [],
    studio_signatures: undefined,
  }));

  return {
    ...booking,
    client: clientRes.data || null,
    package: packageRes.data || null,
    resource: resourceRes.data || null,
    quotes,
    contracts,
    payments: paymentsRes.data || [],
    events: eventsRes.data || [],
  } as BookingWithRelations;
}

// ---------------------------------------------------------------------------
// Get Admin Queue
// ---------------------------------------------------------------------------

export async function getAdminQueue() {
  const db = getStudioSupabaseAdmin();
  const now = new Date().toISOString();
  const today = now.split('T')[0];

  const [
    intakesRes,
    expiringHoldsRes,
    expiringQuotesRes,
    expiringContractsRes,
    depositPendingRes,
    todayRes,
    overdueRes,
  ] = await Promise.all([
    // New intakes awaiting qualification
    db.from('studio_bookings')
      .select('id, name, email, event_type, event_date, service, created_at')
      .eq('lifecycle_status', 'intake_submitted')
      .order('created_at', { ascending: true }),

    // Expiring slot holds (next 5 minutes)
    db.from('studio_slot_holds')
      .select('*')
      .eq('is_active', true)
      .lte('expires_at', new Date(Date.now() + 5 * 60 * 1000).toISOString()),

    // Expiring quotes
    db.from('studio_quotes')
      .select('*, studio_bookings!inner(id, name, email, event_type)')
      .is('accepted_at', null)
      .is('rejected_at', null)
      .is('expired_at', null)
      .lte('valid_until', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),

    // Contracts nearing sign deadline
    db.from('studio_contracts')
      .select('*, studio_bookings!inner(id, name, email, event_type)')
      .is('signed_at', null)
      .is('voided_at', null)
      .not('sign_deadline', 'is', null)
      .lte('sign_deadline', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),

    // Deposit pending
    db.from('studio_bookings')
      .select('id, name, email, event_type, event_date, deposit_amount_tzs, created_at')
      .eq('lifecycle_status', 'deposit_pending')
      .order('created_at', { ascending: true }),

    // Today's confirmed bookings
    db.from('studio_bookings')
      .select('id, name, email, event_type, event_date, event_time_slot, service, location')
      .eq('event_date', today)
      .in('lifecycle_status', ['confirmed', 'rescheduled'])
      .order('event_time_slot', { ascending: true }),

    // Overdue balances
    db.from('studio_bookings')
      .select('id, name, email, event_type, event_date, balance_due_tzs, balance_due_date')
      .eq('lifecycle_status', 'confirmed')
      .lt('balance_due_date', today)
      .gt('balance_due_tzs', 0),
  ]);

  return {
    intakes: intakesRes.data || [],
    expiringHolds: expiringHoldsRes.data || [],
    expiringQuotes: expiringQuotesRes.data || [],
    expiringContracts: expiringContractsRes.data || [],
    depositPending: depositPendingRes.data || [],
    todayBookings: todayRes.data || [],
    overdueBalances: overdueRes.data || [],
  };
}
