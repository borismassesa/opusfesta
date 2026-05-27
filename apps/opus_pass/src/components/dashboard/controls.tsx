'use client'

import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-[#C9A0DC] text-[#1A1A1A] hover:bg-[#b97fd0] disabled:opacity-50',
  secondary: 'bg-white text-[#1A1A1A] ring-1 ring-inset ring-black/[0.12] hover:bg-black/[0.03]',
  ghost: 'text-[#1A1A1A]/70 hover:bg-black/[0.05]',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50',
}

export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
          <h3 className="text-base font-semibold text-[#1A1A1A]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/[0.05]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#1A1A1A]/80">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-[#1A1A1A]/45">{hint}</span> : null}
    </label>
  )
}

export const inputClass =
  'w-full rounded-xl border border-black/[0.12] bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-[#1A1A1A]/35 focus:border-[#C9A0DC] focus:ring-2 focus:ring-[#C9A0DC]/30'
