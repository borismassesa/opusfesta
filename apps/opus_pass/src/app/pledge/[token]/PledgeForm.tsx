'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Send, CheckCircle2, Wallet } from 'lucide-react'
import { submitPublicPledge } from './actions'
import {
  resolvePledgePage,
  COVER_TONES,
  accentInk,
  PLEDGE_PREVIEW_MESSAGE,
  PLEDGE_PREVIEW_READY,
  type PledgePageConfig,
  type PledgePaymentMethod,
} from '@/lib/dashboard/pledge-page'

interface Props {
  token: string
  coupleName: string
  weddingDate: string | null
  city: string | null
  paymentInstructions: string | null
  paymentMethods: PledgePaymentMethod[]
  config: PledgePageConfig
}

/** Wedding date as DD.MM.YYYY, the elegant "save the date" format. */
function dotDate(value: string | null): string | null {
  if (!value) return null
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

const fieldClass =
  'block w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-[15px] text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 transition focus:border-[#C9A0DC] focus:outline-none focus:ring-2 focus:ring-[#C9A0DC]/25'

export default function PledgeForm({
  token,
  coupleName,
  weddingDate,
  city,
  paymentInstructions,
  paymentMethods,
  config,
}: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [promisedDate, setPromisedDate] = useState('')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  // Live preview: when embedded in the customize editor, apply config pushed via
  // postMessage so edits show in real time without saving.
  const [override, setOverride] = useState<PledgePageConfig | null>(null)
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === PLEDGE_PREVIEW_MESSAGE) setOverride(e.data.config ?? {})
    }
    window.addEventListener('message', onMessage)
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: PLEDGE_PREVIEW_READY }, window.location.origin)
    }
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const cfg = resolvePledgePage(override ?? config)
  const tone = COVER_TONES[cfg.coverTone]
  const hasCover = Boolean(cfg.coverImageUrl)
  const onAccent = accentInk(cfg.accent)

  const dateStr = dotDate(weddingDate)
  const parts = coupleName
    .split(/\s*(?:&|and|\bna\b|\+)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean)

  // Cover colors flip to light when a photo backs the panel.
  const ink = hasCover ? '#FFFFFF' : tone.ink
  const soft = hasCover ? 'rgba(255,255,255,0.82)' : tone.soft
  const rule = hasCover ? 'rgba(255,255,255,0.6)' : tone.rule
  const leaf = hasCover ? 'rgba(255,255,255,0.7)' : tone.leaf
  const coverStyle: React.CSSProperties = hasCover
    ? {
        backgroundImage: `linear-gradient(rgba(20,12,28,0.42),rgba(20,12,28,0.55)), url("${cfg.coverImageUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundImage: tone.gradient, backgroundColor: tone.base }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!(Number(amount) > 0)) {
      toast.error('Please enter the amount you can pledge')
      return
    }
    startTransition(async () => {
      try {
        await submitPublicPledge(token, {
          full_name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          amount: Number(amount),
          promised_date: promisedDate || null,
          message: message.trim() || null,
        })
        setDone(true)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not save your pledge')
      }
    })
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* ── Decorative cover — "save the date" ── */}
      <aside
        className="relative flex min-h-[360px] flex-col justify-center overflow-hidden px-8 py-14 sm:min-h-[420px] lg:sticky lg:top-0 lg:h-screen lg:px-14"
        style={{ ...coverStyle, color: ink }}
      >
        {!hasCover ? (
          <>
            <Sprig className="pointer-events-none absolute -left-5 -top-8 w-32 opacity-90 sm:w-44" style={{ color: leaf }} />
            <Sprig
              className="pointer-events-none absolute -bottom-10 -right-5 w-32 rotate-180 opacity-90 sm:w-44"
              style={{ color: leaf }}
            />
          </>
        ) : null}

        <span className="absolute left-8 top-8 text-sm font-bold tracking-tight lg:left-14" style={{ color: soft }}>
          OpusPass
        </span>

        <div className="relative text-center">
          <p className="font-serif text-[11px] uppercase tracking-[0.3em] sm:text-xs" style={{ color: soft }}>
            {cfg.eyebrow}
          </p>

          <div className="mt-6 space-y-2.5">
            {parts.length >= 2 ? (
              <>
                <p className="font-serif text-4xl uppercase leading-none tracking-[0.1em] sm:text-5xl">
                  {parts[0]}
                </p>
                <p className="font-serif text-sm uppercase tracking-[0.3em]" style={{ color: soft }}>
                  and
                </p>
                <p className="font-serif text-4xl uppercase leading-none tracking-[0.1em] sm:text-5xl">
                  {parts[1]}
                </p>
              </>
            ) : (
              <p className="font-serif text-4xl uppercase leading-tight tracking-[0.08em] sm:text-5xl">
                {coupleName}
              </p>
            )}
          </div>

          <div className="mx-auto mt-7 flex items-center justify-center gap-2.5">
            <span className="h-px w-12" style={{ backgroundColor: rule, opacity: 0.6 }} />
            <span className="h-1.5 w-1.5 rotate-45" style={{ backgroundColor: rule }} />
            <span className="h-px w-12" style={{ backgroundColor: rule, opacity: 0.6 }} />
          </div>

          {dateStr ? (
            <p className="mt-5 font-serif text-2xl tracking-[0.12em] sm:text-[26px]">{dateStr}</p>
          ) : null}
          {city ? (
            <p className="mt-2 text-[11px] uppercase tracking-[0.25em]" style={{ color: soft }}>
              {city}
            </p>
          ) : null}
        </div>
      </aside>

      {/* ── Form ── */}
      <main className="flex justify-center px-5 py-10 sm:px-8 lg:px-14 lg:py-16">
        <div className="w-full max-w-lg">
          {done ? (
            <div className="text-center lg:py-10">
              <CheckCircle2 className="mx-auto h-12 w-12 text-[#3f6b1f]" />
              <h2 className="mt-4 font-serif text-3xl text-[#1A1A1A]">Asante sana! 💚</h2>
              <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-[#1A1A1A]/60">
                {coupleName} have received your pledge. They’ll be in touch with the details.
              </p>
              {paymentMethods.length || paymentInstructions?.trim() ? (
                <PayCard methods={paymentMethods} instructions={paymentInstructions} />
              ) : null}
            </div>
          ) : (
            <>
              <h2 className="text-center font-serif leading-tight text-[#1A1A1A]">
                <span className="block text-3xl sm:text-[34px]">{coupleName}</span>
                <span className="mt-1 block text-2xl text-[#1A1A1A]/80 sm:text-[26px]">{cfg.headingLine2}</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-center text-[15px] leading-relaxed text-[#1A1A1A]/60">
                {cfg.intro}
              </p>

              {paymentMethods.length || paymentInstructions?.trim() ? (
                <PayCard methods={paymentMethods} instructions={paymentInstructions} />
              ) : null}

              <form onSubmit={submit} className="mt-8 space-y-5">
                <Field label="Your name" required accent={cfg.accent}>
                  <input
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Asha Mussa"
                    className={fieldClass}
                  />
                </Field>

                <Field label="Amount you’d like to pledge" required accent={cfg.accent}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#1A1A1A]/35">
                      TZS
                    </span>
                    <input
                      required
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100,000"
                      className={`${fieldClass} pl-[3.25rem]`}
                    />
                  </div>
                </Field>

                <Field label="When can you pay by?">
                  <input
                    type="date"
                    value={promisedDate}
                    onChange={(e) => setPromisedDate(e.target.value)}
                    className={fieldClass}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="WhatsApp / mobile">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712 345 678"
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={fieldClass}
                    />
                  </Field>
                </div>

                <Field label="A note for the couple">
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Hongera! Anything you’d like to add…"
                    className={fieldClass}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={pending}
                  style={{ backgroundColor: cfg.accent, color: onAccent }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] transition hover:brightness-95 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {pending ? 'Sending…' : cfg.buttonLabel}
                </button>

                <p className="text-center text-[11px] leading-relaxed text-[#1A1A1A]/45">
                  {cfg.privacyNote.replace(/\{couple\}/g, coupleName)}
                </p>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

/** A simple botanical sprig — leaves + a blossom — drawn inline. */
function Sprig({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 140 240" className={className} style={style} fill="currentColor" aria-hidden="true">
      <path
        d="M72 238 C66 180 64 110 76 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="50" cy="66" rx="19" ry="8" transform="rotate(-38 50 66)" opacity="0.85" />
      <ellipse cx="92" cy="88" rx="19" ry="8" transform="rotate(38 92 88)" opacity="0.85" />
      <ellipse cx="48" cy="114" rx="22" ry="9" transform="rotate(-32 48 114)" opacity="0.85" />
      <ellipse cx="94" cy="138" rx="22" ry="9" transform="rotate(34 94 138)" opacity="0.85" />
      <ellipse cx="52" cy="168" rx="18" ry="8" transform="rotate(-30 52 168)" opacity="0.85" />
      <ellipse cx="90" cy="192" rx="18" ry="8" transform="rotate(32 90 192)" opacity="0.85" />
      <circle cx="76" cy="20" r="11" fill="#ffffff" opacity="0.95" />
      <circle cx="76" cy="20" r="3.5" fill="#E8C26A" />
    </svg>
  )
}

function Field({
  label,
  required,
  accent,
  children,
}: {
  label: string
  required?: boolean
  accent?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#1A1A1A]/70">
        {label}
        {required ? (
          <span style={{ color: accent ?? '#b97fd0' }}> *</span>
        ) : null}
      </span>
      {children}
    </label>
  )
}

function PayCard({
  methods,
  instructions,
}: {
  methods: PledgePaymentMethod[]
  instructions: string | null
}) {
  const filled = methods.filter((m) => m.label?.trim() || m.value?.trim())
  return (
    <div className="mt-6 rounded-2xl border border-[#9FE870]/40 bg-[#F3FAEC] p-4 text-left">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9FE870]/30 text-[#3f6b1f]">
          <Wallet className="h-3.5 w-3.5" />
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3f6b1f]">How to pay</p>
      </div>
      {filled.length ? (
        <ul className="mt-3 space-y-2.5">
          {filled.map((m, i) => (
            <li key={i} className="text-sm leading-snug">
              <span className="text-[#1A1A1A]/75">
                {m.label?.trim() ? <span className="font-semibold text-[#1A1A1A]">{m.label.trim()}</span> : null}
                {m.label?.trim() && m.value?.trim() ? ', ' : ''}
                {m.value?.trim() ? (
                  <span className="font-bold tracking-wide text-[#3f6b1f]">{m.value.trim()}</span>
                ) : null}
              </span>
              {m.name?.trim() ? <div className="text-xs italic text-[#1A1A1A]/60">{m.name.trim()}</div> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#1A1A1A]/75">
          {(instructions ?? '').trim()}
        </p>
      )}
    </div>
  )
}
