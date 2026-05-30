'use client'

import { Card } from '@/components/dashboard/primitives'

// Lightweight, dependency-free charts (pure SVG / CSS) for the reports view.

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <Card className="px-5 py-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-[#1A1A1A]/50">{subtitle}</p> : null}
      </div>
      {children}
    </Card>
  )
}

/** Horizontal bar list — good for "by method", "by group", aging, etc. */
export function BarRows({
  rows,
  accent = '#C9A0DC',
  format,
}: {
  rows: { label: string; value: number; note?: string; color?: string }[]
  accent?: string
  format: (n: number) => string
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  if (rows.length === 0) return <p className="text-sm text-[#1A1A1A]/45">No data yet.</p>
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-[#1A1A1A]/70">{r.label}</span>
            <span className="shrink-0 tabular-nums font-medium text-[#1A1A1A]">
              {format(r.value)}
              {r.note ? <span className="font-normal text-[#1A1A1A]/45"> · {r.note}</span> : null}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.color ?? accent }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Decreasing-bar funnel — Invited → Pledged → Partly paid → Fully paid. */
export function Funnel({ stages }: { stages: { label: string; value: number; color?: string }[] }) {
  const top = Math.max(1, stages[0]?.value ?? 0)
  return (
    <div className="space-y-2.5">
      {stages.map((s) => {
        const pct = Math.round((s.value / top) * 100)
        return (
          <div key={s.label}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="text-[#1A1A1A]/70">{s.label}</span>
              <span className="tabular-nums font-medium text-[#1A1A1A]">
                {s.value} <span className="font-normal text-[#1A1A1A]/45">· {pct}%</span>
              </span>
            </div>
            <div className="h-7 w-full overflow-hidden rounded-lg bg-black/[0.04]">
              <div
                className="flex h-full items-center rounded-lg transition-all"
                style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: s.color ?? '#C9A0DC' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** SVG donut for categorical distribution, with a legend. */
export function Donut({
  slices,
  centerValue,
  centerLabel,
}: {
  slices: { label: string; value: number; color: string }[]
  centerValue: string
  centerLabel: string
}) {
  const total = slices.reduce((n, s) => n + s.value, 0)
  let cumulative = 0
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 36 36" className="h-full w-full">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#00000010" strokeWidth="3.6" />
          {total > 0
            ? slices.map((s) => {
                const pct = (s.value / total) * 100
                const el = (
                  <circle
                    key={s.label}
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="3.6"
                    strokeDasharray={`${pct} ${100 - pct}`}
                    strokeDashoffset={25 - cumulative}
                    strokeLinecap="butt"
                  />
                )
                cumulative += pct
                return el
              })
            : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold leading-none text-[#1A1A1A]">{centerValue}</span>
          <span className="mt-0.5 text-[10px] uppercase tracking-wide text-[#1A1A1A]/45">{centerLabel}</span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="flex-1 truncate text-[#1A1A1A]/70">{s.label}</span>
            <span className="shrink-0 tabular-nums font-medium text-[#1A1A1A]">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Clean line graph with gridlines and data-point dots. */
export function LineChart({
  points,
  color = '#8e57b3',
  format,
}: {
  points: { label: string; value: number }[]
  color?: string
  format: (n: number) => string
}) {
  if (points.length < 2) {
    return <p className="py-6 text-center text-sm text-[#1A1A1A]/45">Not enough activity yet to chart a trend.</p>
  }
  const max = Math.max(1, ...points.map((p) => p.value))
  const n = points.length
  const xPct = (i: number) => (i / (n - 1)) * 100
  const yPct = (v: number) => (1 - v / max) * 100
  const line = points.map((p, i) => `${xPct(i).toFixed(2)},${yPct(p.value).toFixed(2)}`).join(' ')
  const last = points[n - 1]

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-lg font-semibold text-[#1A1A1A]">{format(last.value)}</span>
        <span className="text-xs text-[#1A1A1A]/45">cumulative</span>
      </div>
      <div className="flex gap-2">
        {/* y-axis labels */}
        <div className="flex w-10 flex-col justify-between py-0.5 text-right text-[10px] tabular-nums text-[#1A1A1A]/40">
          <span>{format(max)}</span>
          <span>{format(max / 2)}</span>
          <span>0</span>
        </div>
        <div className="relative h-40 flex-1">
          {/* gridlines */}
          {[0, 25, 50, 75, 100].map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-dashed border-black/[0.07]" style={{ top: `${t}%` }} />
          ))}
          {/* line */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <polyline
              points={line}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {/* dots (HTML so they stay round) */}
          {points.map((p, i) => (
            <span
              key={i}
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
              style={{ left: `${xPct(i)}%`, top: `${yPct(p.value)}%`, backgroundColor: color }}
              title={`${p.label}: ${format(p.value)}`}
            />
          ))}
        </div>
      </div>
      <div className="mt-1 flex justify-between pl-12 text-[10px] text-[#1A1A1A]/40">
        <span>{points[0].label}</span>
        <span>{last.label}</span>
      </div>
    </div>
  )
}

/** Cumulative area/line trend over time. */
export function TrendArea({
  points,
  color = '#8e57b3',
  format,
}: {
  points: { label: string; value: number }[]
  color?: string
  format: (n: number) => string
}) {
  if (points.length < 2) {
    return <p className="py-6 text-center text-sm text-[#1A1A1A]/45">Not enough activity yet to chart a trend.</p>
  }
  const max = Math.max(1, ...points.map((p) => p.value))
  const n = points.length
  const x = (i: number) => (i / (n - 1)) * 100
  const y = (v: number) => 100 - (v / max) * 100
  const line = points.map((p, i) => `${x(i).toFixed(2)},${y(p.value).toFixed(2)}`).join(' ')
  const area = `0,100 ${line} 100,100`
  const last = points[n - 1]
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-lg font-semibold text-[#1A1A1A]">{format(last.value)}</span>
        <span className="text-xs text-[#1A1A1A]/45">cumulative</span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-36 w-full">
        <polygon points={area} fill={color} fillOpacity="0.12" />
        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-[#1A1A1A]/40">
        <span>{points[0].label}</span>
        <span>{last.label}</span>
      </div>
    </div>
  )
}
