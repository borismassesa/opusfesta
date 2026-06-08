import Link from 'next/link'
import { Star } from 'lucide-react'
import {
  loadHomepageTestimonialsContent,
  type HomepageTestimonialItem,
  type HomepageTestimonialsContent,
} from '@/lib/cms/homepage-testimonials'
import { assetPath } from '@/lib/asset-path'

// Match the testimonial card design from /websites — dark/purple alternating
// cards with a divider line, sans-serif quote and a role pill on the right.
// Variant is derived from the card's column index so cards alternate visually.
function TestimonialCard({ t, index }: { t: HomepageTestimonialItem; index: number }) {
  const isDark = index % 2 === 0
  return (
    <div
      className={`rounded-2xl p-6 lg:p-7 flex flex-col shadow-sm ${
        isDark ? 'bg-[#1A1A1A] text-white' : 'bg-[var(--accent)] text-[#1A1A1A]'
      }`}
    >
      {/* Stars */}
      <div className="flex items-center gap-0.5 text-amber-400 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={16} className="fill-current" strokeWidth={0} />
        ))}
      </div>

      {/* Quote */}
      <p className="text-[15px] lg:text-base font-semibold leading-snug flex-1">
        “{t.quote}”
      </p>

      {/* Divider */}
      <div className={`mt-5 h-px ${isDark ? 'bg-white/15' : 'bg-black/15'}`} />

      {/* Footer: avatar + name + location + role pill */}
      <div className="mt-4 flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetPath(t.avatar)} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight truncate">{t.name}</p>
          <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-white/55' : 'text-[#1A1A1A]/60'}`}>
            {t.location}
          </p>
        </div>
        <span
          className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold ${
            isDark
              ? 'bg-[var(--accent)] text-[var(--on-accent)]'
              : 'bg-white text-[#1A1A1A]'
          }`}
        >
          Couple
        </span>
      </div>
    </div>
  )
}

function VerticalMarquee({ items, reverse = false }: { items: HomepageTestimonialItem[]; reverse?: boolean }) {
  // Stamp each testimonial with its original index BEFORE tripling so the same
  // testimonial keeps its variant across marquee loop repeats.
  const stamped = items.map((t, idx) => ({ t, idx }))
  const tripled = [...stamped, ...stamped, ...stamped]
  return (
    <div className="relative h-full overflow-hidden">
      <div
        className="flex flex-col gap-4 lg:gap-6 animate-marquee-vertical"
        style={reverse ? { animationDirection: 'reverse' } : undefined}
      >
        {tripled.map(({ t, idx }, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} index={idx} />
        ))}
      </div>
    </div>
  )
}

export async function InvitationShowcase({
  content: contentProp,
}: {
  content?: HomepageTestimonialsContent
} = {}) {
  // Most pages share the homepage testimonial wall; the Guests & RSVPs page
  // passes its own CMS-managed content so it can be edited independently.
  const content = contentProp ?? (await loadHomepageTestimonialsContent())
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
