// OF-ADM-EDITORIAL-001 — generic empty state used across editorial tabs.
// Centered icon + heading + subtitle with an optional action slot for
// "Clear filters" / "+ New article" / etc.

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export default function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: ReactNode
  title: string
  body?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-14 text-center',
        className
      )}
    >
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F0DFF6] text-[#7E5896]">
        {icon}
      </span>
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      {body && <p className="mt-1 max-w-md text-sm text-gray-500">{body}</p>}
      {action && <div className="mt-4 flex items-center gap-2">{action}</div>}
    </div>
  )
}
