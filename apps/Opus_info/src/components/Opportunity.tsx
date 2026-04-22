'use client'

import Reveal from '@/components/ui/Reveal'
import { Infinity as InfinityIcon } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'

export default function Opportunity() {
  const { t } = useLang()

  return (
    <div className="bg-brand-gray py-16 sm:py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal direction="up" className="mb-10 sm:mb-14 md:mb-16 text-center">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 sm:mb-5">
            {t.opportunity.badge}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mb-5 sm:mb-6 leading-tight">
            {t.opportunity.heading1}<br />
            <span className="italic text-brand-purple">{t.opportunity.heading2}</span>
          </h2>
          <div className="w-12 h-0.5 bg-brand-purple mx-auto mb-6 sm:mb-8" />
          <p className="text-gray-500 max-w-2xl mx-auto text-[14px] sm:text-[15px] leading-relaxed">
            {t.opportunity.body}
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
            {t.opportunity.stats.map((item, i) => (
              <div key={i} className="bg-white p-7 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center min-h-[180px] sm:min-h-[200px] md:min-h-[240px]">
                <div className="text-4xl sm:text-5xl font-serif text-brand-purple mb-4 sm:mb-6 h-10 sm:h-12 flex items-center justify-center">
                  {item.stat === null
                    ? <InfinityIcon className="w-10 h-10 text-brand-purple" strokeWidth={1} />
                    : item.stat
                  }
                </div>
                <p className="text-[13px] text-gray-500 leading-relaxed max-w-[200px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  )
}
