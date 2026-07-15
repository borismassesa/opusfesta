import type { Treatment } from '@/components/guests/InvitationVisual'

// Shared payment types — safe to import from both client and server (no
// 'server-only' or node deps here). Mirrors the DB enum in the
// 20260613000001_invitation_orders migration.

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded'

/** Terminal states — no further transition is expected. */
export const TERMINAL_STATUSES: ReadonlySet<OrderStatus> = new Set([
  'paid',
  'failed',
  'expired',
  'refunded',
])

export function isTerminal(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.has(status)
}

export type PaymentMethod = 'mobile' | 'card' | 'lipa_namba'

/** One cart line as sent from the browser to /api/payments/initiate. */
export type InitiateItem = {
  id: string
  name: string
  /** Selected card's hero image — persisted so admin/email/dashboard can render it. */
  image?: string
  /** Visual treatment — fallback thumbnail when the card has no hero image. */
  treatment?: Treatment
  summary?: string
  tier?: string
  tierId?: string
  guests?: number
  /** Per-guest tier price (TZS) the client used — re-verified against the CMS. */
  pricePerGuest?: number
  /** Non-guest-scaling extras already folded into `total` (prints, swag, etc.). */
  extrasTotal?: number
  addOns?: string[]
  /** Client-computed line total (TZS) — re-derived server-side, never trusted.
   *  Ignored when `kind` names a flat-price product (see `kind`). */
  total: number
  /** Marks a non-invitation flat-price line (e.g. a single pledge/thank-you
   *  card template unlock) so priceOrder() can authoritatively re-price it
   *  instead of trusting the client or the guest-tier math. */
  kind?: 'template_unlock'
}

export type InitiateContact = {
  name?: string
  email: string
  phone: string
}

export type InitiateRequest = {
  method: PaymentMethod
  /** msisdn that should receive the M-Pesa push (mobile method only). */
  phone?: string
  /** Manual Lipa Namba account holder name as entered by the customer. */
  payerName?: string
  /** Manual Lipa Namba transaction confirmation code/reference. */
  paymentReference?: string
  contact: InitiateContact
  items: InitiateItem[]
  eventDate?: string
  /** Which of the couple's wedding_events this order's design/quota is for. */
  eventId?: string
  /** Label persisted for the invoice, e.g. "M-Pesa +255…". */
  paymentLabel?: string
  /** Where Selcom returns the buyer after a card payment. Defaults to the
   *  invitation-checkout confirmation page when omitted. */
  redirectPath?: string
  /** Where Selcom sends the buyer if they cancel a card payment. Defaults to
   *  the invitation checkout page when omitted. */
  cancelPath?: string
}

/** Response from /api/payments/initiate. */
export type InitiateResponse = {
  ref: string
  status: OrderStatus
  /** For the card method — the Selcom hosted-checkout URL to redirect to. */
  redirectUrl?: string
  /** User-facing message when something is off (e.g. amount mismatch). */
  message?: string
}

/** Response from /api/payments/status?ref=… */
export type StatusResponse = {
  ref: string
  status: OrderStatus
  amountTotal: number
  currency: string
  paymentLabel?: string
  paidAt?: string
}
