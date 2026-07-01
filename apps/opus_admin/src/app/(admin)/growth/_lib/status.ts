// Pure helpers shared across the Growth Tracker's dashboard + KPI grids.
// Mirrors the spreadsheet's IF formula exactly: >=100% Met, >=60% On Track,
// else Behind.

export type GrowthStatus = 'met' | 'on_track' | 'behind' | null

export function computeStatus(actual: number | null, target: number): GrowthStatus {
  if (actual === null || !Number.isFinite(target) || target === 0) return null
  const pct = actual / target
  if (pct >= 1) return 'met'
  if (pct >= 0.6) return 'on_track'
  return 'behind'
}

export function computePercent(actual: number | null, target: number): number | null {
  if (actual === null || !Number.isFinite(target) || target === 0) return null
  return actual / target
}

export const STATUS_LABEL: Record<Exclude<GrowthStatus, null>, string> = {
  met: '✓ Met',
  on_track: '~ On Track',
  behind: '✗ Behind',
}

export function formatUnit(value: number | null, unit: string): string {
  if (value === null) return '—'
  switch (unit) {
    case 'tzs':
      return `TZS ${Math.round(value).toLocaleString('en-US')}`
    case 'percent':
      return `${(value * 100).toFixed(1)}%`
    case 'rating':
      return `${value.toFixed(1)} / 5.0`
    case 'days':
      return `${value} days`
    default:
      return value.toLocaleString('en-US')
  }
}
