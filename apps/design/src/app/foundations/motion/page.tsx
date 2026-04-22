import { Kicker } from '@/components/Kicker'
import { DosAndDonts, Do, Dont } from '@/components/DosAndDonts'
import tokens from '@/lib/tokens'

const motion = tokens.motion

export default function MotionPage() {
  return (
    <>
      <Kicker>Foundations · Motion</Kicker>
      <h1 className="display text-4xl md:text-6xl lg:text-[72px] leading-[0.9]">
        Confident,
        <br />
        never theatrical.
      </h1>
      <p className="mt-8 text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
        Short, decisive, damped. One easing curve for 90% of motion. Content fades and rises —
        never rises without fading.
      </p>

      <div className="mt-12 grid md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-gray-100 p-8">
          <p className="kicker text-gray-400">Primary easing</p>
          <p className="mono mt-3 text-xl font-bold">
            cubic-bezier({motion.ease.value.join(', ')})
          </p>
          <p className="mt-3 text-sm text-gray-500">Swift out — pairs with every fade/rise.</p>
        </div>
        <div className="rounded-3xl bg-[var(--accent)] p-8">
          <p className="kicker text-[var(--on-accent)]/60">Reveal recipe</p>
          <p className="mt-3 font-black text-2xl text-[var(--on-accent)] leading-tight">
            Fade from 0, rise 32px.
            <br />
            Duration 650ms.
          </p>
        </div>
      </div>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Durations
      </h2>
      <div className="grid md:grid-cols-4 gap-4">
        {Object.entries(motion.duration).map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-gray-100 p-5">
            <p className="kicker text-gray-400">{k}</p>
            <p className="text-2xl font-black mt-2">{v.value}</p>
            <p className="text-xs text-gray-500 mt-1">{v.usage}</p>
          </div>
        ))}
      </div>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Principles
      </h2>
      <ol className="space-y-3 text-base text-gray-700 max-w-2xl">
        {motion.principles.map((p, i) => (
          <li key={i} className="flex gap-3">
            <span className="mono text-xs text-[var(--accent)] font-bold">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ol>

      <DosAndDonts>
        <Do>Fade and rise together on every reveal. 650ms / ease out-expo.</Do>
        <Dont>Rise an element without also fading it — looks heavy-handed.</Dont>
        <Do>Respect <code>prefers-reduced-motion</code>. Collapse to instant fade.</Do>
        <Dont>Loop a reveal animation on scroll — trigger once, viewport-in.</Dont>
      </DosAndDonts>
    </>
  )
}
