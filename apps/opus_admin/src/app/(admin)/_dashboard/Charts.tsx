'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartPoint, SegmentPoint } from './queries'

// Three small charts the dashboard can render side-by-side. All use the
// data shapes returned by getDashboardCharts() — no fetching here.
//
// Recharts requires a client boundary (imperative DOM measurements,
// useState inside ResponsiveContainer, etc.) so this whole file is
// 'use client'. The data still comes from the server snapshot — these
// components are pure presentation.

function ChartFrame({
  title,
  hint,
  empty,
  children,
}: {
  title: string
  hint?: string
  empty?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <header className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
        </div>
      </header>
      <div className="h-[260px] w-full">
        {empty ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-gray-400">No data yet</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Trend area chart — used for time-series like "Inquiries by week" or
// "Vendor signups by week". Single series, gradient fill, minimal axes.
// ---------------------------------------------------------------------------

export function TrendAreaChart({
  title,
  hint,
  data,
  color = '#10b981',
}: {
  title: string
  hint?: string
  data: ChartPoint[]
  color?: string
}) {
  const empty = data.every((d) => d.value === 0)
  const gradientId = useMemo(
    () => `grad-${title.replace(/\s+/g, '-').toLowerCase()}`,
    [title],
  )

  return (
    <ChartFrame title={title} hint={hint} empty={empty}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={28}
          />
          <Tooltip
            cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 12,
              padding: '6px 8px',
            }}
            labelStyle={{ color: '#6b7280', fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

// ---------------------------------------------------------------------------
// Vertical bar chart — used for "Vendor signups by week". Takes up the
// same footprint as the area chart so they layout side-by-side cleanly.
// ---------------------------------------------------------------------------

export function TrendBarChart({
  title,
  hint,
  data,
  color = '#0ea5e9',
}: {
  title: string
  hint?: string
  data: ChartPoint[]
  color?: string
}) {
  const empty = data.every((d) => d.value === 0)
  return (
    <ChartFrame title={title} hint={hint} empty={empty}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 12,
              padding: '6px 8px',
            }}
            labelStyle={{ color: '#6b7280', fontWeight: 600 }}
          />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}

// ---------------------------------------------------------------------------
// Donut chart — used for categorical mixes like "Vendor pipeline" and
// "Team by department". Includes a custom legend on the right so the
// segments stay readable when there are several small slices.
// ---------------------------------------------------------------------------

export function SegmentDonut({
  title,
  hint,
  data,
}: {
  title: string
  hint?: string
  data: SegmentPoint[]
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const empty = total === 0

  return (
    <ChartFrame title={title} hint={hint} empty={empty}>
      <div className="flex h-full items-center gap-4">
        <div className="relative h-full w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={56}
                outerRadius={84}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((seg, i) => (
                  <Cell key={i} fill={seg.color ?? '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e5e7eb',
                  fontSize: 12,
                  padding: '6px 8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums text-gray-900">
              {total}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              total
            </span>
          </div>
        </div>
        <ul className="flex-1 space-y-2 overflow-y-auto pr-1 text-xs">
          {data.slice(0, 6).map((seg) => {
            const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0
            return (
              <li key={seg.label} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color ?? '#94a3b8' }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-gray-700">{seg.label}</span>
                <span className="shrink-0 tabular-nums text-gray-500">
                  {seg.value}
                  <span className="ml-1 text-[10px] text-gray-400">{pct}%</span>
                </span>
              </li>
            )
          })}
          {data.length > 6 && (
            <li className="text-[11px] text-gray-400">
              +{data.length - 6} more
            </li>
          )}
        </ul>
      </div>
    </ChartFrame>
  )
}
