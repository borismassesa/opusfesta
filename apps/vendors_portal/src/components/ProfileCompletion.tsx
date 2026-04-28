import Link from 'next/link'
import { Info } from 'lucide-react'
import type { CompletionSection } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function ProfileCompletion({ sections }: { sections: CompletionSection[] }) {
  const done = sections.filter((s) => s.done).length
  const total = sections.length
  const remaining = total - done
  const isComplete = remaining === 0

  return (
    <div className="bg-white p-6 lg:p-8 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] w-full">
      <div className="flex items-start gap-3.5">
        <div className="w-7 h-7 rounded-full border-2 border-amber-500 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 tracking-tight leading-snug">
            {isComplete
              ? 'Storefront complete — nice work!'
              : `${remaining} section${remaining === 1 ? '' : 's'} needed before you can publish. Keep going!`}
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            To learn more about storefronts, please refer to{' '}
            <Link href="/help" className="font-semibold text-gray-900 underline underline-offset-2">
              How to create a great storefront
            </Link>{' '}
            or{' '}
            <Link href="/help" className="font-semibold text-gray-900 underline underline-offset-2">
              Contact us
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mt-6 lg:mt-8">
        <div className="flex items-center gap-1.5">
          {sections.map((s) => (
            <span
              key={s.id}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                s.done ? 'bg-emerald-600' : 'bg-gray-200',
              )}
              aria-label={`${s.label} ${s.done ? 'complete' : 'incomplete'}`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-700 mt-2.5">
          {done}/{total} required sections completed
        </p>
      </div>

      {!isComplete ? (
        <Link
          href="/storefront"
          className="mt-6 inline-flex items-center justify-center bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
        >
          Complete storefront
        </Link>
      ) : null}
    </div>
  )
}
