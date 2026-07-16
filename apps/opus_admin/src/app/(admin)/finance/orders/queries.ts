import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase'

export type FulfillmentStatus = 'not_started' | 'in_progress' | 'ready' | 'delivered'

export type FulfillmentOrder = {
  id: string
  ref: string
  status: string
  provider: string
  paymentMethod: string | null
  paymentLabel: string | null
  fulfillmentStatus: FulfillmentStatus
  fulfillmentUpdatedAt: string | null
  fulfillmentUpdatedBy: string | null
  amountTotal: number
  contactName: string | null
  contactEmail: string
  contactPhone: string
  items: FulfillmentOrderItem[]
  paidAt: string | null
  createdAt: string
}

export type FulfillmentOrderItem = {
  id?: string
  name?: string
  image?: string
  summary?: string
  tier?: string
  guests?: number
  total?: number
}

type FulfillmentOrderRow = {
  id: string
  ref: string
  status: string
  provider: string
  payment_method: string | null
  payment_label: string | null
  fulfillment_status: FulfillmentStatus
  fulfillment_updated_at: string | null
  fulfillment_updated_by: string | null
  amount_total: string | number
  contact_name: string | null
  contact_email: string
  contact_phone: string
  items: unknown
  paid_at: string | null
  created_at: string
}

const COLUMNS = `
  id, ref, status, provider, payment_method, payment_label,
  fulfillment_status, fulfillment_updated_at, fulfillment_updated_by,
  amount_total, contact_name, contact_email, contact_phone, items,
  paid_at, created_at
`

function parseItems(value: unknown): FulfillmentOrderItem[] {
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

function mapOrder(row: FulfillmentOrderRow): FulfillmentOrder {
  return {
    id: row.id,
    ref: row.ref,
    status: row.status,
    provider: row.provider,
    paymentMethod: row.payment_method,
    paymentLabel: row.payment_label,
    fulfillmentStatus: row.fulfillment_status,
    fulfillmentUpdatedAt: row.fulfillment_updated_at,
    fulfillmentUpdatedBy: row.fulfillment_updated_by,
    amountTotal: Number(row.amount_total),
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    items: parseItems(row.items),
    paidAt: row.paid_at,
    createdAt: row.created_at,
  }
}

export type FulfillmentFilter = 'all' | 'not_started' | 'in_progress' | 'ready' | 'delivered'

export const ORDERS_PAGE_SIZE = 50

/**
 * Every PAID order regardless of provider — unlike finance/payments (a
 * payment-*verification* queue, Lipa-Namba-only by design since card/mobile
 * auto-confirm via Selcom), this is a fulfilment-*tracking* queue: nothing
 * here needs approval, it's already paid. That's why there's no provider
 * filter and no status other than 'paid' — a pending/processing/failed order
 * has nothing to fulfil yet.
 */
export async function getFulfillmentOrders(
  opts: { filter?: FulfillmentFilter; q?: string; limit?: number } = {},
): Promise<FulfillmentOrder[]> {
  const { filter = 'all', q, limit = ORDERS_PAGE_SIZE } = opts
  const supabase = createSupabaseAdminClient()
  let query = supabase.from('invitation_orders').select(COLUMNS).eq('status', 'paid')

  if (filter !== 'all') query = query.eq('fulfillment_status', filter)

  const term = (q ?? '').replace(/[^a-zA-Z0-9@.\-_ ]/g, '').trim()
  if (term) {
    query = query.or(
      [
        `ref.ilike.%${term}%`,
        `contact_name.ilike.%${term}%`,
        `contact_email.ilike.%${term}%`,
      ].join(','),
    )
  }

  const { data, error } = await query
    .order('paid_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return ((data ?? []) as FulfillmentOrderRow[]).map(mapOrder)
}

/** Totals for the KPI tiles — independent of the current filter/search. */
export async function getFulfillmentSummary(): Promise<{
  notStarted: number
  inProgress: number
  ready: number
  delivered: number
}> {
  const supabase = createSupabaseAdminClient()
  const base = () => supabase.from('invitation_orders').select('id', { count: 'exact', head: true }).eq('status', 'paid')

  const [notStarted, inProgress, ready, delivered] = await Promise.all([
    base().eq('fulfillment_status', 'not_started'),
    base().eq('fulfillment_status', 'in_progress'),
    base().eq('fulfillment_status', 'ready'),
    base().eq('fulfillment_status', 'delivered'),
  ])

  return {
    notStarted: notStarted.count ?? 0,
    inProgress: inProgress.count ?? 0,
    ready: ready.count ?? 0,
    delivered: delivered.count ?? 0,
  }
}
