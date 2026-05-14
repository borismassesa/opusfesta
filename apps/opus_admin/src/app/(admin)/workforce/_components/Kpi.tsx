import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type KpiProps = {
  label: string
  value: string
  delta?: string
  deltaTone?: 'positive' | 'negative' | 'neutral'
  hint?: string
  icon?: ReactNode
}

export default function Kpi({ label, value, delta, deltaTone = 'positive', hint, icon }: KpiProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[13px] font-medium text-gray-500">{label}</div>
        {icon && (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#F0DFF6] text-[#7E5896]">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-gray-900">{value}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        {delta && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-semibold',
              deltaTone === 'positive' && 'bg-emerald-50 text-emerald-700',
              deltaTone === 'negative' && 'bg-rose-50 text-rose-700',
              deltaTone === 'neutral' && 'bg-gray-100 text-gray-600',
            )}
          >
            {delta}
          </span>
        )}
        {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
      </div>
    </div>
  )
}

export function KpiRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
  )
}
