'use client'

import { cn } from '@/lib/utils'
import { readingTimeLabel } from '@/lib/contribute/bodyMetrics'

export default function StatusFooter({
  wordCount,
  saveState,
}: {
  wordCount: number
  saveState: 'saved' | 'saving' | 'failed'
}) {
  const dot =
    saveState === 'failed' ? 'bg-red-500' : saveState === 'saving' ? 'bg-amber-500' : 'bg-emerald-500'
  const label = saveState === 'failed' ? 'Save failed' : saveState === 'saving' ? 'Saving...' : 'Saved'

  return (
    <div className="mt-6 flex h-10 items-center justify-between rounded-lg bg-[#F7F6F1] px-3.5 text-sm text-gray-700">
      <div className="flex items-center gap-4">
        <span>{Math.max(0, wordCount).toLocaleString()} words</span>
        <span className="text-gray-400">·</span>
        <span>{readingTimeLabel(wordCount)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', dot)} />
        <span>{label}</span>
      </div>
    </div>
  )
}
