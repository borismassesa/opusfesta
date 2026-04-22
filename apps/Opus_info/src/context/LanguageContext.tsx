'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { translations } from '@/lib/i18n'
import { mergeTranslations } from '@/lib/content'
import type { Lang } from '@/lib/i18n'

type LanguageContextType = {
  lang: Lang
  t: typeof translations.en
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [merged, setMerged] = useState(translations)

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((overrides) => setMerged(mergeTranslations(overrides)))
      .catch(() => {}) // fall back to defaults silently
  }, [])

  // Cast needed because `as const` makes en/sw literal types incompatible in a union
  const t = merged[lang] as typeof translations.en

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
