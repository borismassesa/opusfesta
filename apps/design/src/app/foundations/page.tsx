import Link from 'next/link'
import { ArrowRight, Palette, Type, Ruler, CircleDot, Layers, Zap, Sparkles } from 'lucide-react'
import { Kicker } from '@/components/Kicker'

const areas = [
  { label: 'Colour',       href: '/foundations/color',       icon: Palette,   desc: 'Ink, lavender, neutrals, 26-colour category palette.' },
  { label: 'Typography',   href: '/foundations/typography',  icon: Type,      desc: 'Inter, 400–900. UPPERCASE display, medium body.' },
  { label: 'Spacing',      href: '/foundations/spacing',     icon: Ruler,     desc: '4-pixel grid. Generous air. Breathing sections.' },
  { label: 'Radius',       href: '/foundations/radius',      icon: CircleDot, desc: 'Soft corners. Pills for actions, 2xl/3xl for cards.' },
  { label: 'Elevation',    href: '/foundations/elevation',   icon: Layers,    desc: 'Long, low-opacity shadows. Never hard offsets.' },
  { label: 'Motion',       href: '/foundations/motion',      icon: Zap,       desc: 'One easing. Fade + rise together. Respect reduce.' },
  { label: 'Iconography',  href: '/foundations/iconography', icon: Sparkles,  desc: 'Lucide only. Stroke 2 default, 2.5 directional.' },
]

export default function FoundationsIndex() {
  return (
    <>
      <Kicker>Foundations</Kicker>
      <h1 className="display text-4xl md:text-6xl lg:text-[72px] leading-[0.9]">
        The ingredients
        <br />
        everything is made of.
      </h1>
      <p className="mt-8 text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
        Foundations are data-driven — they read directly from{' '}
        <code className="mono text-[0.88em] bg-gray-100 rounded-md px-1.5 py-0.5">
          apps/design/tokens.json
        </code>
        . Edit the token, the doc updates itself.
      </p>

      <div className="mt-12 grid sm:grid-cols-2 gap-3">
        {areas.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group rounded-3xl border border-gray-100 shadow-sm p-7 flex flex-col justify-between min-h-[180px] hover:-translate-y-0.5 transition-transform bg-white"
          >
            <div>
              <a.icon size={22} className="text-[var(--accent)]" />
              <p className="mt-4 font-black text-xl text-ink">{a.label}</p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{a.desc}</p>
            </div>
            <span className="inline-flex items-center gap-2 mt-6 font-bold text-sm text-ink group-hover:gap-3 transition-all">
              Open <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}
