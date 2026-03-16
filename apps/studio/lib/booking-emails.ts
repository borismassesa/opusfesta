// ============================================================================
// Booking Lifecycle Email Templates
// Matches existing brutal email style (dark header, table layout, 4px border)
// ============================================================================

import { formatTZS } from './booking-types';
import type { StudioBookingLifecycle, StudioQuote, StudioQuoteLineItem } from './booking-types';

const STUDIO_EMAIL = 'studio@opusfesta.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://studio.opusfesta.com';

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:monospace,monospace">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:24px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:3px solid #1a1a1a;max-width:600px">
<tr><td style="background:#1a1a1a;color:#f5f5f0;padding:24px 32px;font-size:14px;font-weight:700;letter-spacing:1px">
OpusStudio
</td></tr>
<tr><td style="padding:32px;font-size:14px;line-height:1.6;color:#1a1a1a">
<h2 style="margin:0 0 16px;font-size:18px;font-weight:700">${esc(title)}</h2>
${body}
</td></tr>
<tr><td style="padding:16px 32px;font-size:11px;color:#888;border-top:1px solid #e0e0e0;text-align:center">
OpusStudio — Dar es Salaam, Tanzania
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function button(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;background:#1a1a1a;color:#f5f5f0;padding:12px 24px;font-size:14px;font-weight:700;text-decoration:none;font-family:monospace,monospace;border:2px solid #1a1a1a;margin:16px 0">${esc(label)}</a>`;
}

function detailRow(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px;font-weight:700;border-bottom:1px solid #eee;width:140px">${esc(label)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee">${esc(value)}</td></tr>`;
}

// ---------------------------------------------------------------------------
// Intake received (to client)
// ---------------------------------------------------------------------------
export function intakeReceivedEmail(booking: StudioBookingLifecycle) {
  return {
    subject: `We've received your booking request — OpusStudio`,
    html: layout('Booking Request Received', `
<p>Hi ${esc(booking.name)},</p>
<p>Thank you for your interest in OpusStudio! We've received your booking request and our team will review it shortly.</p>
<table cellpadding="0" cellspacing="0" style="width:100%;border:2px solid #1a1a1a;margin:16px 0">
${detailRow('Event Type', booking.event_type)}
${booking.event_date ? detailRow('Event Date', booking.event_date) : ''}
${booking.location ? detailRow('Location', booking.location) : ''}
${booking.service ? detailRow('Service', booking.service) : ''}
</table>
<p>We'll be in touch within 24 hours with next steps, including a personalized quote for your event.</p>
<p style="color:#888;font-size:12px">If you have any questions, reply to this email or contact us at ${STUDIO_EMAIL}.</p>
`),
  };
}

// ---------------------------------------------------------------------------
// Intake notification (to admin)
// ---------------------------------------------------------------------------
export function intakeNotificationEmail(booking: StudioBookingLifecycle) {
  return {
    subject: `New Booking Request: ${booking.event_type} — ${booking.name}`,
    html: layout('New Booking Request', `
<p>A new booking request has been submitted.</p>
<table cellpadding="0" cellspacing="0" style="width:100%;border:2px solid #1a1a1a;margin:16px 0">
${detailRow('Name', booking.name)}
${detailRow('Email', booking.email)}
${booking.phone ? detailRow('Phone', booking.phone) : ''}
${detailRow('Event Type', booking.event_type)}
${booking.event_date ? detailRow('Date', booking.event_date) : ''}
${booking.location ? detailRow('Location', booking.location) : ''}
${booking.service ? detailRow('Service', booking.service) : ''}
${booking.guest_count ? detailRow('Guests', String(booking.guest_count)) : ''}
${booking.message ? detailRow('Message', booking.message) : ''}
</table>
${button(`${APP_URL}/admin/bookings/${booking.id}`, 'VIEW IN ADMIN')}
`),
  };
}

