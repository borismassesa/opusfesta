import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase'

export type InvitationPaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded'

export type InvitationPaymentItem = {
  id?: string
  name?: string
  /** Selected card's hero image (Supabase URL) for the review thumbnail. */
  image?: string
  summary?: string
  tier?: string
  guests?: number
  total?: number
}

export type InvitationPayment = {
  id: string
  ref: string
  status: InvitationPaymentStatus
  currency: string
  subtotal: number
  discount: number
  amountTotal: number
  contactName: string | null
  contactEmail: string
  contactPhone: string
  items: InvitationPaymentItem[]
  paymentMethod: string | null
  payerPhone: string | null
  payerName: string | null
  paymentReference: string | null
  paymentLabel: string | null
  paymentSubmittedAt: string | null
  paidAt: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  reviewNote: string | null
  customerInvoiceEmailedAt: string | null
  adminNotifiedAt: string | null
  createdAt: string
}

type InvitationPaymentRow = {
  id: string
  ref: string
  status: InvitationPaymentStatus
  currency: string
  subtotal: string | number
  discount: string | number
  amount_total: string | number
  contact_name: string | null
  contact_email: string
  contact_phone: string
  items: unknown
  payment_method: string | null
  payer_phone: string | null
  payer_name: string | null
  payment_reference: string | null
  payment_label: string | null
  payment_submitted_at: string | null
  paid_at: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  review_note: string | null
  customer_invoice_emailed_at: string | null
  admin_notified_at: string | null
  created_at: string
}

const COLUMNS = `
  id, ref, status, currency, subtotal, discount, amount_total,
  contact_name, contact_email, contact_phone, items, payment_method,
  payer_phone, payer_name, payment_reference, payment_label,
  payment_submitted_at, paid_at, reviewed_at, reviewed_by, review_note,
  customer_invoice_emailed_at, admin_notified_at, created_at
`

function parseItems(value: unknown): InvitationPaymentItem[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id : undefined,
      name: typeof item.name === 'string' ? item.name : undefined,
      image: typeof item.image === 'string' ? item.image : undefined,
      summary: typeof item.summary === 'string' ? item.summary : undefined,
      tier: typeof item.tier === 'string' ? item.tier : undefined,
      guests: typeof item.guests === 'number' ? item.guests : undefined,
      total: typeof item.total === 'number' ? item.total : undefined,
    }))
}

function mapPayment(row: InvitationPaymentRow): InvitationPayment {
  return {
    id: row.id,
    ref: row.ref,
    status: row.status,
    currency: row.currency,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    amountTotal: Number(row.amount_total),
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    items: parseItems(row.items),
    paymentMethod: row.payment_method,
    payerPhone: row.payer_phone,
    payerName: row.payer_name,
    paymentReference: row.payment_reference,
    paymentLabel: row.payment_label,
    paymentSubmittedAt: row.payment_submitted_at,
    paidAt: row.paid_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    reviewNote: row.review_note,
    customerInvoiceEmailedAt: row.customer_invoice_emailed_at,
    adminNotifiedAt: row.admin_notified_at,
    createdAt: row.created_at,
  }
}

export type PaymentFilter = 'all' | 'review' | 'paid' | 'failed'

/** Statuses that still need a finance decision. */
const REVIEW_STATUSES = ['processing', 'pending']

export const PAYMENTS_PAGE_SIZE = 50

export async function getInvitationPayments(
  opts: { filter?: PaymentFilter; q?: string; limit?: number } = {},
): Promise<InvitationPayment[]> {
  const { filter = 'all', q, limit = PAYMENTS_PAGE_SIZE } = opts
  const supabase = createSupabaseAdminClient()
  let query = supabase
    .from('invitation_orders')
    .select(COLUMNS)
    .eq('provider', 'mpesa_lipa_namba')

  if (filter === 'review') query = query.in('status', REVIEW_STATUSES)
  else if (filter === 'paid') query = query.eq('status', 'paid')
  else if (filter === 'failed') query = query.eq('status', 'failed')

  // Sanitize before interpolating into the PostgREST `or` filter (strip commas,
  // parens and wildcards that would otherwise break out of the filter clause).
  const term = (q ?? '').replace(/[^a-zA-Z0-9@.\-_ ]/g, '').trim()
  if (term) {
    query = query.or(
      [
        `ref.ilike.%${term}%`,
        `contact_name.ilike.%${term}%`,
        `contact_email.ilike.%${term}%`,
        `payer_name.ilike.%${term}%`,
        `payment_reference.ilike.%${term}%`,
      ].join(','),
    )
  }

  const { data, error } = await query
    .order('payment_submitted_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return ((data ?? []) as InvitationPaymentRow[]).map(mapPayment)
}

/** Totals for the KPI tiles — independent of the current filter/search. */
export async function getInvitationPaymentSummary(): Promise<{
  review: number
  paid: number
  failed: number
  reviewValue: number
}> {
  const supabase = createSupabaseAdminClient()
  const base = () =>
    supabase.from('invitation_orders').select('id', { count: 'exact', head: true }).eq('provider', 'mpesa_lipa_namba')

  const [reviewRes, paidRes, failedRes, reviewRows] = await Promise.all([
    base().in('status', REVIEW_STATUSES),
    base().eq('status', 'paid'),
    base().eq('status', 'failed'),
    supabase
      .from('invitation_orders')
      .select('amount_total')
      .eq('provider', 'mpesa_lipa_namba')
      .in('status', REVIEW_STATUSES),
  ])

  const reviewValue = ((reviewRows.data ?? []) as { amount_total: string | number }[]).reduce(
    (sum, r) => sum + Number(r.amount_total),
    0,
  )

  return {
    review: reviewRes.count ?? 0,
    paid: paidRes.count ?? 0,
    failed: failedRes.count ?? 0,
    reviewValue,
  }
}
