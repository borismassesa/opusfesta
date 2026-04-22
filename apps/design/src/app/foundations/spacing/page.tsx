import { Kicker } from '@/components/Kicker'
import { DosAndDonts, Do, Dont } from '@/components/DosAndDonts'

const ruler = [1, 2, 3, 4, 6, 8, 12, 16, 24].map((n) => ({
  step: n,
  px: n * 4,
}))

export default function SpacingPage() {
  return (
    <>
      <Kicker>Foundations · Spacing</Kicker>
      <h1 className="display text-4xl md:text-6xl lg:text-[72px] leading-[0.9]">
        4-pixel grid.
        <br />
        Generous air.
      </h1>
      <p className="mt-8 text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
        Every value is a multiple of 4. Sections breathe — don&apos;t compress vertical rhythm to
        fit more content on a screen.
      </p>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Section padding
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 p-6">
          <p className="kicker text-gray-400">Mobile</p>
          <p className="mt-3 font-bold">py-14 px-4</p>
          <p className="mono text-xs text-gray-500 mt-1">56px / 16px</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-6">
          <p className="kicker text-gray-400">Tablet</p>
          <p className="mt-3 font-bold">sm:py-20 sm:px-6</p>
          <p className="mono text-xs text-gray-500 mt-1">80px / 24px</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-6">
          <p className="kicker text-gray-400">Desktop</p>
          <p className="mt-3 font-bold">md:py-24 md:px-6</p>
          <p className="mono text-xs text-gray-500 mt-1">96px / 24px</p>
        </div>
      </div>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Containers
      </h2>
      <div className="space-y-3">
        <div className="rounded-xl bg-gray-100 px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-sm">max-w-6xl</span>
          <span className="mono text-xs text-gray-500">1152px · primary container</span>
        </div>
        <div className="rounded-xl bg-gray-100 px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-sm">max-w-3xl</span>
          <span className="mono text-xs text-gray-500">768px · long-form copy</span>
        </div>
        <div className="rounded-xl bg-gray-100 px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-sm">max-w-xl</span>
          <span className="mono text-xs text-gray-500">640px · prose paragraphs</span>
        </div>
      </div>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Scale (ruler)
      </h2>
      <div className="space-y-2">
        {ruler.map((r) => (
          <div key={r.step} className="flex items-center gap-4 text-xs">
            <span className="mono w-12 text-gray-500">{r.step}</span>
            <div className="bg-[var(--accent)]" style={{ width: `${r.px}px`, height: 12 }} />
            <span className="text-gray-400">{r.px}px</span>
          </div>
        ))}
      </div>

      <DosAndDonts>
        <Do>Stick to multiples of 4. Tailwind&apos;s scale already does this.</Do>
        <Dont>Use odd values like 5px, 13px, 22px — they&apos;ll misalign.</Dont>
        <Do>Give sections 80–96px of vertical air on desktop.</Do>
        <Dont>Compress vertical rhythm to fit more on screen — it reads as cheap.</Dont>
      </DosAndDonts>
    </>
  )
}
