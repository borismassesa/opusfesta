// ============================================================================
// Booking State Machine — Pure Functions, No Side Effects
// ============================================================================

import { type BookingLifecycleStatus, type StudioBookingLifecycle } from './booking-types';

// ---------------------------------------------------------------------------
// Valid transitions adjacency map
// ---------------------------------------------------------------------------
export const VALID_TRANSITIONS: Record<BookingLifecycleStatus, BookingLifecycleStatus[]> = {
  draft: ['slot_held', 'cancelled'],
  slot_held: ['intake_submitted', 'cancelled'],
  intake_submitted: ['qualified', 'cancelled'],
  qualified: ['quote_sent', 'cancelled'],
  quote_sent: ['quote_accepted', 'cancelled'],
  quote_accepted: ['contract_sent', 'cancelled'],
  contract_sent: ['contract_signed', 'cancelled'],
  contract_signed: ['deposit_pending', 'cancelled'],
  deposit_pending: ['confirmed', 'cancelled'],
  confirmed: ['reschedule_requested', 'completed', 'cancelled'],
  reschedule_requested: ['rescheduled', 'cancelled'],
  rescheduled: ['confirmed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export function canTransition(from: BookingLifecycleStatus, to: BookingLifecycleStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// ---------------------------------------------------------------------------
// Transitions that only admin can trigger
// ---------------------------------------------------------------------------
const ADMIN_ONLY_TRANSITIONS: Array<[BookingLifecycleStatus, BookingLifecycleStatus]> = [
  ['intake_submitted', 'qualified'],
  ['qualified', 'quote_sent'],
  ['quote_accepted', 'contract_sent'],
  ['confirmed', 'completed'],
];

export function isAdminOnlyTransition(from: BookingLifecycleStatus, to: BookingLifecycleStatus): boolean {
  return ADMIN_ONLY_TRANSITIONS.some(([f, t]) => f === from && t === to);
}

// ---------------------------------------------------------------------------
// Deadlines per status
// ---------------------------------------------------------------------------
interface StatusDeadline {
  durationMs: number;
  label: string;
}

const STATUS_DEADLINES: Partial<Record<BookingLifecycleStatus, StatusDeadline>> = {
  slot_held: { durationMs: 15 * 60 * 1000, label: '15 minutes' },
  quote_sent: { durationMs: 72 * 60 * 60 * 1000, label: '72 hours' },
  contract_sent: { durationMs: 48 * 60 * 60 * 1000, label: '48 hours' },
  deposit_pending: { durationMs: 24 * 60 * 60 * 1000, label: '24 hours' },
};

export function getDeadline(status: BookingLifecycleStatus): StatusDeadline | null {
  return STATUS_DEADLINES[status] ?? null;
}

export function computeDeadlineDate(status: BookingLifecycleStatus, fromDate: Date = new Date()): Date | null {
  const deadline = getDeadline(status);
  if (!deadline) return null;
  return new Date(fromDate.getTime() + deadline.durationMs);
}

// ---------------------------------------------------------------------------
// Cancellation refund policy
// ---------------------------------------------------------------------------
export interface RefundCalculation {
  depositRefund: number;
  balanceRefund: number;
  totalRefund: number;
  policyApplied: string;
}

export function getRefundPolicy(
  booking: Pick<StudioBookingLifecycle, 'deposit_amount_tzs' | 'balance_due_tzs' | 'total_amount_tzs' | 'event_date'>,
  cancellationDate: Date = new Date()
): RefundCalculation {
  if (!booking.event_date) {
    return {
      depositRefund: 0,
      balanceRefund: 0,
      totalRefund: 0,
      policyApplied: 'No event date set — no refund',
    };
  }

  const eventDate = new Date(booking.event_date);
  const daysUntilEvent = Math.floor((eventDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60 * 24));

  // 14+ days: refund balance only (deposit is non-refundable)
  if (daysUntilEvent >= 14) {
    const balanceRefund = booking.balance_due_tzs;
    return {
      depositRefund: 0,
      balanceRefund,
      totalRefund: balanceRefund,
      policyApplied: `${daysUntilEvent} days before event — balance refunded, deposit non-refundable`,
    };
  }

  // 7-13 days: 50% of total amount refunded
  if (daysUntilEvent >= 7) {
    const totalRefund = Math.floor(booking.total_amount_tzs * 0.5);
    return {
      depositRefund: 0,
      balanceRefund: totalRefund,
      totalRefund,
      policyApplied: `${daysUntilEvent} days before event — 50% of total refunded`,
    };
  }

  // <7 days: no refund
  return {
    depositRefund: 0,
    balanceRefund: 0,
    totalRefund: 0,
    policyApplied: `${daysUntilEvent} days before event — no refund`,
  };
}

// ---------------------------------------------------------------------------
// Reschedule fee calculation
// ---------------------------------------------------------------------------
const RESCHEDULE_FEE_TZS = 50_000;
const MAX_RESCHEDULES = 2;

export interface RescheduleCalculation {
  allowed: boolean;
  fee: number;
  reason: string;
}

export function getRescheduleFee(
  booking: Pick<StudioBookingLifecycle, 'reschedule_count' | 'event_date'>,
  rescheduleDate: Date = new Date()
): RescheduleCalculation {
  if (booking.reschedule_count >= MAX_RESCHEDULES) {
    return {
      allowed: false,
      fee: 0,
      reason: `Maximum ${MAX_RESCHEDULES} reschedules reached. Must cancel and rebook.`,
    };
  }

  if (!booking.event_date) {
    return { allowed: true, fee: 0, reason: 'No event date set — free reschedule' };
  }

  const eventDate = new Date(booking.event_date);
  const daysUntilEvent = Math.floor((eventDate.getTime() - rescheduleDate.getTime()) / (1000 * 60 * 60 * 24));

  // First reschedule is free if 7+ days out
  if (booking.reschedule_count === 0 && daysUntilEvent >= 7) {
    return {
      allowed: true,
      fee: 0,
      reason: 'First reschedule, 7+ days before event — free',
    };
  }

  // Otherwise, TZS 50,000 fee
  return {
    allowed: true,
    fee: RESCHEDULE_FEE_TZS,
    reason: booking.reschedule_count > 0
      ? `Reschedule #${booking.reschedule_count + 1} — TZS ${RESCHEDULE_FEE_TZS.toLocaleString()} fee`
      : `Less than 7 days before event — TZS ${RESCHEDULE_FEE_TZS.toLocaleString()} fee`,
  };
}

// ---------------------------------------------------------------------------
// Balance due date calculation (7 days before event)
// ---------------------------------------------------------------------------
export function calculateBalanceDueDate(eventDate: string): string {
  const date = new Date(eventDate);
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
}

// ---------------------------------------------------------------------------
// Status display helpers
// ---------------------------------------------------------------------------
export const STATUS_LABELS: Record<BookingLifecycleStatus, string> = {
  draft: 'Draft',
  slot_held: 'Slot Held',
  intake_submitted: 'Intake Submitted',
  qualified: 'Qualified',
  quote_sent: 'Quote Sent',
  quote_accepted: 'Quote Accepted',
  contract_sent: 'Contract Sent',
  contract_signed: 'Contract Signed',
  deposit_pending: 'Deposit Pending',
  confirmed: 'Confirmed',
  reschedule_requested: 'Reschedule Requested',
  rescheduled: 'Rescheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export type StatusColor = 'gray' | 'blue' | 'indigo' | 'violet' | 'amber' | 'orange' | 'green' | 'yellow' | 'red';

export const STATUS_COLORS: Record<BookingLifecycleStatus, StatusColor> = {
  draft: 'gray',
  slot_held: 'blue',
  intake_submitted: 'blue',
  qualified: 'indigo',
  quote_sent: 'violet',
  quote_accepted: 'violet',
  contract_sent: 'amber',
  contract_signed: 'amber',
  deposit_pending: 'orange',
  confirmed: 'green',
  reschedule_requested: 'yellow',
  rescheduled: 'green',
  completed: 'gray',
  cancelled: 'red',
};
