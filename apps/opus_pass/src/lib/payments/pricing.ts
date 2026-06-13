import 'server-only'
import { loadPackagesContent } from '@/lib/cms/packages'
import type { InitiateItem } from './types'

// Authoritative amount calculation. The browser sends each line's `total`, but
// a malicious client can edit localStorage to pay less — so we NEVER charge the
// client's number. Where a line carries the package structure (tierId + guests),
// we recompute the core charge from the CMS-controlled per-guest price and use
// THAT as the amount. Non-guest extras (prints/swag) are accepted as sent but
// floored at 0. Lines with no package structure fall back to the client total
// (these are flagged so we can monitor/tighten later).
//
// Mirrors CartProvider.MIN_GUESTS — the product page won't let guests go below
// this, so the server enforces the same floor.
const MIN_GUESTS = 100

export type PricedItem = InitiateItem & { total: number }

export type PricingResult = {
  items: PricedItem[]
  subtotal: number
  discount: number
  amountTotal: number
  currency: string
  /** False if any line couldn't be authoritatively recomputed from the CMS. */
  fullyTrusted: boolean
  /** Lines whose client total disagreed with the recomputed amount. */
  adjustments: Array<{ id: string; clientTotal: number; serverTotal: number }>
}

export async function priceOrder(items: InitiateItem[]): Promise<PricingResult> {
  const packages = await loadPackagesContent()
  const tierPrice = new Map(packages.tiers.map((t) => [t.id, t.price_per_guest]))

  const adjustments: PricingResult['adjustments'] = []
  let fullyTrusted = true

  const priced: PricedItem[] = items.map((item) => {
    const authPerGuest = item.tierId ? tierPrice.get(item.tierId) : undefined
    const clientTotal = Math.max(0, Math.round(Number(item.total) || 0))

    // Recompute only when we have a known tier AND a guest count.
    if (authPerGuest != null && item.guests != null) {
      const guests = Math.max(MIN_GUESTS, Math.floor(item.guests))
      const extras = Math.max(0, Math.round(Number(item.extrasTotal) || 0))
      const serverTotal = authPerGuest * guests + extras
      if (serverTotal !== clientTotal) {
        adjustments.push({ id: item.id, clientTotal, serverTotal })
      }
      return { ...item, guests, pricePerGuest: authPerGuest, total: serverTotal }
    }

    // No package structure — can't independently verify; trust the line total
    // but mark the order as not fully trusted for monitoring.
    fullyTrusted = false
    return { ...item, total: clientTotal }
  })

  const subtotal = priced.reduce((sum, i) => sum + i.total, 0)
  // Digital product — no discount path today (kept for parity with the cart).
  const discount = 0
  return {
    items: priced,
    subtotal,
    discount,
    amountTotal: subtotal - discount,
    currency: 'TZS',
    fullyTrusted,
    adjustments,
  }
}
