import type { VendorLocation } from '@/types/vendor';

/**
 * Collapses a vendor's structured location into a single display address.
 * Prefers an explicit `address`; otherwise joins the non-empty street/area/
 * city/region parts. Returns null when nothing usable is present.
 */
export function formatAddress(location: VendorLocation | null | undefined): string | null {
  if (!location) return null;
  if (typeof location.address === 'string' && location.address.trim()) return location.address;
  const parts = [location.street, location.ward || location.district, location.city, location.region].filter(
    (p) => typeof p === 'string' && p.trim(),
  );
  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * Normalizes a user-entered link/handle into an openable URL. Absolute URLs
 * pass through; with a `base` (e.g. an Instagram/Facebook profile prefix) the
 * value is treated as a handle (leading `@` stripped); otherwise it's assumed
 * to be a bare domain and gets an `https://` scheme.
 */
export function toUrl(value: string, base?: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  if (base) return `${base}${value.replace(/^@/, '')}`;
  return `https://${value}`;
}
