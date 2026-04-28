'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { LeadSource } from '@/lib/mock-data'

export function LeadSourceChart({ data }: { data: LeadSource[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const top = [...data].sort((a, b) => b.value - a.value)[0]
  const topPct = Math.round((top.value / total) * 100)

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-[15px] font-medium text-gray-900">Where leads come from</h3>
        <p className="text-xs text-gray-500 mt-1">Share of inquiries by source — last 90 days</p>
      </div>

      <div className="flex-1 flex items-center gap-6">
        <div className="relative w-[180px] h-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={56}
                outerRadius={84}
                stroke="white"
                strokeWidth={2}
                paddingAngle={1}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  fontSize: 12,
                }}
                formatter={(value) => [`${value}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-semibold text-gray-900 tabular-nums leading-none">
              {topPct}%
            </span>
            <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mt-1">
              {top.name}
            </span>
          </div>
        </div>

        <ul className="flex-1 min-w-0 space-y-2.5 text-sm">
          {[...data]
            .sort((a, b) => b.value - a.value)
            .map((d) => (
              <li key={d.name} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="flex-1 min-w-0 truncate text-gray-700">{d.name}</span>
                <span className="text-gray-900 font-semibold tabular-nums">{d.value}%</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
