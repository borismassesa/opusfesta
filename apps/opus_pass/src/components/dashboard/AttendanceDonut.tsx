/**
 * Shared attendance/response ring used across the couple dashboard — the
 * overview "Response progress" card, the RSVP management per-event cards, and
 * the RSVP responses tracker. One component so all three stay consistent.
 *
 * Pass the segments (in ring order); the ring is drawn proportionally to their
 * sum, with a center value/label (e.g. an invited count or a response rate).
 */

export interface DonutSegment {
  label: string
  value: number
  color: string
}

export function AttendanceDonut({
  segments,
  centerValue,
  centerLabel,
  legendMinWidth = 150,
}: {
  segments: DonutSegment[]
  centerValue: number | string
  centerLabel: string
  legendMinWidth?: number
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const r = 52
  const c = 2 * Math.PI * r
  const arc = (n: number) => (total > 0 ? (n / total) * c : 0)
  let offset = 0

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#e9e4ee" strokeWidth="12" />
          {total > 0 &&
            segments.map((s) => {
              const len = arc(s.value)
              const el = (
                <circle
                  key={s.label}
                  cx="64"
                  cy="64"
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="12"
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                />
              )
              offset += len
              return el
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-[#1A1A1A]">{centerValue}</span>
          <span className="text-[10px] uppercase tracking-wide text-[#1A1A1A]/50">{centerLabel}</span>
        </div>
      </div>
      <ul className="space-y-1.5 text-sm" style={{ minWidth: legendMinWidth }}>
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[#1A1A1A]/60">{s.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-[#1A1A1A]">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AttendanceDonut
