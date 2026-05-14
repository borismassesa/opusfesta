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
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] font-medium text-gray-500">{label}</div>
        {icon && (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0DFF6] text-[#7E5896]">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-gray-900">
        {value}
      </div>
      {(delta || hint) && (
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          {delta && (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-1.5 py-0.5 font-semibold',
                deltaTone === 'positive' && 'bg-emerald-50 text-emerald-700',
                deltaTone === 'negative' && 'bg-rose-50 text-rose-700',
                deltaTone === 'neutral' && 'bg-gray-100 text-gray-600',
              )}
            >
              {delta}
            </span>
          )}
          {hint && <span className="text-gray-400">{hint}</span>}
        </div>
      )}
    </div>
  )
}

export function KpiRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
  )
}
