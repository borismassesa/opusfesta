// Pure date/time utilities for the time-clock module. Lives outside
// queries.ts so client components (TimesheetsClient) can import it
// without dragging `server-only` into the browser bundle.

import type { TimePunch, TimeDaySummary } from './types'

// Group a flat punch list into per-day summaries in the given timezone.
// Open shifts (last 'in' with no matching 'out' on that day) contribute
// 0 to workedMinutes — callers can add the live "since" interval if they
// want a running total. Days with zero punches are not emitted.
export function summarizePunchesByDay(
  punches: TimePunch[],
  timeZone: string,
): TimeDaySummary[] {
  if (punches.length === 0) return []
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const groups = new Map<string, TimePunch[]>()
  for (const p of punches) {
    const day = fmt.format(new Date(p.punchAt))
    const arr = groups.get(day)
    if (arr) arr.push(p)
    else groups.set(day, [p])
  }

  const out: TimeDaySummary[] = []
  for (const [day, dayPunches] of groups) {
    let workedMs = 0
    let openInIso: string | null = null
    let lastOutIso: string | null = null
    let firstInIso: string | null = null
    for (const p of dayPunches) {
      if (p.type === 'in') {
        if (firstInIso === null) firstInIso = p.punchAt
        openInIso = p.punchAt
      } else {
        if (openInIso) {
          workedMs += new Date(p.punchAt).getTime() - new Date(openInIso).getTime()
          openInIso = null
        }
        lastOutIso = p.punchAt
      }
    }
    out.push({
      date: day,
      punches: dayPunches,
      firstInIso,
      lastOutIso,
      workedMinutes: Math.max(0, Math.round(workedMs / 60000)),
      openShift: openInIso !== null,
    })
  }
  return out.sort((a, b) => a.date.localeCompare(b.date))
}
