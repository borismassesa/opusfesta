'use client'

import Reveal from '@/components/ui/Reveal'
import { useLang } from '@/context/LanguageContext'

export default function Problem() {
  const { t } = useLang()

  return (
    <div className="bg-brand-gray py-16 sm:py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal direction="up">
          <div className="mb-10 sm:mb-14 md:mb-16 text-center md:text-left">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 sm:mb-5">
              {t.problem.badge}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-gray-900 mb-5 sm:mb-6 leading-tight">
              {t.problem.heading1}<br />
              <span className="italic text-brand-purple">{t.problem.heading2}</span>
            </h2>
            <p className="text-gray-500 max-w-2xl text-[14px] sm:text-[15px] leading-relaxed mx-auto md:mx-0">
              {t.problem.body}
            </p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.15}>
          <div className="bg-white border border-gray-100 rounded-sm shadow-sm">
            {t.problem.items.map((item, i) => (
              <div
                key={item.num}
                className={`p-6 sm:p-8 md:p-10 flex flex-col sm:flex-row gap-5 sm:gap-10 ${i !== 0 ? 'border-t border-gray-100' : ''}`}
              >
                <span className="text-gray-200 font-serif text-xl italic w-8 shrink-0">{item.num}</span>
                <div>
                  <h3 className="text-gray-900 font-medium mb-2 text-[15px]">{item.title}</h3>
                  <p className="text-gray-500 text-[14px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  )
}
