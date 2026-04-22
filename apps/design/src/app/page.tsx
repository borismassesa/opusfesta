import Link from 'next/link'
import { Kicker } from '@/components/Kicker'
import { ArrowRight } from 'lucide-react'

const pillars = [
  {
    title: 'Foundations',
    description: 'Colour, type, spacing, radius, elevation, motion, icons.',
    href: '/foundations',
    bg: 'bg-white border border-gray-100 shadow-sm',
    tone: 'text-ink',
    kicker: 'text-gray-400',
  },
  {
    title: 'Components',
    description: 'Button, pill, card, input — the primitives we ship.',
    href: '/components',
    bg: 'bg-[var(--accent)]',
    tone: 'text-[var(--on-accent)]',
    kicker: 'text-[var(--on-accent)]/60',
  },
  {
    title: 'Patterns',
    description: 'How sections come together on a page.',
    href: '/patterns',
    bg: 'bg-[#1A1A1A] text-white',
    tone: 'text-white',
    kicker: 'text-[var(--accent)]',
  },
  {
    title: 'Voice',
    description: 'The words we write — headlines, microcopy, locale cues.',
    href: '/voice',
    bg: 'bg-white border border-gray-100 shadow-sm',
    tone: 'text-ink',
    kicker: 'text-gray-400',
  },
]

export default function Home() {
  return (
    <>
      <Kicker>Design system · v2026.04</Kicker>
      <h1 className="display text-4xl md:text-6xl lg:text-[72px] leading-[0.9]">
        Design at
        <br />
        OpusFesta.
      </h1>
      <p className="mt-8 text-lg md:text-xl text-gray-600 max-w-2xl font-medium leading-relaxed">
        One source of truth for every screen we ship — colour, type, motion, components, and
        voice. Built and maintained by design, engineering, and the whole team.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <span className="pill bg-[var(--accent)] text-[var(--on-accent)] px-5 py-2.5 text-sm">
          Warm modern · Bold display · Soft cards
        </span>
        <span className="pill border border-gray-200 px-5 py-2.5 text-sm text-gray-700 bg-white">
          Canonical: apps/opus_website
        </span>
      </div>

      {/* Pillars */}
      <div className="mt-14 grid sm:grid-cols-2 gap-4">
        {pillars.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className={`group rounded-3xl ${p.bg} ${p.tone} p-8 flex flex-col justify-between min-h-[200px] transition-transform hover:-translate-y-0.5`}
          >
            <div>
              <p className={`kicker ${p.kicker}`}>{p.title}</p>
              <p className="mt-4 text-2xl font-black leading-tight">{p.description}</p>
            </div>
            <span className="inline-flex items-center gap-2 mt-8 font-bold text-sm group-hover:gap-3 transition-all">
              Open <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>

      {/* How we work */}
      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-20 mb-6 text-ink">
        How we work
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-gray-100 shadow-sm p-7">
          <p className="kicker text-gray-400">Own it together</p>
          <p className="mt-3 font-bold text-ink leading-snug">
            Boris, the designer, and the whole team.
          </p>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Anyone can open a PR. Content pages are MDX, foundations read from{' '}
            <Link href="/foundations" className="underline">
              tokens.json
            </Link>
            .
          </p>
        </div>
        <div className="rounded-3xl border border-gray-100 shadow-sm p-7">
          <p className="kicker text-gray-400">Ship small</p>
          <p className="mt-3 font-bold text-ink leading-snug">
            Update the docs in the same PR as the code.
          </p>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            If the component changed, the page changes too. Drift is the enemy.
          </p>
        </div>
        <div className="rounded-3xl border border-gray-100 shadow-sm p-7">
          <p className="kicker text-gray-400">Version everything</p>
          <p className="mt-3 font-bold text-ink leading-snug">
            Log breaking changes in the{' '}
            <Link href="/changelog" className="underline">
              changelog
            </Link>
            .
          </p>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Token renames, removed components, new primitives.
          </p>
        </div>
      </div>

      {/* Dev start */}
      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-20 mb-6 text-ink">
        Run locally
      </h2>
      <pre className="mono text-sm bg-[#0f0f0f] text-white rounded-2xl p-5 overflow-x-auto">
        <code>{`npm install
npx turbo dev --filter=@opusfesta/design
# → http://localhost:3008`}</code>
      </pre>
    </>
  )
}
