'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type StatusPillVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info'

const VARIANT_CLASSES: Record<StatusPillVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-rose-50 text-rose-700',
  info: 'bg-[#EEEDFE] text-[#5B2D8E]',
  neutral: 'bg-gray-100 text-gray-700',
}

export function StatusPill({
  variant = 'neutral',
  icon,
  children,
}: {
  variant?: StatusPillVariant
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        VARIANT_CLASSES[variant],
      )}
    >
      {icon && <span className="inline-flex w-3 h-3">{icon}</span>}
      {children}
    </span>
  )
}