// ---------------------------------------------------------------------------
// Quote sent (to client)
// ---------------------------------------------------------------------------
export function quoteSentEmail(
  booking: StudioBookingLifecycle,
  quote: StudioQuote & { line_items: StudioQuoteLineItem[] },
  acceptUrl: string
) {
  const lineItemRows = quote.line_items
    .map(li => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee">${esc(li.description)}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${li.quantity}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${formatTZS(li.total_tzs)}</td></tr>`)
    .join('');

  return {
    subject: `Your Quote from OpusStudio — ${quote.quote_number}`,
    html: layout('Your Personalized Quote', `
<p>Hi ${esc(booking.name)},</p>
<p>We've prepared a quote for your ${esc(booking.event_type)}. Please review the details below.</p>
<table cellpadding="0" cellspacing="0" style="width:100%;border:2px solid #1a1a1a;margin:16px 0">
<tr style="background:#1a1a1a;color:#f5f5f0"><th style="padding:8px 12px;text-align:left">Item</th><th style="padding:8px 12px;text-align:center">Qty</th><th style="padding:8px 12px;text-align:right">Amount</th></tr>
${lineItemRows}
${quote.discount_tzs > 0 ? `<tr><td colspan="2" style="padding:6px 12px;font-weight:700">Discount${quote.discount_reason ? ` (${esc(quote.discount_reason)})` : ''}</td><td style="padding:6px 12px;text-align:right;color:#c00">-${formatTZS(quote.discount_tzs)}</td></tr>` : ''}
<tr style="font-weight:700;font-size:16px"><td colspan="2" style="padding:12px;border-top:3px solid #1a1a1a">Total</td><td style="padding:12px;border-top:3px solid #1a1a1a;text-align:right">${formatTZS(quote.total_tzs)}</td></tr>
</table>
<p><strong>Deposit Required:</strong> ${formatTZS(quote.deposit_amount_tzs)} (${quote.deposit_percent}%)</p>
<p><strong>Quote Valid Until:</strong> ${new Date(quote.valid_until).toLocaleDateString('en-TZ', { dateStyle: 'full' })}</p>
${quote.notes ? `<p><strong>Notes:</strong> ${esc(quote.notes)}</p>` : ''}
${button(acceptUrl, 'REVIEW & ACCEPT QUOTE')}
<p style="color:#888;font-size:12px">This quote expires automatically after the date shown above. If you have questions, reply to this email.</p>
`),
  };
}

// ---------------------------------------------------------------------------
// Contract sent (to client)
// ---------------------------------------------------------------------------
export function contractSentEmail(
  booking: StudioBookingLifecycle,
  signUrl: string,
  signDeadline: string
) {
  return {
    subject: `Contract Ready for Signing — OpusStudio`,
    html: layout('Your Contract is Ready', `
<p>Hi ${esc(booking.name)},</p>
<p>Your contract for the ${esc(booking.event_type)} is ready for your review and signature.</p>
<p><strong>Signing Deadline:</strong> ${new Date(signDeadline).toLocaleDateString('en-TZ', { dateStyle: 'full' })}</p>
${button(signUrl, 'REVIEW & SIGN CONTRACT')}
<p style="color:#888;font-size:12px">Please sign within the deadline to secure your booking. If you have questions, reply to this email.</p>
`),
  };
}

// ---------------------------------------------------------------------------
// Deposit request (to client)
// ---------------------------------------------------------------------------
export function depositRequestEmail(
  booking: StudioBookingLifecycle,
  paymentUrl: string
) {
  return {
    subject: `Deposit Payment Required — OpusStudio`,
    html: layout('Complete Your Deposit', `
<p>Hi ${esc(booking.name)},</p>
<p>Your contract has been signed! To confirm your booking, please complete the deposit payment.</p>
<table cellpadding="0" cellspacing="0" style="width:100%;border:2px solid #1a1a1a;margin:16px 0">
${detailRow('Deposit Amount', formatTZS(booking.deposit_amount_tzs))}
${detailRow('Event Date', booking.event_date || 'TBD')}
${detailRow('Event Type', booking.event_type)}
</table>
${button(paymentUrl, 'PAY DEPOSIT NOW')}
<p style="color:#888;font-size:12px">You can pay via mobile money (Airtel, Vodacom/M-Pesa, Tigo, HaloPesa) or card.</p>
`),
  };
}

// ---------------------------------------------------------------------------
// Booking confirmed (to client)
// ---------------------------------------------------------------------------
export function bookingConfirmedEmail(
  booking: StudioBookingLifecycle,
  statusUrl: string
) {
  return {
    subject: `Booking Confirmed! — OpusStudio`,
    html: layout('Your Booking is Confirmed', `
<p>Hi ${esc(booking.name)},</p>
<p>Great news — your booking has been confirmed! We're looking forward to your ${esc(booking.event_type)}.</p>
<table cellpadding="0" cellspacing="0" style="width:100%;border:2px solid #1a1a1a;margin:16px 0">
${booking.event_date ? detailRow('Event Date', booking.event_date) : ''}
${booking.location ? detailRow('Location', booking.location) : ''}
${booking.service ? detailRow('Service', booking.service) : ''}
${detailRow('Total', formatTZS(booking.total_amount_tzs))}
${detailRow('Deposit Paid', formatTZS(booking.deposit_amount_tzs))}
${booking.balance_due_tzs > 0 ? detailRow('Balance Due', `${formatTZS(booking.balance_due_tzs)} by ${booking.balance_due_date || 'TBD'}`) : ''}
</table>
${button(statusUrl, 'VIEW BOOKING DETAILS')}
<p style="color:#888;font-size:12px">You can view your booking status, contract, and receipts anytime via the link above.</p>
`),
  };
}

// ---------------------------------------------------------------------------
// Balance reminder (to client)
// ---------------------------------------------------------------------------
export function balanceReminderEmail(
  booking: StudioBookingLifecycle,
  paymentUrl: string
) {
  return {
    subject: `Balance Payment Reminder — OpusStudio`,
    html: layout('Balance Payment Due Soon', `
<p>Hi ${esc(booking.name)},</p>
<p>This is a friendly reminder that your remaining balance is due soon.</p>
<table cellpadding="0" cellspacing="0" style="width:100%;border:2px solid #1a1a1a;margin:16px 0">
${detailRow('Balance Due', formatTZS(booking.balance_due_tzs))}
${detailRow('Due Date', booking.balance_due_date || 'TBD')}
${booking.event_date ? detailRow('Event Date', booking.event_date) : ''}
</table>
${button(paymentUrl, 'PAY BALANCE NOW')}
<p style="color:#888;font-size:12px">Please complete payment by the due date to avoid booking cancellation.</p>
`),
  };
}

// ---------------------------------------------------------------------------
// Balance overdue (to client)
// ---------------------------------------------------------------------------
export function balanceOverdueEmail(
  booking: StudioBookingLifecycle,
  paymentUrl: string
) {
  return {
    subject: `URGENT: Balance Payment Overdue — OpusStudio`,
    html: layout('Balance Payment Overdue', `
<p>Hi ${esc(booking.name)},</p>
<p><strong>Your balance payment is overdue.</strong> You have a 48-hour grace period to complete payment before your booking is automatically cancelled.</p>
<table cellpadding="0" cellspacing="0" style="width:100%;border:2px solid #1a1a1a;margin:16px 0">
${detailRow('Balance Due', formatTZS(booking.balance_due_tzs))}
${detailRow('Original Due Date', booking.balance_due_date || 'TBD')}
</table>
${button(paymentUrl, 'PAY BALANCE NOW')}
<p style="color:#c00;font-size:12px;font-weight:700">If payment is not received within 48 hours, your booking will be cancelled and your deposit will be forfeited.</p>
`),
  };
}

// ---------------------------------------------------------------------------
// Cancellation (to client)
// ---------------------------------------------------------------------------
export function cancellationEmail(
  booking: StudioBookingLifecycle,
  refund: { policyApplied: string; totalRefund: number }
) {
  return {
    subject: `Booking Cancelled — OpusStudio`,
    html: layout('Booking Cancelled', `
<p>Hi ${esc(booking.name)},</p>
<p>Your booking for ${esc(booking.event_type)} has been cancelled.</p>
${booking.cancellation_reason ? `<p><strong>Reason:</strong> ${esc(booking.cancellation_reason)}</p>` : ''}
<table cellpadding="0" cellspacing="0" style="width:100%;border:2px solid #1a1a1a;margin:16px 0">
${detailRow('Policy Applied', refund.policyApplied)}
${detailRow('Total Refund', formatTZS(refund.totalRefund))}
</table>
${refund.totalRefund > 0 ? '<p>Your refund will be processed within 5-7 business days via the original payment method.</p>' : ''}
<p style="color:#888;font-size:12px">If you believe this was in error or have questions, please contact us at ${STUDIO_EMAIL}.</p>
`),
  };
}

// ---------------------------------------------------------------------------
// Reschedule confirmation (to client)
// ---------------------------------------------------------------------------
export function rescheduleConfirmationEmail(
  booking: StudioBookingLifecycle,
  oldDate: string,
  newDate: string,
  fee: number,
  statusUrl: string
) {
  return {
    subject: `Booking Rescheduled — OpusStudio`,
    html: layout('Booking Rescheduled', `
<p>Hi ${esc(booking.name)},</p>
<p>Your booking has been rescheduled.</p>
<table cellpadding="0" cellspacing="0" style="width:100%;border:2px solid #1a1a1a;margin:16px 0">
${detailRow('Previous Date', oldDate)}
${detailRow('New Date', newDate)}
${fee > 0 ? detailRow('Reschedule Fee', formatTZS(fee)) : detailRow('Reschedule Fee', 'Waived')}
</table>
${button(statusUrl, 'VIEW UPDATED BOOKING')}
`),
  };
}
