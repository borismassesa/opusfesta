// Ported from apps/opus_pass/src/lib/dashboard/currency.ts's toTzs/TZS_PER_UNIT
// — there's no shared package wiring this currency helper across opus_admin
// and opus_pass yet, so this is a deliberate small duplication (see tier.ts
// for the same pattern with cardTier resolution). Keep these rates in sync
// with the source file if they ever change.

/** Static, manually-maintained TZS exchange rates — there's no live FX
 *  provider wired up. TZS is the canonical unit pledge totals are
 *  aggregated in, so it's always 1. */
const TZS_PER_UNIT: Record<string, number> = {
  TZS: 1,
  USD: 2600,
  KES: 20,
  EUR: 2850,
}

/** Convert an amount in the given currency to its TZS equivalent, for
 *  aggregating pledges across currencies into one total. Unknown/blank
 *  currencies fall back to a 1:1 rate rather than throwing, since
 *  `currency` is stored as a free-form string on the pledge record. */
export function toTzs(amount: number, currency: string): number {
  const rate = TZS_PER_UNIT[currency.trim().toUpperCase()] ?? 1
  return amount * rate
}
