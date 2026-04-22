import { Kicker } from '@/components/Kicker'
import { Swatch } from '@/components/Swatch'
import { DosAndDonts, Do, Dont } from '@/components/DosAndDonts'
import tokens from '@/lib/tokens'

const brand = tokens.color.brand
const gray = tokens.color.gray
const status = tokens.color.status
const category = tokens.color.category

export default function ColorPage() {
  return (
    <>
      <Kicker>Foundations · Colour</Kicker>
      <h1 className="display text-4xl md:text-6xl lg:text-[72px] leading-[0.9]">
        Ink, lavender,
        <br />
        and a lot of white.
      </h1>
      <p className="mt-8 text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
        Two brand colours do the heavy lifting. Lavender is the signature — reserve it for moments
        worth earning the eye. Everything else is neutral, with status colours for feedback only.
      </p>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Brand
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Swatch color={brand.ink.value} name="Ink" hex={brand.ink.value} note={brand.ink.description} />
        <Swatch color={brand.accent.value} name="Accent · Lavender" hex={brand.accent.value} note={brand.accent.description} />
        <Swatch color={brand.accentHover.value} name="Accent hover" hex={brand.accentHover.value} note={brand.accentHover.description} />
        <Swatch color={brand.surface.value} name="Surface" hex={brand.surface.value} note={brand.surface.description} />
        <Swatch color={brand.surfaceSoft.value} name="Surface soft" hex={brand.surfaceSoft.value} note={brand.surfaceSoft.description} />
        <Swatch color={brand.onAccent.value} name="On accent" hex={brand.onAccent.value} note={brand.onAccent.description} />
        <Swatch color={brand.inkSoft.value} name="Ink soft" hex={brand.inkSoft.value} note={brand.inkSoft.description} />
      </div>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Neutrals
      </h2>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
        {Object.entries(gray).map(([k, v]) => (
          <Swatch key={k} color={v.value} name={k} hex={v.value} size="sm" />
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-600 max-w-2xl font-medium leading-relaxed">
        Use <code className="mono text-[0.88em] bg-gray-100 rounded px-1.5 py-0.5">gray-400</code>{' '}
        for eyebrow labels,{' '}
        <code className="mono text-[0.88em] bg-gray-100 rounded px-1.5 py-0.5">gray-500</code> for body on dark,{' '}
        <code className="mono text-[0.88em] bg-gray-100 rounded px-1.5 py-0.5">gray-600</code> for body on white.
        Avoid 700–900 — ink (#1A1A1A) covers dark needs.
      </p>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Contrast pairings
      </h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-gray-100 p-6">
          <p className="text-2xl font-black">Ink on white</p>
          <p className="text-sm text-gray-500 mt-2">AAA · primary text pairing</p>
        </div>
        <div className="rounded-2xl bg-[#1A1A1A] text-white p-6">
          <p className="text-2xl font-black">White on ink</p>
          <p className="text-sm text-white/60 mt-2">AAA · reverse surfaces</p>
        </div>
        <div className="rounded-2xl bg-[var(--accent)] text-[var(--on-accent)] p-6">
          <p className="text-2xl font-black">Ink on lavender</p>
          <p className="text-sm text-[var(--on-accent)]/70 mt-2">AA · the only lavender pairing</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 max-w-2xl">
        <p className="text-sm text-amber-800">
          <b>Warning —</b> white text on lavender fails WCAG AA. Ink on lavender is the only approved
          pairing.
        </p>
      </div>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Status
      </h2>
      <div className="flex flex-wrap gap-3 text-xs font-bold">
        <span className="pill px-3 py-1.5" style={{ background: status.successBg.value, color: tokens.color.brand.onAccent.value }}>Confirmed</span>
        <span className="pill bg-orange-100 text-orange-500 px-3 py-1.5">Pending</span>
        <span className="pill bg-red-100 text-red-500 px-3 py-1.5">Declined</span>
        <span className="pill px-3 py-1.5" style={{ background: status.successBg.value, color: tokens.color.brand.onAccent.value }}>Verified</span>
        <span className="pill bg-white border border-gray-200 text-gray-400 px-3 py-1.5">Draft</span>
      </div>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Category palette
      </h2>
      <p className="text-sm text-gray-600 max-w-2xl font-medium leading-relaxed mb-6">
        Reserved for the vendor-category marquee and any category taxonomy surface. Treat as a
        closed set — do not introduce new category hues outside this list.
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(category).map(([k, v]) => (
          <span
            key={k}
            className="pill px-4 py-2 text-sm capitalize"
            style={{ background: v.bg, color: v.fg }}
          >
            {k.replace(/([A-Z])/g, ' $1').trim()}
          </span>
        ))}
      </div>

      <DosAndDonts>
        <Do>Pair lavender with ink text only. Always.</Do>
        <Dont>Put white text on lavender — it fails WCAG AA.</Dont>
        <Do>Use lavender for one moment per view — CTA, badge, or emphasis.</Do>
        <Dont>Introduce new category hues. The palette is closed at 26.</Dont>
      </DosAndDonts>
    </>
  )
}
