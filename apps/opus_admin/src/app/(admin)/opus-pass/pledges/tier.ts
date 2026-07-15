import 'server-only'
import { createSupabaseAdminClient } from '@/lib/supabase'

// Ported from apps/opus_pass/src/lib/dashboard/queries.ts's cardTier
// resolution (~line 1396) — there's no queryable tier column anywhere, the
// purchased package tier lives inside invitation_orders.items (jsonb), one
// entry per line item. Each item carries BOTH `.tier` (a capitalized display
// label, e.g. "Signature") and `.tierId` (the lowercase machine key, e.g.
// "signature") — always match against `.tierId`, never `.tier`.

export type PledgeConciergeTier = 'elegant' | 'signature'
const ELIGIBLE_TIERS = new Set<PledgeConciergeTier>(['elegant', 'signature'])

type OrderItemRow = { tierId?: string }
type PaidOrderRow = { user_id: string | null; items: OrderItemRow[] | null }

/** All (userId -> highest-value eligible tier) pairs across every couple with
 *  at least one paid order at Elegant/Signature — OR-across-account, so a
 *  couple who upgraded mid-campaign (or bought a lower tier for a second
 *  event) is still visible to staff. */
export async function listEligibleCoupleTiers(): Promise<Map<string, PledgeConciergeTier>> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('invitation_orders')
    .select('user_id, items')
    .eq('status', 'paid')
    .not('user_id', 'is', null)
  if (error) throw new Error(error.message)

  const result = new Map<string, PledgeConciergeTier>()
  for (const row of (data ?? []) as PaidOrderRow[]) {
    if (!row.user_id) continue
    for (const item of row.items ?? []) {
      const tierId = item.tierId
      if (tierId === 'elegant' || tierId === 'signature') {
        // Signature outranks Elegant if a couple has both.
        const current = result.get(row.user_id)
        if (!current || (current === 'elegant' && tierId === 'signature')) {
          result.set(row.user_id, tierId)
        }
      }
    }
  }
  return result
}

/** Defense-in-depth re-check for a single couple, used by the detail console
 *  before any mutation — never trust the list page's membership alone. */
export async function getCoupleTier(userId: string): Promise<PledgeConciergeTier | null> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('invitation_orders')
    .select('items')
    .eq('status', 'paid')
    .eq('user_id', userId)
  if (error) throw new Error(error.message)

  let best: PledgeConciergeTier | null = null
  for (const row of (data ?? []) as { items: OrderItemRow[] | null }[]) {
    for (const item of row.items ?? []) {
      const tierId = item.tierId
      if (tierId === 'elegant' || tierId === 'signature') {
        if (!best || (best === 'elegant' && tierId === 'signature')) best = tierId
      }
    }
  }
  return best
}

export function isEligibleTier(tier: string | null | undefined): tier is PledgeConciergeTier {
  return Boolean(tier) && ELIGIBLE_TIERS.has(tier as PledgeConciergeTier)
}
