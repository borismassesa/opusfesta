// Manual TZS formatters — deterministic across Node + browser ICU
// versions. `Intl.NumberFormat` with locale 'en-TZ' diverges between
// Node and Chrome on compact notation (e.g. "TSh 73M" vs "TSh 73.0M"),
// which causes hydration mismatches when server-rendered values are
// reconciled with the client. By formatting the numeric body ourselves
// and bolting "TSh " on the front we guarantee identical output.

function withThousands(value: number): string {
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(Math.round(value))
  return sign + abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatTzs(value: number): string {
  return `TSh ${withThousands(value)}`
}

export function formatTzsCompact(value: number): string {
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) {
    return `${sign}TSh ${trimZero(abs / 1_000_000_000)}B`
  }
  if (abs >= 1_000_000) {
    return `${sign}TSh ${trimZero(abs / 1_000_000)}M`
  }
  if (abs >= 1_000) {
    return `${sign}TSh ${trimZero(abs / 1_000)}K`
  }
  return `${sign}TSh ${Math.round(abs)}`
}

// One decimal place when meaningful, none when it would just be a
// trailing zero. Stable across runtimes — Intl's "compact" rounding
// rules diverge, so we own this logic.
function trimZero(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1)
}

export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatShortDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

export function tenureLabel(startDate: string, now = new Date()): string {
  const start = new Date(startDate)
  const months = Math.max(
    0,
    (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth()),
  )
  if (months < 1) return 'New'
  if (months < 12) return `${months}mo`
  const years = Math.floor(months / 12)
  const rest = months % 12
  return rest === 0 ? `${years}y` : `${years}y ${rest}mo`
}
