'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Send, CheckCircle2 } from 'lucide-react'
import { submitCollectorEntry } from './actions'
import { useT } from '@/components/providers/UIStringsProvider'
import {
  resolveCollectorPage,
  accentInk,
  PLEDGE_PREVIEW_MESSAGE,
  PLEDGE_PREVIEW_READY,
  type PledgePageConfig,
} from '@/lib/dashboard/pledge-page'
import { SaveTheDate } from '@/components/guests/invitation-templates'
import type { InvitationPalette } from '@/components/guests/invitation-templates/_types'

interface Props {
  token: string
  coupleName: string
  weddingDate: string | null
  city: string | null
  venue: string | null
  startsAt: string | null
  dressCode: string | null
  rsvpContact: string | null
  config: PledgePageConfig
}

/** Same palette InvitationVisual uses for the 'save-the-date' treatment. */
const SAVE_THE_DATE_PALETTE: InvitationPalette = {
  background: '#00a79d',
  surface: '#00a79d',
  accent: '#6fc7b0',
  textPrimary: '#ffffff',
  textSecondary: '#ffffff',
  muted: 'rgba(255,255,255,0.65)',
}

/** Wedding date as DD.MM.YY, the card's own "save the date" format. */
function dotDate(value: string | null): string | null {
  if (!value) return null
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(-2)}`
}

/** Time as "at H:MM am/pm". Omitted for midnight, which almost always means the
 *  event was saved with a date only (no time picked), not an actual 12am event. */
function dotTime(value: string | null): string | null {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  const hours = d.getHours()
  const minutes = d.getMinutes()
  if (hours === 0 && minutes === 0) return null
  const h12 = hours % 12 || 12
  const ampm = hours < 12 ? 'am' : 'pm'
  return `at ${h12}:${String(minutes).padStart(2, '0')} ${ampm}`
}

const fieldClass =
  'block w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-[15px] text-[#1A1A1A] placeholder:text-[#1A1A1A]/30 transition focus:border-[#C9A0DC] focus:outline-none focus:ring-2 focus:ring-[#C9A0DC]/25'

export default function CollectorForm({
  token,
  coupleName,
  weddingDate,
  city,
  venue,
  startsAt,
  dressCode,
  rsvpContact,
  config,
}: Props) {
  const t = useT('forms-collect')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  // Live preview: apply config pushed via postMessage from the customize editor.
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

  const cfg = resolveCollectorPage(override ?? config)
  const hasCover = Boolean(cfg.coverImageUrl)
  const isFullTemplate = hasCover && cfg.coverIsFullTemplate
  const onAccent = accentInk(cfg.accent)

  const dateStr = dotDate(startsAt ?? weddingDate)
  const timeStr = dotTime(startsAt)
  const parts = coupleName
    .split(/\s*(?:&|and|\bna\b|\+)\s*/i)
    .map((p) => p.trim())
    .filter(Boolean)

  // Photo-cover mode only (SaveTheDate template below handles its own styling).
  const ink = '#FFFFFF'
  const soft = 'rgba(255,255,255,0.82)'
  const rule = 'rgba(255,255,255,0.6)'
  const coverStyle: React.CSSProperties = isFullTemplate
    ? {
        backgroundImage: `url("${cfg.coverImageUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: `linear-gradient(rgba(20,12,28,0.42),rgba(20,12,28,0.55)), url("${cfg.coverImageUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error(t('error_name'))
      return
    }
    startTransition(async () => {
      try {
        await submitCollectorEntry(token, {
          full_name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
        })
        setDone(true)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('error_submit'))
      }
    })
  }

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* ── Decorative cover ── */}
      <aside
        className="relative flex min-h-[360px] flex-col justify-center overflow-hidden px-8 py-14 sm:min-h-[420px] lg:sticky lg:top-0 lg:h-screen lg:px-14"
        style={hasCover ? { ...coverStyle, color: ink } : undefined}
      >
        {hasCover ? (
          isFullTemplate ? null : (
            <>
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
            </>
          )
        ) : (
          <SaveTheDate
            names={coupleName}
            date={dateStr ?? ''}
            venue={venue ?? city ?? ''}
            time={timeStr ?? undefined}
            dressCode={dressCode ?? undefined}
            rsvpContact={rsvpContact ?? undefined}
            palette={SAVE_THE_DATE_PALETTE}
          />
        )}
      </aside>

      {/* ── Form ── */}
      <main className="flex justify-center px-5 py-10 sm:px-8 lg:px-14 lg:py-16">
        <div className="w-full max-w-lg">
          {done ? (
            <div className="text-center lg:py-10">
              <CheckCircle2 className="mx-auto h-12 w-12 text-[#3f6b1f]" />
              <h2 className="mt-4 font-serif text-3xl text-[#1A1A1A]">{t('success_heading')}</h2>
              <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-[#1A1A1A]/60">
                {t('success_body', { coupleName })}
              </p>
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

              <form onSubmit={submit} className="mt-8 space-y-5">
                <Field label={t('label_name')} required accent={cfg.accent}>
                  <input
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('placeholder_name')}
                    className={fieldClass}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label={t('label_whatsapp')}>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('placeholder_whatsapp')}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label={t('label_email')}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('placeholder_email')}
                      className={fieldClass}
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  style={{ backgroundColor: cfg.accent, color: onAccent }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-bold shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] transition hover:brightness-95 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {pending ? t('send_pending') : cfg.buttonLabel}
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
        {required ? <span style={{ color: accent ?? '#b97fd0' }}> *</span> : null}
      </span>
      {children}
    </label>
  )
}
