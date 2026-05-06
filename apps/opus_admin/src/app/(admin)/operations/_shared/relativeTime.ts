// OF-ADM-EDITORIAL-001 — short relative-time formatter shared across editorial
// admin tabs. Output is intentionally compact (`2d ago`, `1h ago`) because
// table meta lines get cramped quickly when middot-separated.

export function formatRelativeTime(input: string | Date): string {
  const then =
    typeof input === 'string' ? new Date(input).getTime() : input.getTime()
  if (!Number.isFinite(then)) return ''
  const ms = Date.now() - then
  if (ms < 0) {
    // Future-dated (scheduled). Caller should branch on this and render
    // "goes live …" instead — but we still return something reasonable.
    return formatRelativeFuture(-ms)
  }
  if (ms < 60_000) return 'just now'
  const min = Math.round(ms / 60_000)
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 14) return `${day}d ago`
  const week = Math.round(day / 7)
  if (week < 8) return `${week}w ago`
  const month = Math.round(day / 30)
  if (month < 18) return `${month}mo ago`
  const year = Math.round(day / 365)
  return `${year}y ago`
}

export function formatDaysOldest(iso: string | null | undefined): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return null
  return Math.max(0, Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000)))
}

function formatRelativeFuture(ms: number): string {
  const min = Math.round(ms / 60_000)
  if (min < 60) return `in ${min}m`
  const hr = Math.round(min / 60)
  if (hr < 24) return `in ${hr}h`
  const day = Math.round(hr / 24)
  return `in ${day}d`
}
