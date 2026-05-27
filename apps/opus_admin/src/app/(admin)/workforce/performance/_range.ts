// Calendar-aligned period math for the performance pages, anchored to EAT
// (OpusFesta is in Tanzania). "This week" starts Monday; "This month" the
// 1st; "This quarter" the first day of the calendar quarter. Each window
// runs from that start through end-of-today (period-to-date).

export const PERF_TZ = 'Africa/Dar_es_Salaam'

export type PerfPeriod = 'week' | 'month' | 'quarter'

export const PERF_PERIODS: { value: PerfPeriod; label: string }[] = [
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
]

export function parsePeriod(value: string | undefined): PerfPeriod {
  return value === 'week' || value === 'quarter' ? value : 'month'
}

function dateInTz(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PERF_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

function weekdayMonday0(d: Date): number {
  const wd = new Intl.DateTimeFormat('en-US', { timeZone: PERF_TZ, weekday: 'short' }).format(d)
  const map: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }
  return map[wd] ?? 0
}

export type PerfWindow = {
  period: PerfPeriod
  label: string // "This week" / "This month" / "This quarter"
  rangeLabel: string // e.g. "1–26 May 2026"
  startDate: string // YYYY-MM-DD, inclusive
  endDate: string // today, YYYY-MM-DD
  startIso: string // start-of-day, EAT
  endExclusiveIso: string // start of tomorrow, EAT
}

export function performanceWindow(period: PerfPeriod = 'month'): PerfWindow {
  const now = new Date()
  const today = dateInTz(now)
  const [y, m] = today.split('-').map(Number)
  const todayMidnightEat = new Date(`${today}T00:00:00+03:00`)

  let startDate: string
  if (period === 'week') {
    const since = weekdayMonday0(now)
    startDate = dateInTz(new Date(todayMidnightEat.getTime() - since * 86_400_000))
  } else if (period === 'quarter') {
    const qStartMonth = Math.floor((m - 1) / 3) * 3 + 1 // 1,4,7,10
    startDate = `${y}-${String(qStartMonth).padStart(2, '0')}-01`
  } else {
    startDate = `${y}-${String(m).padStart(2, '0')}-01`
  }

  const tomorrow = dateInTz(new Date(todayMidnightEat.getTime() + 86_400_000))
  const label = PERF_PERIODS.find((p) => p.value === period)?.label ?? 'This month'

  const fmt = (ymd: string) => {
    const [yy, mm, dd] = ymd.split('-').map(Number)
    return new Date(yy, mm - 1, dd).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return {
    period,
    label,
    rangeLabel: `${fmt(startDate)} – ${fmt(today)}`,
    startDate,
    endDate: today,
    startIso: `${startDate}T00:00:00+03:00`,
    endExclusiveIso: `${tomorrow}T00:00:00+03:00`,
  }
}

export function formatHours(minutes: number): string {
  const h = minutes / 60
  return h >= 10 ? h.toFixed(0) : h.toFixed(1)
}
