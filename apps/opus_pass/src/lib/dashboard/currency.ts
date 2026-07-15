/** Currencies offered in the pledge form's Currency dropdown. */
export const PLEDGE_CURRENCIES = ['TZS', 'USD', 'KES', 'EUR'] as const
export type PledgeCurrency = (typeof PLEDGE_CURRENCIES)[number]

/** Static, manually-maintained TZS exchange rates — there's no live FX
 *  provider wired up. Update periodically as rates drift. TZS is the
 *  canonical unit pledge totals are aggregated in, so it's always 1. */
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
