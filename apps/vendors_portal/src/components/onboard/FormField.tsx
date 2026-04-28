'use client'

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/utils'

export function FieldLabel({
  children,
  required,
}: {
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="block text-sm font-semibold text-gray-900 mb-2">
      {children}
      {required ? <span className="text-rose-600 ml-0.5">*</span> : null}
    </label>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  prefix?: ReactNode
  error?: string | null
}

export function TextInput({ className, prefix, error, ...rest }: InputProps) {
  return (
    <div>
      <div
        className={cn(
          'flex items-center bg-white rounded-lg border transition-colors',
          error
            ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500'
            : 'border-gray-300 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900',
          className,
        )}
      >
        {prefix ? (
          <span className="pl-4 text-gray-500 text-base shrink-0 select-none">{prefix}</span>
        ) : null}
        <input
          {...rest}
          aria-invalid={Boolean(error) || undefined}
          className="w-full bg-transparent px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none rounded-lg"
        />
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-600">{error}</p> : null}
    </div>
  )
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hint?: ReactNode
  error?: string | null
}

export function TextArea({ className, hint, error, rows = 5, ...rest }: TextAreaProps) {
  return (
    <div>
      <textarea
        {...rest}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          'w-full bg-white rounded-lg border px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 outline-none resize-y transition-colors',
          error
            ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
            : 'border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900',
          className,
        )}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  )
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  placeholder?: string
  children: ReactNode
  error?: string | null
}

export function SelectInput({ placeholder, children, value, error, ...rest }: SelectProps) {
  return (
    <div>
      <div className="relative">
        <select
          {...rest}
          value={value}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            'appearance-none w-full bg-white rounded-lg border',
            'px-4 py-3 pr-10 text-base text-gray-900 outline-none transition-colors',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900',
            !value && 'text-gray-400',
          )}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {children}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          ▾
        </span>
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-600">{error}</p> : null}
    </div>
  )
}
