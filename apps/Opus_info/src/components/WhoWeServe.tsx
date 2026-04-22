'use client'

import Reveal from '@/components/ui/Reveal'
import { useLang } from '@/context/LanguageContext'

export default function WhoWeServe() {
  const { t } = useLang()

  return (
    <div className="bg-brand-gray py-16 sm:py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal direction="up" className="mb-10 sm:mb-14 md:mb-16 text-center md:text-left">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 sm:mb-5">
            {t.whoWeServe.badge}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mb-5 sm:mb-6 leading-tight">
            {t.whoWeServe.heading1}<br />
            <span className="italic text-brand-purple">{t.whoWeServe.heading2}</span>
          </h2>
          <div className="w-12 h-0.5 bg-brand-purple mb-6 sm:mb-8 mx-auto md:mx-0" />
          <p className="text-gray-500 max-w-2xl text-[14px] sm:text-[15px] leading-relaxed mx-auto md:mx-0">
            {t.whoWeServe.body}
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-2 shadow-sm border border-gray-100">

            {/* Couples — dark */}
            <div className="bg-[#1a112c] text-white p-8 sm:p-10 md:p-14 lg:p-16 flex flex-col justify-center">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-5 sm:mb-6">
                {t.whoWeServe.couplesLabel}
              </p>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-7 sm:mb-10 leading-tight">
                {t.whoWeServe.couplesHeading1}<br />{t.whoWeServe.couplesHeading2}
              </h3>
              <ul className="space-y-4 sm:space-y-5">
                {t.whoWeServe.coupleFeatures.map((text, i) => (
                  <li key={i} className="flex gap-3 sm:gap-4 text-[14px] text-gray-300 items-start">
                    <span className="text-brand-purple mt-1.5 text-[8px] shrink-0">●</span>
                    <span className="leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vendors — light */}
            <div className="bg-white p-8 sm:p-10 md:p-14 lg:p-16 flex flex-col justify-center">
              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-5 sm:mb-6">
                {t.whoWeServe.vendorsLabel}
              </p>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 mb-7 sm:mb-10 leading-tight">
                {t.whoWeServe.vendorsHeading1}<br />{t.whoWeServe.vendorsHeading2}
              </h3>
              <ul className="space-y-4 sm:space-y-5">
                {t.whoWeServe.vendorFeatures.map((text, i) => (
                  <li key={i} className="flex gap-3 sm:gap-4 text-[14px] text-gray-500 items-start">
                    <span className="text-brand-purple mt-1.5 text-[8px] shrink-0">●</span>
                    <span className="leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </Reveal>
      </div>
    </div>
  )
}
