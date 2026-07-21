import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Mirrors apps/opus_pass/src/lib/cms/packages-pricing.ts `packageFromPrice()`.
 *
 * Every product card on the real web storefront shows the SAME anchor price —
 * the minimum `price_per_guest` across the wedding package tiers — not each
 * product's own `digital_unit_price` (that field is only checked for
 * presence, its value is never displayed; see
 * apps/opus_pass/src/components/guests/productInfo.tsx).
 *
 * Row key: page_key='opus-pass-packages', section_key='wedding-tiers'.
 */
export async function getFromGuestPrice(
  client: SupabaseClient
): Promise<number> {
  const { data, error } = await client
    .from('website_page_sections')
    .select('content')
    .eq('page_key', 'opus-pass-packages')
    .eq('section_key', 'wedding-tiers')
    .maybeSingle();
  if (error) throw error;

  const tiers =
    (data?.content as { tiers?: { price_per_guest?: number }[] } | null)
      ?.tiers ?? [];
  const prices = tiers
    .map((t) => t.price_per_guest)
    .filter(
      (n): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0
    );

  return prices.length > 0 ? Math.min(...prices) : 0;
}
