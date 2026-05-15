import { cn } from '@/lib/utils'

type Tone = 'green' | 'amber' | 'rose' | 'purple' | 'blue' | 'gray'

// Soft-background pill — no indicator dot, no all-caps. Quiet metadata
// styling so pills don't compete with the row data itself.
const TONE_CLASSES: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  purple: 'bg-gray-100 text-gray-700',
  blue: 'bg-[#E5F2FB] text-[#1F5D8C]',
  gray: 'bg-gray-100 text-gray-600',
}

export default function StatusPill({
  tone,
  label,
  className,
}: {
  tone: Tone
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {label}
    </span>
  )
}
