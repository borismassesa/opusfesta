import { cn } from '@/lib/utils'

type Tone = 'green' | 'amber' | 'rose' | 'purple' | 'blue' | 'gray'

// Dotted indicator + soft background. The previous all-caps, bold, wide-
// tracked treatment was visually shouty and competed with the row data
// itself; quieter pills keep status as supporting metadata rather than
// the loudest element on the row.
const TONE_CLASSES: Record<Tone, { bg: string; text: string; dot: string }> = {
  green: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  purple: { bg: 'bg-[#F0DFF6]', text: 'text-[#7E5896]', dot: 'bg-[#C9A0DC]' },
  blue: { bg: 'bg-[#E5F2FB]', text: 'text-[#1F5D8C]', dot: 'bg-[#4A92C8]' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
}

export default function StatusPill({
  tone,
  label,
  dot = true,
  className,
}: {
  tone: Tone
  label: string
  dot?: boolean
  className?: string
}) {
  const t = TONE_CLASSES[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        t.bg,
        t.text,
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', t.dot)} />}
      {label}
    </span>
  )
}
