import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  trend: string
  isPositive?: boolean
  sub?: string
}

// Detect direction from the trend string when not given explicitly. We can't
// just look at the leading sign — for "Avg response time" a "−22m" delta is
// actually a *good* thing, so the mock data passes `isPositive` to override.
function detectDirection(trend: string): 'up' | 'down' | 'flat' {
  const t = trend.trim()
  if (t.startsWith('+') || t.startsWith('↑')) return 'up'
  if (t.startsWith('−') || t.startsWith('-') || t.startsWith('↓')) return 'down'
  return 'flat'
}

export function StatCard({ title, value, trend, isPositive, sub }: StatCardProps) {
  const direction = detectDirection(trend)
  const positive = isPositive ?? direction === 'up'
  const Icon = direction === 'down' ? TrendingDown : TrendingUp

  return (
    <div className="bg-white px-5 py-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full h-full flex flex-col gap-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
        {title}
      </p>
      <p className="text-3xl lg:text-[32px] font-semibold text-gray-900 tabular-nums tracking-tight leading-none">
        {value}
      </p>
      <div className="flex items-center gap-2 mt-auto">
        {direction !== 'flat' ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-md',
              positive
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700',
            )}
          >
            <Icon className="w-3 h-3" />
            {trend.replace(/^[+−\-↑↓]\s*/, '')}
          </span>
        ) : null}
        {sub ? (
          <span className="text-[11px] text-gray-500 font-medium truncate">{sub}</span>
        ) : null}
      </div>
    </div>
  )
}
