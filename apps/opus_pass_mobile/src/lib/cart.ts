import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem } from '@/types/cart';

/**
 * On-device cart, same structured item shape as the web's
 * `opuspass.cart.v2` localStorage cart (see CartProvider.tsx). The two carts
 * are not synced yet — this is the app's own copy.
 */
const STORAGE_KEY = '@opusfesta/opuspass-cart-v2';

/** Minimum guest count — matches the web product page and configurator. */
export const MIN_GUESTS = 50;
export const GUEST_STEP = 10;

export function formatTzs(amount: number) {
  return `TZS ${amount.toLocaleString('en-US')}`;
}

/**
 * Canonical line summary, e.g. "Signature · 120 guests · On-site attendant".
 * Single source for the string so it can be rebuilt whenever the structured
 * fields change (the cart lets shoppers edit the guest count).
 */
export function buildItemSummary(parts: {
  tier?: string;
  guests?: number;
  addOns?: string[];
}): string {
  return [
    parts.tier,
    parts.guests != null ? `${parts.guests.toLocaleString('en-US')} guests` : null,
    ...(parts.addOns ?? []),
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Re-price a line after a guest-count edit, mirroring the web's `setGuests`. */
export function withGuestCount(item: CartItem, guests: number): CartItem {
  const next = Math.max(MIN_GUESTS, Math.round(guests) || MIN_GUESTS);
  // Prefer the stored breakdown; derive it for older lines that lack one.
  const perGuest =
    item.pricePerGuest ?? (item.guests ? Math.round(item.total / item.guests) : 0);
  const extras = item.extrasTotal ?? 0;
  return {
    ...item,
    guests: next,
    total: Math.round(perGuest * next + extras),
    // The summary is a denormalised snapshot — rebuild it so it never shows a
    // stale guest count.
    summary: buildItemSummary({ tier: item.tier, guests: next, addOns: item.addOns }),
  };
}

export async function readCart(): Promise<CartItem[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as CartItem[];
  } catch {
    // Corrupt payload — start clean rather than wedging the cart screen.
    return [];
  }
}

export async function writeCart(items: CartItem[]): Promise<CartItem[]> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
}
