'use client'

import { useEffect, useState } from 'react'
import { readLocale, writeLocale, onLocaleChange, type Locale } from '@/lib/locale'

const LOCALES: Locale[] = ['en', 'sw']
const SHORT_LABEL: Record<Locale, string> = { en: 'EN', sw: 'SW' }

/**
 * Same segmented-pill pattern as apps/opus_pass's LocaleToggle component
 * (rounded pill, active = dark bg/white text, inactive = gray text) —
 * mechanism differs because this app has no server-rendered locale-
 * dependent content: opus_pass writes a cookie and calls router.refresh()
 * to re-render server components; this just writes localStorage and
 * broadcasts a same-tab event so already-mounted screens update live.
 */
export default function LocaleToggle({ className = '' }: { className?: string }) {
  const [locale, setLocale] = useState<Locale>('en')
  useEffect(() => {
    setLocale(readLocale())
    return onLocaleChange(setLocale)
  }, [])

  function choose(next: Locale) {
    writeLocale(next)
    setLocale(next)
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex items-center rounded-full border border-gray-200 bg-white p-0.5 text-xs font-semibold ${className}`}
    >
      {LOCALES.map((l) => {
        const isActive = l === locale
        return (
          <button
            key={l}
            type="button"
            onClick={() => choose(l)}
            aria-pressed={isActive}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              isActive ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {SHORT_LABEL[l]}
          </button>
        )
      })}
    </div>
  )
}
