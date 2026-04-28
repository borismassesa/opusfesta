// Curated palette that blends with the lavender anchor.
//
// Lavender stays the primary brand expression (selected tabs, icons, hero
// avatars, primary chart series). The other families add warmth and contrast
// without competing — pick one of them for any "second" colour on a card or
// chart, and reach for a soft variant for badge/pill backgrounds.
//
// Usage rule of thumb: pair lavender with one warm (champagne/rose) and one
// cool (sage/periwinkle) on any single surface — never all four at once.

export const LAVENDER = {
  /** primary text-on-pale-lavender, deep CTAs, anchor chart series */
  deep: '#7E5896',
  /** secondary chart series, progress fills, badge fg */
  base: '#C9A0DC',
  /** badge/pill backgrounds, soft icon avatars */
  pale: '#F0DFF6',
  /** card tint (use sparingly — flagged as "gradient lavender") */
  wash: '#FCF7FF',
}

/** Brand emerald — the Emerald Principle. Use for booking/success states. */
export const SAGE = {
  deep: '#3F8B5C',
  base: '#9FE870',
  pale: '#E8FBDB',
}

/** Warm champagne — pairs with lavender for an elegant wedding feel. */
export const CHAMPAGNE = {
  deep: '#B07F2C',
  base: '#F5C77E',
  pale: '#FCE9C2',
}

/** Cool periwinkle — analogous to lavender, useful for muted secondary data. */
export const PERIWINKLE = {
  deep: '#3F6B82',
  base: '#7BA7BC',
  pale: '#DDE9EE',
}

/** Warm dusty rose — soft accent for hover/empty states. */
export const ROSE = {
  deep: '#A84F66',
  base: '#E89AAE',
  pale: '#F5DCE2',
}

/**
 * Default ordering for multi-series charts (pie slices, stacked bars).
 * Lavender leads, sage punches in second, champagne and periwinkle round it
 * out so the eye moves around the chart instead of locking on one hue.
 */
export const SERIES_PALETTE = [
  LAVENDER.deep,
  SAGE.base,
  CHAMPAGNE.base,
  PERIWINKLE.base,
  LAVENDER.base,
  ROSE.base,
] as const
