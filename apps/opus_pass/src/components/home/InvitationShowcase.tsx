import Link from 'next/link'
import { Star } from 'lucide-react'
import {
  loadHomepageTestimonialsContent,
  type HomepageTestimonialItem,
} from '@/lib/cms/homepage-testimonials'

function TestimonialCard({ t }: { t: HomepageTestimonialItem }) {
  const isDark = t.fg === 'dark'
  const quoteColor = isDark ? 'text-white' : 'text-gray-900'
  const nameColor = isDark ? 'text-white' : 'text-gray-900'
  const locationColor = isDark ? 'text-white/70' : 'text-gray-600'
  const ringColor = isDark ? 'ring-white/10' : 'ring-black/5'
  return (
    <div className={`rounded-2xl p-6 lg:p-7 flex flex-col gap-4 shadow-sm ring-1 ${ringColor} ${t.bg}`}>
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className="fill-current" strokeWidth={0} />
        ))}
      </div>
      <p className={`font-serif text-[15px] lg:text-base leading-relaxed ${quoteColor}`}>
        “{t.quote}”
      </p>
      <div className="mt-1 flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.avatar} alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className={`text-sm font-semibold leading-tight ${nameColor}`}>{t.name}</p>
          <p className={`text-xs mt-0.5 ${locationColor}`}>{t.location}</p>
        </div>
      </div>
    </div>
  )
}

function VerticalMarquee({ items, reverse = false }: { items: HomepageTestimonialItem[]; reverse?: boolean }) {
  const tripled = [...items, ...items, ...items]
  return (
    <div className="relative h-full overflow-hidden">
      <div
        className="flex flex-col gap-4 lg:gap-6 animate-marquee-vertical"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {tripled.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  )
}

export async function InvitationShowcase() {
  const content = await loadHomepageTestimonialsContent()
  return (
    <div className="py-10 lg:py-12 w-full">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="lg:pr-8 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-5 leading-tight">
              {content.headline}
            </h2>
            <p className="text-base lg:text-lg text-gray-600 mb-7 leading-relaxed max-w-md">
              {content.description}
            </p>
            <Link
              href={content.cta_href}
              className="font-semibold text-gray-900 hover:text-gray-600 underline underline-offset-4 decoration-2 decoration-gray-900 inline-flex items-center gap-1 group transition-colors w-fit"
            >
              {content.cta_label}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div
            className="grid grid-cols-2 gap-4 lg:gap-6 h-[420px] lg:h-[480px]"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, #000 3%, #000 97%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 3%, #000 97%, transparent 100%)',
            }}
          >
            <VerticalMarquee items={content.column1} />
            <VerticalMarquee items={content.column2} reverse />
          </div>
        </div>
      </div>
    </div>
  )
}
