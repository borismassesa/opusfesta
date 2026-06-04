'use client'

import { useRef, type ClipboardEvent, type KeyboardEvent } from 'react'

// Segmented one-time-code input — one box per digit, with auto-advance,
// backspace-to-previous, arrow nav, and paste-fill. Fully controlled: the
// parent owns the string `value`; we only ever emit digits, capped at
// `length`. `onComplete` fires once the final digit lands.

export default function CodeBoxes({
  value,
  onChange,
  length = 6,
  autoFocus = false,
  disabled = false,
  onComplete,
}: {
  value: string
  onChange: (next: string) => void
  length?: number
  autoFocus?: boolean
  disabled?: boolean
  onComplete?: (code: string) => void
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = value.replace(/\D/g, '').slice(0, length)

  const focusBox = (i: number) => {
    const idx = Math.max(0, Math.min(length - 1, i))
    const el = refs.current[idx]
    el?.focus()
    el?.select()
  }

  const commit = (next: string): string => {
    const clean = next.replace(/\D/g, '').slice(0, length)
    onChange(clean)
    if (clean.length === length) onComplete?.(clean)
    return clean
  }

  const handleInput = (i: number, raw: string) => {
    const typed = raw.replace(/\D/g, '')
    if (!typed) return
    const arr = digits.padEnd(length, ' ').split('')
    let pos = i
    for (const ch of typed) {
      if (pos >= length) break
      arr[pos] = ch
      pos += 1
    }
    commit(arr.join('').replace(/ /g, ''))
    focusBox(Math.min(pos, length - 1))
  }

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const arr = digits.padEnd(length, ' ').split('')
      if (arr[i] && arr[i] !== ' ') {
        arr[i] = ' '
        commit(arr.join('').replace(/ /g, ''))
      } else if (i > 0) {
        arr[i - 1] = ' '
        commit(arr.join('').replace(/ /g, ''))
        focusBox(i - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusBox(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusBox(i + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = commit(pasted)
    focusBox(Math.min(next.length, length - 1))
  }

  return (
    <div
      className="flex items-center justify-between gap-2 sm:gap-2.5"
      role="group"
      aria-label="Verification code"
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          value={digits[i] ?? ''}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${i + 1}`}
          className="h-12 w-full min-w-0 rounded-lg border border-gray-300 bg-white text-center text-lg font-semibold text-[#1A1A1A] outline-none transition focus:border-[#C9A0DC] focus:ring-2 focus:ring-[#C9A0DC]/25 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14"
        />
      ))}
    </div>
  )
}
