'use client'

import { cn } from '@/lib/utils'
import type { QueueHealth } from '../_lib/types'

export function QueueHealthStrip({ health }: { health: QueueHealth }) {
  // SLA-at-risk colouring follows the spec: emerald when 0, amber when >0,
  // red when >5. The other two metrics are informational and stay neutral.
  const slaTone =
    health.slaAtRisk === 0
      ? 'text-emerald-700'
      : health.slaAtRisk > 5
        ? 'text-rose-700'
        : 'text-amber-700'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
      <Metric label="In queue" value={health.inQueue.toString()} />
      <Metric
        label="Avg review time"
        value={
          health.avgReviewTimeDays > 0
            ? `${health.avgReviewTimeDays.toFixed(1)} ${
                health.avgReviewTimeDays === 1 ? 'day' : 'days'
              }`
            : '—'
        }
      />
      <Metric
        label="SLA at risk"
        value={health.slaAtRisk.toString()}
        valueClassName={slaTone}
      />
    </div>
  )
}

function Metric({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3.5">
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      <p
        className={cn(
          'text-2xl font-medium leading-none tabular-nums',
          valueClassName ?? 'text-gray-900',
        )}
      >
        {value}
      </p>
    </div>
  )
}
