'use client'

import { useLang } from '@/context/LanguageContext'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full px-1 py-1 shadow-sm">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all ${
          lang === 'en'
            ? 'bg-gray-900 text-white'
            : 'text-gray-400 hover:text-gray-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('sw')}
        className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all ${
          lang === 'sw'
            ? 'bg-gray-900 text-white'
            : 'text-gray-400 hover:text-gray-700'
        }`}
      >
        SW
      </button>
    </div>
  )
}
