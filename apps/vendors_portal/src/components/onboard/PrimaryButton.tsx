import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export function PrimaryButton({ className, children, disabled, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-semibold transition-colors',
        disabled
          ? 'bg-gray-300 text-white cursor-not-allowed'
          : 'bg-gray-900 text-white hover:bg-gray-800',
        className,
      )}
    >
      {children}
    </button>
  )
}
