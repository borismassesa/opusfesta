import { initials } from '../_lib/format'
import { cn } from '@/lib/utils'

export default function Avatar({
  name,
  color,
  size = 'md',
  className,
}: {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizes = {
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-12 w-12 text-sm',
  }
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold tracking-wide text-gray-800',
        sizes[size],
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {initials(name)}
    </span>
  )
}
