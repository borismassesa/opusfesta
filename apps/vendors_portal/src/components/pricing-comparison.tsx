import { CheckCircle2, Circle } from 'lucide-react'
import { loadPricingComparisonContent } from '@/lib/cms/pricing-comparison'
import { getFeatureIcon } from '@/lib/cms/pricing-comparison-icons'

export default async function PricingComparison() {
  const content = await loadPricingComparisonContent()
  const checklist = content.checklist.slice(0, 4)

  return (
    <section className="bg-[var(--accent)] py-14 sm:py-20 md:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Top: headline + product preview */}
        <div className="flex flex-col md:flex-row items-center gap-10 sm:gap-12 md:gap-16 mb-12 sm:mb-16">

          {/* Left — text */}
          <div className="flex-1 w-full text-center md:text-left">
            <h2 className="text-4xl md:text-6xl lg:text-[80px] font-black tracking-tighter uppercase leading-[1.05] md:leading-[0.9] mb-6 text-[var(--on-accent)]">
              {content.headline_line_1}
              <br />
              {content.headline_line_2}
            </h2>
            <p className="text-lg text-[var(--on-accent)]/60 max-w-md mx-auto md:mx-0 font-medium leading-relaxed">
              {content.subheadline}
            </p>
            <div className="hidden sm:block mt-8">
              <a
                href={content.cta_href}
                className="inline-block bg-[#1A1A1A] hover:bg-[#333333] text-white px-8 py-4 rounded-full font-bold transition-colors"
              >
                {content.cta_label}
              </a>
            </div>
          </div>

          {/* Right — bento grid */}
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 h-[280px] md:h-[380px]">

            {/* Tall couple photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.couple_image_url}
              alt="Happy couple"
              className="row-span-2 w-full h-full object-cover rounded-2xl"
            />

            {/* Top-right — promo card */}
            <div className="rounded-2xl flex flex-col justify-end gap-2 px-5 pb-5 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${content.promo_image_url}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <p className="relative text-white text-xl sm:text-3xl font-black tracking-tighter leading-tight">
                {content.promo_heading_line_1}
                <br />
                {content.promo_heading_line_2}
              </p>
              <p className="relative text-white text-[11px] font-semibold leading-relaxed">
                {content.promo_subheading}
              </p>
            </div>

            {/* Bottom-right — mini checklist UI */}
            <div className="bg-[#1A1A1A] rounded-2xl flex flex-col justify-center gap-2 px-4 py-4 overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-widest text-white mb-1">
                {content.checklist_label}
              </p>
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  {item.done
                    ? <CheckCircle2 size={13} className="text-white shrink-0" />
                    : <Circle size={13} className="text-white/40 shrink-0" />
                  }
                  <p className={`text-[11px] font-semibold truncate ${item.done ? 'line-through text-white/20' : 'text-white'}`}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Bottom — feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-[var(--on-accent)]/15 pt-16">
          {content.features.map((f) => {
            const Icon = getFeatureIcon(f.icon)
            return (
              <div key={f.id} className="flex flex-col gap-4">
                <Icon size={28} className="text-[var(--on-accent)]" />
                <div>
                  <h3 className="text-[var(--on-accent)] font-black text-lg uppercase tracking-tight mb-2">{f.title}</h3>
                  <p className="text-[var(--on-accent)]/60 text-sm font-medium leading-relaxed">{f.body}</p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
