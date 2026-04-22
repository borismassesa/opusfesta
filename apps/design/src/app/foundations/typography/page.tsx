import { Kicker } from '@/components/Kicker'
import { DosAndDonts, Do, Dont } from '@/components/DosAndDonts'
import tokens from '@/lib/tokens'

const scale = tokens.typography.scale

const display = [
  { key: 'display-xl', px: 96, sample: 'Hero.', leading: '0.85' },
  { key: 'display',     px: 80, sample: 'Section headline.', leading: '0.88' },
  { key: 'display-sm',  px: 72, sample: 'Default H2.', leading: '0.9' },
  { key: 'h1',          px: 52, sample: 'Long-form title.', leading: '0.88' },
]

const body = [
  { key: 'h2',       px: 32, weight: 900, sample: 'Feature block' },
  { key: 'h3',       px: 24, weight: 900, sample: 'Card title' },
  { key: 'h4',       px: 20, weight: 700, sample: 'Subsection' },
  { key: 'lead',     px: 18, weight: 500, sample: 'Save hundreds of hours on wedding research.' },
  { key: 'body',     px: 15, weight: 500, sample: 'Body copy sits at 15px, weight 500, and leading 1.625.' },
  { key: 'caption',  px: 12, weight: 700, sample: 'Pills & badges.' },
  { key: 'kicker',   px: 11, weight: 700, sample: 'Eyebrow · Overline', upper: true },
  { key: 'micro',    px: 10, weight: 900, sample: 'Stat labels · Column headers', upper: true },
]

export default function TypographyPage() {
  return (
    <>
      <Kicker>Foundations · Typography</Kicker>
      <h1 className="display text-4xl md:text-6xl lg:text-[72px] leading-[0.9]">
        Type that
        <br />
        speaks loudly.
      </h1>
      <p className="mt-8 text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
        Inter, from 400 to 900. One family, many jobs. Display sizes are always uppercase,
        tracking-tighter, and leading between 0.85 and 0.92. Body copy is medium weight, relaxed
        leading.
      </p>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Families
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-gray-100 shadow-sm p-8">
          <p className="kicker text-gray-400">Primary</p>
          <p className="mt-4 text-5xl font-black">Inter</p>
          <p className="mt-3 text-sm text-gray-500">400 · 500 · 600 · 700 · 900</p>
          <p className="mt-6 text-base leading-relaxed">
            Everything you need to plan your wedding, all in one place.
          </p>
        </div>
        <div className="rounded-3xl border border-gray-100 shadow-sm p-8">
          <p className="kicker text-gray-400">Mono</p>
          <p className="mt-4 text-5xl font-bold mono">JetBrains Mono</p>
          <p className="mt-3 text-sm text-gray-500">500 · 700</p>
          <p className="mt-6 text-sm mono">
            TZS 35,000,000 · +255 712 345 678 · sarahandjames.opusfesta.com
          </p>
        </div>
      </div>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Display scale
      </h2>
      <div className="space-y-6">
        {display.map((d) => (
          <div key={d.key} className="flex items-baseline gap-6 border-b border-gray-100 pb-6">
            <span className="mono text-xs text-gray-400 shrink-0 w-28">
              {d.key} · {d.px}
            </span>
            <p
              className="display"
              style={{ fontSize: `min(${d.px}px, 16vw)`, lineHeight: d.leading }}
            >
              {d.sample}
            </p>
          </div>
        ))}
      </div>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Body scale
      </h2>
      <div className="space-y-6">
        {body.map((b) => (
          <div key={b.key} className="flex items-baseline gap-6 border-b border-gray-100 pb-6">
            <span className="mono text-xs text-gray-400 shrink-0 w-28">
              {b.key} · {b.px}
            </span>
            <p
              style={{
                fontSize: `${b.px}px`,
                fontWeight: b.weight,
                textTransform: b.upper ? 'uppercase' : 'none',
                letterSpacing: b.upper ? '0.12em' : 'normal',
              }}
              className={b.key === 'kicker' ? 'text-[var(--accent)]' : ''}
            >
              {b.sample}
            </p>
          </div>
        ))}
      </div>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Display rules
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 p-6">
          <p className="kicker text-[var(--accent)]">Case</p>
          <p className="mt-3 font-bold">Always UPPERCASE</p>
          <p className="mt-2 text-sm text-gray-500">for H1/H2/H3 display. Sentence case in body.</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-6">
          <p className="kicker text-[var(--accent)]">Weight</p>
          <p className="mt-3 font-bold">font-black (900)</p>
          <p className="mt-2 text-sm text-gray-500">for all display. Never lighter on hero type.</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-6">
          <p className="kicker text-[var(--accent)]">Tracking</p>
          <p className="mt-3 font-bold">tracking-tighter (-0.025em)</p>
          <p className="mt-2 text-sm text-gray-500">on display. 0.12em on kickers.</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-6">
          <p className="kicker text-[var(--accent)]">Leading</p>
          <p className="mt-3 font-bold">0.85–0.92</p>
          <p className="mt-2 text-sm text-gray-500">on display. 1.625 on paragraphs.</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-6">
          <p className="kicker text-[var(--accent)]">Line breaks</p>
          <p className="mt-3 font-bold">Hand-break with &lt;br&gt;</p>
          <p className="mt-2 text-sm text-gray-500">to shape the rag. Two-to-three lines per block.</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-6">
          <p className="kicker text-[var(--accent)]">Emphasis</p>
          <p className="mt-3 font-bold">Colour, not italic</p>
          <p className="mt-2 text-sm text-gray-500">
            Emphasise a word with <span className="text-[var(--accent)] font-black">lavender</span>.
          </p>
        </div>
      </div>

      <DosAndDonts>
        <Do>Use UPPERCASE, font-black, tracking-tighter on every display heading.</Do>
        <Dont>Use italics for emphasis — use lavender colour or weight instead.</Dont>
        <Do>Break display headlines by hand with &lt;br&gt; to control the rag.</Do>
        <Dont>Let display copy wrap below 0.85 or above 0.92 leading.</Dont>
      </DosAndDonts>

      <p className="mt-10 text-xs text-gray-400 mono">
        Source: <code>apps/design/tokens.json</code> → typography.scale ·{' '}
        {Object.keys(scale).length} sizes defined.
      </p>
    </>
  )
}
