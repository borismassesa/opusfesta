import { Kicker } from '@/components/Kicker'
import { DosAndDonts, Do, Dont } from '@/components/DosAndDonts'

const radii = [
  { cls: 'rounded-lg',     val: '8px',    usage: 'Thumbnails' },
  { cls: 'rounded-xl',     val: '12px',   usage: 'Icon tiles' },
  { cls: 'rounded-2xl',    val: '16px',   usage: 'Inputs, small cards' },
  { cls: 'rounded-3xl',    val: '24px',   usage: 'Feature cards' },
  { cls: 'rounded-[32px]', val: '32px',   usage: 'Primary cards' },
  { cls: 'rounded-[40px]', val: '40px',   usage: 'Hero frames' },
  { cls: 'rounded-full',   val: '9999px', usage: 'Buttons, pills, avatars' },
]

export default function RadiusPage() {
  return (
    <>
      <Kicker>Foundations · Radius</Kicker>
      <h1 className="display text-4xl md:text-6xl lg:text-[72px] leading-[0.9]">
        Soft corners,
        <br />
        always.
      </h1>
      <p className="mt-8 text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
        Buttons and pills are fully rounded. Cards nest from <code className="mono text-[0.88em] bg-gray-100 rounded px-1.5 py-0.5">rounded-2xl</code> outward.
        Hero frames go up to 40px. Nothing in the product is square — sharp corners belong to the
        logo.
      </p>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {radii.map((r) => (
          <div key={r.cls}>
            <div
              className={`h-24 bg-[var(--accent)] ${r.cls}`}
              style={{ borderRadius: r.cls.startsWith('rounded-[') ? r.val : undefined }}
            />
            <p className="mt-3 font-bold">{r.cls}</p>
            <p className="mono text-xs text-gray-500">{r.val}</p>
            <p className="text-xs text-gray-500">{r.usage}</p>
          </div>
        ))}
        <div>
          <div className="h-24 bg-[var(--accent)]" />
          <p className="mt-3 font-bold text-gray-400 line-through">rounded-none</p>
          <p className="text-xs text-gray-500">Forbidden in product</p>
        </div>
      </div>

      <DosAndDonts>
        <Do>Every button, pill, and badge uses rounded-full.</Do>
        <Dont>Mix rounded-none with rounded-2xl in the same section.</Dont>
      </DosAndDonts>
    </>
  )
}
