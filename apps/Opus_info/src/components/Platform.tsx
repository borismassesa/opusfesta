'use client'

import Reveal from '@/components/ui/Reveal'
import { useLang } from '@/context/LanguageContext'

export default function Platform() {
  const { t } = useLang()

  return (
    <div id="platform" className="bg-white py-16 sm:py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal direction="up" className="mb-10 sm:mb-14 md:mb-16 text-center md:text-left">
          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 sm:mb-5">
            {t.platform.badge}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mb-5 sm:mb-6 leading-tight">
            {t.platform.heading1}<br />
            <span className="italic text-brand-purple">{t.platform.heading2}</span>
          </h2>
          <p className="text-gray-500 max-w-2xl text-[14px] sm:text-[15px] leading-relaxed mx-auto md:mx-0">
            {t.platform.body}
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-l border-t border-gray-100">
            {t.platform.items.map((item, i) => (
              <div
                key={i}
                className="p-6 sm:p-8 md:p-10 border-r border-b border-gray-100 hover:bg-gray-50 transition-colors duration-300"
              >
                <span className="text-gray-200 font-serif text-2xl sm:text-3xl italic mb-6 sm:mb-8 block">{item.num}</span>
                <h3 className="text-gray-900 font-medium mb-3 text-[15px]">{item.title}</h3>
                <p className="text-gray-500 text-[14px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  )
}
