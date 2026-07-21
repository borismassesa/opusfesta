import 'server-only'

import { createSupabaseAdminClient } from '@/lib/supabase'

export type EntitlementKind = 'invite' | 'entrance_pass'
export type AdjustmentDirection = 'grant' | 'revoke'

export interface EntitlementAdjustmentInput {
  userId: string
  eventId: string
  kind: string
  /** 'grant' adds credits, 'revoke' removes them. */
  direction: string
  /** Positive whole number of credits; the sign comes from `direction`. */
  quantity: number
  reason: string
  adminEmail: string
}

/**
 * Append one audit-trailed row to `entitlement_adjustments` (migration
 * 20260711000003), the layer that sits on top of purchased quota.
 *
 * `purchased` is derived from paid invitation_orders and is never edited
 * directly — that would erase the record of what a couple actually bought.
 * Rows here are never edited or deleted either: reverse an adjustment by
 * inserting an opposite-sign one so the trail stays intact.
 *
 * Shared by the two surfaces that can adjust credits — finance's payment
 * console (`finance.write`) and OpusPass's Couple Accounts console
 * (`opuspass.couples.write`) — so validation lives in one place while each
 * caller keeps its own permission gate and revalidation path. Callers MUST
 * check permissions before calling; this helper does not.
 */
export async function insertEntitlementAdjustment(input: EntitlementAdjustmentInput): Promise<void> {
  const { userId, eventId, kind, direction, quantity, reason, adminEmail } = input

  if (!userId || !eventId) {
    throw new Error('Missing user or event — this order must be approved and assigned to an event first.')
  }
  if (kind !== 'invite' && kind !== 'entrance_pass') throw new Error('Invalid credit kind.')
  if (direction !== 'grant' && direction !== 'revoke') throw new Error('Invalid adjustment direction.')
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Enter a whole number of credits greater than zero.')
  }
  if (!reason.trim()) throw new Error('Add a reason for this adjustment — it becomes part of the audit trail.')

  const supabase = createSupabaseAdminClient()

  // Both call sites source userId/eventId from hidden form fields — cheap to
  // spoof on a directly-POSTed server action. Confirm the event actually
  // belongs to the couple before writing, so a mismatched pair fails loudly
  // instead of landing as a silently-orphaned audit row.
  const { data: event, error: eventErr } = await supabase
    .from('wedding_events')
    .select('id')
    .eq('id', eventId)
    .eq('user_id', userId)
    .maybeSingle<{ id: string }>()
  if (eventErr) throw new Error(eventErr.message)
  if (!event) throw new Error('This event does not belong to the selected couple.')

  const { error } = await supabase.from('entitlement_adjustments').insert({
    user_id: userId,
    event_id: eventId,
    kind,
    delta: direction === 'grant' ? quantity : -quantity,
    reason: reason.trim(),
    admin_email: adminEmail,
  })
  if (error) throw new Error(error.message)
}
