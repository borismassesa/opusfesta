import type { PackagesContent } from './packages'

// Pure pricing helpers, kept in a sibling module free of `next/headers` so they
// can be imported by client components (e.g. ProductDetailClient). Importing
// them from `packages.ts` would pull its server-only `next/headers` dependency
// into the client bundle and break the build. See `loadPackagesContent`.

/**
 * Lowest per-guest package price across all tiers — the "From TZS X per guest"
 * anchor shown on catalog cards and the detail page's similar-designs footer.
 * Admin-editable (it reads from the same `tiers` the packages CMS controls),
 * unlike the retired per-card `digitalUnitPrice`. Returns 0 if no priced tier.
 */
export function packageFromPrice(packages: PackagesContent): number {
  const prices = packages.tiers
    .map((t) => t.price_per_guest)
    .filter((n) => Number.isFinite(n) && n > 0)
  return prices.length ? Math.min(...prices) : 0
}
