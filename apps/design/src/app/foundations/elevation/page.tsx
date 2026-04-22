import { Kicker } from '@/components/Kicker'
import { DosAndDonts, Do, Dont } from '@/components/DosAndDonts'

const shadows = [
  { cls: 'shadow-sm',  val: '0 2 8 rgba(0,0,0,0.06)',     usage: 'Resting cards' },
  { cls: 'shadow-md',  val: '0 8 24 rgba(0,0,0,0.08)',    usage: 'Card hover' },
  { cls: 'shadow-lg',  val: '0 20 60 rgba(0,0,0,0.08)',   usage: 'Featured card' },
  { cls: 'shadow-xl',  val: '0 20 60 rgba(0,0,0,0.15)',   usage: 'Hero product frame' },
  { cls: 'shadow-2xl', val: '0 25 50 -12 rgba(0,0,0,0.25)', usage: 'Hero media frame' },
]

export default function ElevationPage() {
  return (
    <>
      <Kicker>Foundations · Elevation</Kicker>
      <h1 className="display text-4xl md:text-6xl lg:text-[72px] leading-[0.9]">
        Shadows are soft,
        <br />
        deep, warm.
      </h1>
      <p className="mt-8 text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
        Long, low-opacity shadows. Never hard offsets, never 1px borders pretending to be shadows.
        Use <code className="mono text-[0.88em] bg-gray-100 rounded px-1.5 py-0.5">shadow-sm</code>{' '}
        on everything that sits above the page. Reserve{' '}
        <code className="mono text-[0.88em] bg-gray-100 rounded px-1.5 py-0.5">shadow-lg</code> for
        the hero product.
      </p>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-6">
        {shadows.map((s) => (
          <div key={s.cls} className="p-4">
            <div className={`h-28 rounded-2xl bg-white ${s.cls}`} />
            <p className="mt-4 font-bold">{s.cls}</p>
            <p className="text-xs text-gray-500 mono mt-1">{s.val}</p>
            <p className="text-xs text-gray-500 mt-1">{s.usage}</p>
          </div>
        ))}
        <div className="p-4">
          <div className="h-28 rounded-2xl bg-white border border-gray-100" />
          <p className="mt-4 font-bold">border only</p>
          <p className="text-xs text-gray-500">Static, no elevation</p>
        </div>
      </div>

      <DosAndDonts>
        <Do>Combine border-gray-100 + shadow-sm for resting state, then lift to shadow-md on hover.</Do>
        <Dont>Use default Tailwind shadow-2xl as a general-purpose shadow — it&apos;s only for hero.</Dont>
      </DosAndDonts>
    </>
  )
}
