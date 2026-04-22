import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Kicker } from '@/components/Kicker'

const list = [
  { label: 'Button',      href: '/components/button', desc: 'Every action is a pill. Three levels — accent, ink, outline.' },
  { label: 'Pill & Badge', href: '/components/pill',   desc: 'Rounded-full status markers, feature chips, role tags.' },
  { label: 'Card',         href: '/components/card',   desc: 'Soft, layered, never flat. Base / feature / dark.' },
  { label: 'Input',        href: '/components/input',  desc: 'Visible bordered containers with inline labels.' },
]

export default function ComponentsIndex() {
  return (
    <>
      <Kicker>Components</Kicker>
      <h1 className="display text-4xl md:text-6xl lg:text-[72px] leading-[0.9]">
        The primitives
        <br />
        we ship.
      </h1>
      <p className="mt-8 text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
        Each component documents live examples, when to use it, do&apos;s and don&apos;ts, and
        accessibility notes. Content lives in MDX — open a PR to update.
      </p>

      <div className="mt-12 grid sm:grid-cols-2 gap-3">
        {list.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-3xl border border-gray-100 shadow-sm p-7 bg-white flex flex-col justify-between min-h-[160px] hover:-translate-y-0.5 transition-transform"
          >
            <div>
              <p className="font-black text-xl text-ink">{c.label}</p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{c.desc}</p>
            </div>
            <span className="inline-flex items-center gap-2 mt-6 font-bold text-sm text-ink group-hover:gap-3 transition-all">
              Open <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-16 mb-4 text-ink">
        Not yet documented
      </h2>
      <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
        Navbar · Mega-menu · Accordion · Testimonial · Stat card · Row item · Carousel · Dot
        indicator · Avatar · Toast · Dialog · Tabs. Add them under{' '}
        <code className="mono text-[0.88em] bg-gray-100 rounded px-1.5 py-0.5">
          apps/design/src/app/components/
        </code>{' '}
        as{' '}
        <code className="mono text-[0.88em] bg-gray-100 rounded px-1.5 py-0.5">
          [name]/page.mdx
        </code>{' '}
        and register them in{' '}
        <code className="mono text-[0.88em] bg-gray-100 rounded px-1.5 py-0.5">
          src/content/nav.ts
        </code>
        .
      </p>
    </>
  )
}
