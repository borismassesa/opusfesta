'use client'

import { Check } from 'lucide-react'
import type { ReadinessItem } from '@/lib/contribute/validateReadiness'
import { cn } from '@/lib/utils'

export default function ReadinessCard({
  items,
  missingCount,
  shaking,
}: {
  items: ReadinessItem[]
  missingCount: number
  shaking: boolean
}) {
  return (
    <section
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-3.5 max-sm:sticky max-sm:bottom-3 max-sm:z-20 max-sm:shadow-lg',
        shaking && 'animate-[contributor-shake_400ms_ease-in-out]'
      )}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-gray-500">Ready to submit</p>
      <ul aria-label="Submission requirements" className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            role="listitem"
            aria-checked={item.passed}
            className="flex items-center gap-3 text-sm font-medium text-gray-950"
          >
            <span
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                item.passed
                  ? 'border-[#E1F5EE] bg-[#E1F5EE] text-[#085041]'
                  : 'border-gray-300 bg-gray-50 text-transparent'
              )}
            >
              <Check className="h-3 w-3" />
            </span>
            <span className={cn(item.passed && 'text-gray-500 line-through')}>{item.label}</span>
          </li>
        ))}
      </ul>
      <p
        className={cn(
          'mt-5 border-t border-gray-200 pt-3 text-xs font-medium',
          missingCount === 0 ? 'text-[#085041]' : 'text-gray-500'
        )}
      >
        {missingCount === 0
          ? 'Ready when you are'
          : `${missingCount} ${missingCount === 1 ? 'thing' : 'things'} needed before you can submit`}
      </p>
    </section>
  )
}
