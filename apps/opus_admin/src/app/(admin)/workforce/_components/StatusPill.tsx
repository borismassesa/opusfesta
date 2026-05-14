import { cn } from '@/lib/utils'

type Tone = 'green' | 'amber' | 'rose' | 'purple' | 'blue' | 'gray'

const TONE_CLASSES: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  purple: 'bg-[#F0DFF6] text-[#7E5896]',
  blue: 'bg-[#E5F2FB] text-[#1F5D8C]',
  gray: 'bg-gray-100 text-gray-700',
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
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {label}
    </span>
  )
}
