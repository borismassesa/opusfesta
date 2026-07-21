/**
 * Mirrors `CartItem` in apps/opus_pass/src/components/providers/CartProvider.tsx
 * so a line configured in the app carries the same fields the web cart stores.
 * The web's `treatment` (CSS-drawn fallback artwork) has no app equivalent —
 * every product here renders its uploaded image — so it is left out.
 */
export interface CartItem {
  /** Product id — one line per design; re-adding the same design replaces it. */
  id: string;
  name: string;
  designer: string | null;
  /** Hero image (else first uploaded design) — the cart thumbnail. */
  image?: string;
  /** Short config summary, e.g. "Signature · 120 guests · On-site attendant". */
  summary: string;
  /** Structured config, so the cart can render a breakdown and re-price edits. */
  tier?: string;
  /** Tier id (lite/classic/elegant/signature) — drives the package pill colour. */
  tierId?: string;
  guests?: number;
  /** Per-guest tier price (TZS) — lets the cart recompute when guests change. */
  pricePerGuest?: number;
  /** Non-guest-scaling extras already included in `total` (flat-fee add-ons). */
  extrasTotal?: number;
  addOns?: string[];
  /** Line total in TZS. */
  total: number;
}
