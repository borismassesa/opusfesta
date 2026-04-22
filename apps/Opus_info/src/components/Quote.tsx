'use client'

import Reveal from '@/components/ui/Reveal'
import { Quote as QuoteIcon } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

export default function Quote() {
  const { t } = useLang()

  return (
    <div className="bg-white py-20 sm:py-28 md:py-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal direction="up">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-7 sm:mb-10">
            <QuoteIcon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-purple" fill="currentColor" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif mb-7 sm:mb-10 leading-tight italic">
            <span className="text-gray-900">{t.quote.line1}</span><br />
            <span className="text-brand-purple">{t.quote.line2}</span>
          </h2>

          <p className="text-gray-500 max-w-2xl mx-auto text-[14px] sm:text-[15px] leading-relaxed">
            {t.quote.body}
          </p>
        </Reveal>
      </div>
    </div>
  )
}
