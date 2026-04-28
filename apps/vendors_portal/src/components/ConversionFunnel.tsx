'use client'

import { TrendingDown } from 'lucide-react'
import type { FunnelStage } from '@/lib/mock-data'

export function ConversionFunnel({ stages }: { stages: FunnelStage[] }) {
  if (stages.length === 0) return null
  const top = stages[0].value

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full h-full flex flex-col">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-medium text-gray-900">Conversion funnel</h3>
          <p className="text-xs text-gray-500 mt-1">
            How leads move from inquiry to booked — last 90 days
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
          {Math.round((stages[stages.length - 1].value / top) * 100)}% end-to-end
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-3">
        {stages.map((stage, i) => {
          const pct = Math.round((stage.value / top) * 100)
          const prev = i > 0 ? stages[i - 1].value : null
          const dropoff = prev !== null ? prev - stage.value : null
          const dropPct = prev !== null && prev > 0 ? Math.round((dropoff! / prev) * 100) : null

          return (
            <div key={stage.name} className="flex items-center gap-3">
              <span className="w-20 text-xs font-semibold text-gray-700 shrink-0">
                {stage.name}
              </span>
              <div className="flex-1 h-9 bg-gray-50 rounded-lg relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-[width] duration-500"
                  style={{ width: `${pct}%`, backgroundColor: stage.color }}
                  aria-hidden
                />
                <div className="relative z-10 h-full flex items-center justify-between px-3">
                  <span className="text-xs font-bold text-gray-900 tabular-nums">
                    {stage.value.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-700 tabular-nums">
                    {pct}%
                  </span>
                </div>
              </div>
              <span className="w-20 text-right shrink-0">
                {dropoff !== null ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 tabular-nums">
                    <TrendingDown className="w-3 h-3" />−{dropoff} ({dropPct}%)
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-400 font-medium">baseline</span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
