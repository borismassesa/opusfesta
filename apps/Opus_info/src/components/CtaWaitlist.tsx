'use client'

import { ArrowRight } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

export default function CtaWaitlist() {
  const { t } = useLang()

  return (
    <div id="waitlist" className="relative py-20 sm:py-28 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 opacity-90" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-purple-300 rounded-full blur-[120px] opacity-20" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-900/5 p-7 sm:p-10 md:p-14 lg:p-16 border border-white">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 sm:mb-5">
            {t.cta.badge}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mb-5 sm:mb-6 leading-tight">
            {t.cta.heading1}<br />
            {t.cta.heading2} <span className="italic text-brand-purple">{t.cta.heading3}</span>
          </h2>
          <p className="text-gray-500 mb-7 sm:mb-10 max-w-lg mx-auto text-[14px] sm:text-[15px] leading-relaxed">
            {t.cta.body}
          </p>

          <form
            className="flex flex-col gap-3 max-w-md mx-auto sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder={t.cta.placeholder}
              className="flex-1 w-full px-4 sm:px-5 py-3.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple text-[14px] sm:text-[15px] transition-all bg-white"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-brand-purple hover:bg-brand-purple-dark text-white px-6 sm:px-8 py-3.5 rounded-lg text-[14px] sm:text-[15px] font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-brand-purple/20"
            >
              {t.cta.button} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
