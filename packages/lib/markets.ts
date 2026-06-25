// Canonical Tanzania service-market catalogue, shared across the vendors
// portal (onboarding + storefront), the public marketplace (opus_website), and
// the admin review tools (opus_admin). Vendors pick a home market + additional
// markets by `id`; every surface resolves those ids to `name` for display.
//
// This is the single source of truth. Do not re-declare these rows in an app —
// import from '@opusfesta/lib'. Keeping them in three places previously meant a
// renamed label silently disagreed between onboarding, the public page, and
// admin.

export type ServiceMarket = {
  id: string;
  name: string;
  hint: string;
};

export const SERVICE_MARKETS: ServiceMarket[] = [
  { id: 'dar', name: 'Dar es Salaam', hint: 'City + Pwani coast' },
  { id: 'zanzibar', name: 'Zanzibar', hint: 'Unguja + Pemba' },
  { id: 'arusha', name: 'Arusha & Kilimanjaro', hint: 'Northern circuit' },
  { id: 'mwanza', name: 'Mwanza & Lake Zone', hint: 'Mwanza, Mara, Kagera' },
  { id: 'dodoma', name: 'Dodoma & Central', hint: 'Dodoma, Singida, Manyara' },
  { id: 'mbeya', name: 'Mbeya & Southern Highlands', hint: 'Mbeya, Iringa, Njombe' },
  { id: 'south', name: 'Southern Coast', hint: 'Lindi, Mtwara, Ruvuma' },
  { id: 'morogoro', name: 'Morogoro & Tanga', hint: 'Eastern interior' },
];

const MARKET_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  SERVICE_MARKETS.map((m) => [m.id, m.name]),
);

/** Resolve a market id ("dodoma") to its display label ("Dodoma & Central").
 * Returns the raw id unchanged when it isn't a known market. */
export function marketLabel(id: string): string {
  return MARKET_NAME_BY_ID[id] ?? id;
}
