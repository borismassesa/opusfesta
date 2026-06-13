import 'server-only'
import { createSupabaseServerClient } from '@/lib/supabase'
import type { InitiateItem, OrderStatus } from './types'
import { isTerminal } from './types'

// Data-access layer for invitation_orders / invitation_payment_events. All
// reads/writes go through the service-role client (RLS denies everyone else).

export type OrderRow = {
  id: string
  ref: string
  status: OrderStatus
  currency: string
  subtotal: number
  discount: number
  amount_total: number
  contact_name: string | null
  contact_email: string
  contact_phone: string
  event_date: string | null
  items: InitiateItem[]
  payment_method: string | null
  payer_phone: string | null
  provider_order_id: string | null
  payment_label: string | null
  paid_at: string | null
}

const SELECT_COLS =
  'id, ref, status, currency, subtotal, discount, amount_total, contact_name, contact_email, contact_phone, event_date, items, payment_method, payer_phone, provider_order_id, payment_label, paid_at'

export async function createPendingOrder(input: {
  ref: string
  userId?: string | null
  currency: string
  subtotal: number
  discount: number
  amountTotal: number
  contact: { name?: string; email: string; phone: string }
  eventDate?: string | null
  items: InitiateItem[]
  paymentMethod: 'mobile' | 'card'
  payerPhone?: string | null
  paymentLabel?: string | null
}): Promise<OrderRow> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('invitation_orders')
    .insert({
      ref: input.ref,
      user_id: input.userId ?? null,
      status: 'pending',
      currency: input.currency,
      subtotal: input.subtotal,
      discount: input.discount,
      amount_total: input.amountTotal,
      contact_name: input.contact.name ?? null,
      contact_email: input.contact.email,
      contact_phone: input.contact.phone,
      event_date: input.eventDate ?? null,
      items: input.items,
      provider: 'selcom',
      payment_method: input.paymentMethod,
      payer_phone: input.payerPhone ?? null,
      payment_label: input.paymentLabel ?? null,
    })
    .select(SELECT_COLS)
    .single()
  if (error) throw new Error(`createPendingOrder failed: ${error.message}`)
  return data as OrderRow
}

export async function getOrderByRef(ref: string): Promise<OrderRow | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('invitation_orders')
    .select(SELECT_COLS)
    .eq('ref', ref)
    .maybeSingle()
  if (error) throw new Error(`getOrderByRef failed: ${error.message}`)
  return (data as OrderRow) ?? null
}

export async function setProviderOrderId(ref: string, providerOrderId: string): Promise<void> {
  const supabase = createSupabaseServerClient()
  await supabase
    .from('invitation_orders')
    .update({ provider_order_id: providerOrderId })
    .eq('ref', ref)
}

/**
 * Transition an order to a new status. Refuses to move OUT of a terminal state
 * (so a late duplicate webhook can't flip a `paid` order to `failed`, or vice
 * versa). Returns the resulting status.
 */
export async function transitionOrder(
  ref: string,
  next: OrderStatus,
): Promise<OrderStatus> {
  const supabase = createSupabaseServerClient()
  const current = await getOrderByRef(ref)
  if (!current) throw new Error(`transitionOrder: order ${ref} not found`)
  if (isTerminal(current.status)) return current.status // locked — no-op

  const patch: Record<string, unknown> = { status: next }
  if (next === 'paid') patch.paid_at = new Date().toISOString()
  const { error } = await supabase.from('invitation_orders').update(patch).eq('ref', ref)
  if (error) throw new Error(`transitionOrder failed: ${error.message}`)
  return next
}

/**
 * Append a provider callback to the audit log. Idempotent: a duplicate
 * `providerEventId` is silently ignored (unique-violation → already processed).
 * Returns true when this was a NEW event (caller should act on it).
 */
export async function recordPaymentEvent(input: {
  orderId: string
  providerEventId?: string | null
  status?: OrderStatus | null
  rawPayload: unknown
}): Promise<boolean> {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('invitation_payment_events').insert({
    order_id: input.orderId,
    provider_event_id: input.providerEventId ?? null,
    status: input.status ?? null,
    raw_payload: input.rawPayload as never,
  })
  if (error) {
    // 23505 = unique_violation → this exact event was already recorded.
    if ((error as { code?: string }).code === '23505') return false
    throw new Error(`recordPaymentEvent failed: ${error.message}`)
  }
  return true
}
