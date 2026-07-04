'use client'

import { useEffect, useState, useTransition, type FormEvent } from 'react'
import { submitPublicInviteRsvp } from '@/lib/dashboard/actions'
import type { PublicInviteData, PublicInviteEvent } from '@/lib/dashboard/queries'
import type { RsvpQuestion } from '@/lib/dashboard/types'
import { formatLongDate } from '@/lib/dashboard/share'
import { eventTypeLabel } from '@/lib/dashboard/types'
import type { RsvpStatus } from '@/lib/dashboard/types'
import Logo from '@/components/ui/Logo'

// OpusPass palette — same family as the couple dashboard and /rsvp/[token].
const INK = '#1A1A1A'
const PURPLE = '#6B3FA0'
const PURPLE_D = '#4A2870'
const LAV = '#C9A0DC'

const serif = { fontFamily: 'var(--font-cormorant), Georgia, serif' }

type Lang = 'sw' | 'en'
const LANG_KEY = 'opuspass-invite-lang'

/** All page chrome in both languages — ONE language on screen at a time. */
const STR: Record<Lang, Record<string, string>> = {
  sw: {
    eyebrow: 'Karibu, umealikwa',
    rsvp_title: 'Thibitisha ujio wako',
    rsvp_sub: 'Tafadhali tujibu hapa chini.',
    name: 'Jina lako',
    name_ph: 'Asha Juma',
    phone: 'Namba ya simu',
    attend: 'Utahudhuria?',
    yes: 'Naja, nitafika',
    maybe: 'Labda',
    no: 'Siwezi kufika',
    party: 'Wangapi mtakuja?',
    message: 'Ujumbe (hiari)',
    message_ph: 'Hongera! 💚',
    send: 'Tuma jibu',
    sending: 'Inatuma…',
    done_title: 'Asante! Jibu lako limetumwa.',
    done_body: 'Wenye sherehe wamepokea jibu lako na watathibitisha nafasi yako.',
    when: 'Lini',
    where: 'Wapi',
    dress: 'Mavazi',
    passed_title: 'Sherehe hii imepita 💚',
    passed_body: 'Asante kwa kuwa sehemu ya safari yao.',
    personal_title: 'Tunafurahi umealikwa 💚',
    personal_body: 'Kujibu, tumia kiungo binafsi ulichotumiwa moja kwa moja.',
    answer_prefix: 'Tafadhali jibu: ',
    error_generic: 'Kuna hitilafu, tafadhali jaribu tena.',
    optional: '(hiari)',
    powered: 'Inaendeshwa na OpusPass',
  },
  en: {
    eyebrow: "Karibu, you're invited",
    rsvp_title: 'RSVP',
    rsvp_sub: "We'd love to know if you can make it.",
    name: 'Your name',
    name_ph: 'Asha Juma',
    phone: 'Phone number',
    attend: 'Will you attend?',
    yes: "I'll be there",
    maybe: 'Maybe',
    no: "Can't make it",
    party: 'Party size',
    message: 'Message (optional)',
    message_ph: 'Congratulations! 💚',
    send: 'Send RSVP',
    sending: 'Sending…',
    done_title: 'Thank you! Your reply was sent.',
    done_body: 'The couple has received your RSVP and will confirm your spot.',
    when: 'When',
    where: 'Where',
    dress: 'Dress',
    passed_title: 'This celebration has passed 💚',
    passed_body: 'Thank you for being part of their journey.',
    personal_title: "We're glad you're invited 💚",
    personal_body: 'To RSVP, please use the personal link the couple sent you directly.',
    answer_prefix: 'Please answer: ',
    error_generic: 'Something went wrong, please try again.',
    optional: '(optional)',
    powered: 'Powered by OpusPass',
  },
}

function eventTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function EventCard({ event, t }: { event: PublicInviteEvent; t: Record<string, string> }) {
  const date = formatLongDate(event.starts_at)
  const time = eventTime(event.starts_at)
  const venue = [event.venue_name, event.city].filter(Boolean).join(', ')
  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(20,18,30,0.05)] sm:p-6">
      <div className="text-[11px] uppercase tracking-[0.18em] text-[#8e57b3]">{eventTypeLabel(event.event_type)}</div>
      <h3 className="mt-1 text-2xl font-semibold" style={{ ...serif, color: PURPLE_D }}>
        {event.name}
      </h3>
      <dl className="mt-3 space-y-1.5 text-sm text-[#1A1A1A]/80">
        {date ? (
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 text-[#1A1A1A]/45">{t.when}</dt>
            <dd>
              {date}
              {time ? ` · ${time}` : ''}
            </dd>
          </div>
        ) : null}
        {venue ? (
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 text-[#1A1A1A]/45">{t.where}</dt>
            <dd>{venue}</dd>
          </div>
        ) : null}
        {event.dress_code ? (
          <div className="flex gap-2">
            <dt className="w-16 shrink-0 text-[#1A1A1A]/45">{t.dress}</dt>
            <dd>{event.dress_code}</dd>
          </div>
        ) : null}
      </dl>
      {event.description ? (
        <p className="mt-3 text-sm leading-relaxed text-[#1A1A1A]/70">{event.description}</p>
      ) : null}
    </div>
  )
}

function RsvpForm({ slug, questions, t }: { slug: string; questions: RsvpQuestion[]; t: Record<string, string> }) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<RsvpStatus>('attending')
  const [partySize, setPartySize] = useState(1)
  const [message, setMessage] = useState('')
  const [qa, setQa] = useState<Record<string, { text: string; optionId: string }>>({})
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  const statusOptions: { value: RsvpStatus; label: string }[] = [
    { value: 'attending', label: t.yes },
    { value: 'maybe', label: t.maybe },
    { value: 'declined', label: t.no },
  ]

  function setAnswer(questionId: string, patch: { text?: string; optionId?: string }) {
    setQa((prev) => ({
      ...prev,
      [questionId]: {
        text: prev[questionId]?.text ?? '',
        optionId: prev[questionId]?.optionId ?? '',
        ...patch,
      },
    }))
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-[#C9A0DC]/60 bg-[#F6EEFB] p-6 text-center">
        <div className="text-2xl">💜</div>
        <h3 className="mt-2 text-2xl font-semibold" style={{ ...serif, color: PURPLE_D }}>
          {t.done_title}
        </h3>
        <p className="mt-1 text-sm text-[#1A1A1A]/70">{t.done_body}</p>
      </div>
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    // Validate + collect answers to the couple's general questions.
    const answers: { questionId: string; answer_text?: string | null; option_id?: string | null }[] = []
    for (const q of questions) {
      const a = qa[q.id]
      const answered = q.kind === 'multiple_choice' ? Boolean(a?.optionId) : Boolean(a?.text.trim())
      if (q.required && !answered) {
        setError(`${t.answer_prefix}${q.prompt}`)
        return
      }
      if (answered) {
        answers.push({
          questionId: q.id,
          answer_text: q.kind === 'multiple_choice' ? q.options.find((o) => o.id === a!.optionId)?.label ?? null : a!.text,
          option_id: q.kind === 'multiple_choice' ? a!.optionId : null,
        })
      }
    }

    startTransition(async () => {
      const res = await submitPublicInviteRsvp(slug, {
        fullName,
        phone,
        status,
        partySize,
        message,
        answers,
      })
      if (res.ok) setDone(true)
      else setError(res.error ?? t.error_generic)
    })
  }

  const field =
    'mt-1 w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-[#C9A0DC] focus:ring-2 focus:ring-[#C9A0DC]/30'

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium" style={{ color: INK }}>
          {t.name}
        </label>
        <input
          className={field}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
          placeholder={t.name_ph}
        />
      </div>
      <div>
        <label className="text-sm font-medium" style={{ color: INK }}>
          {t.phone}
        </label>
        <input
          className={field}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="0712 345 678"
        />
      </div>

      <div>
        <span className="text-sm font-medium" style={{ color: INK }}>
          {t.attend}
        </span>
        <div className="mt-2 grid gap-2">
          {statusOptions.map((opt) => {
            const active = status === opt.value
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`rounded-xl border px-4 py-3 text-left text-[15px] transition ${
                  active
                    ? 'border-[#6B3FA0] bg-[#6B3FA0] text-white'
                    : 'border-black/[0.12] bg-white text-[#1A1A1A] hover:border-[#C9A0DC]'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {status === 'attending' ? (
        <div>
          <label className="text-sm font-medium" style={{ color: INK }}>
            {t.party}
          </label>
          <input
            type="number"
            min={1}
            max={20}
            className={field}
            value={partySize}
            onChange={(e) => setPartySize(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
          />
        </div>
      ) : null}

      <div>
        <label className="text-sm font-medium" style={{ color: INK }}>
          {t.message}
        </label>
        <textarea
          className={field}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.message_ph}
        />
      </div>

      {questions.map((q) => {
        const a = qa[q.id] ?? { text: '', optionId: '' }
        return (
          <div key={q.id}>
            <label className="text-sm font-medium" style={{ color: INK }}>
              {q.prompt}
              {q.required ? <span className="ml-0.5 text-red-500">*</span> : <span className="ml-1 font-normal text-[#1A1A1A]/40">{t.optional}</span>}
            </label>
            {q.description ? <p className="mt-0.5 text-xs text-[#1A1A1A]/55">{q.description}</p> : null}
            {q.kind === 'multiple_choice' ? (
              <div className="mt-2 grid gap-2">
                {q.options.map((opt) => {
                  const active = a.optionId === opt.id
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setAnswer(q.id, { optionId: opt.id })}
                      className={`rounded-xl border px-4 py-3 text-left text-[15px] transition ${
                        active
                          ? 'border-[#6B3FA0] bg-[#6B3FA0] text-white'
                          : 'border-black/[0.12] bg-white text-[#1A1A1A] hover:border-[#C9A0DC]'
                      }`}
                    >
                      {opt.label}
                      {opt.description ? (
                        <span className={`block text-xs ${active ? 'text-white/70' : 'text-[#1A1A1A]/50'}`}>
                          {opt.description}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ) : (
              <textarea
                className={field}
                rows={2}
                value={a.text}
                onChange={(e) => setAnswer(q.id, { text: e.target.value })}
              />
            )}
          </div>
        )
      })}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#C9A0DC] px-5 py-3.5 font-semibold text-[#1A1A1A] transition hover:bg-[#b97fd0] active:translate-y-px disabled:opacity-60"
      >
        {pending ? t.sending : t.send}
      </button>
    </form>
  )
}

export default function PublicInviteClient({ data }: { data: PublicInviteData }) {
  const dateLabel = formatLongDate(data.weddingDate)
  const [lang, setLang] = useState<Lang>('sw')
  const t = STR[lang]

  // Remember the guest's language across visits.
  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY)
    if (saved === 'en' || saved === 'sw') setLang(saved)
  }, [])
  function pickLang(next: Lang) {
    setLang(next)
    window.localStorage.setItem(LANG_KEY, next)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F3E9FA] via-[#FBF7F2] to-white text-[#1A1A1A]">
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-5">
        {/* Top bar: brand + language switcher */}
        <div className="flex items-center justify-between">
          <Logo className="text-xl" />
          <div className="inline-flex overflow-hidden rounded-full border border-black/[0.12] bg-white text-xs font-semibold">
            {(['en', 'sw'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => pickLang(l)}
                className={`px-3.5 py-1.5 uppercase tracking-wide transition ${
                  lang === l ? 'bg-[#6B3FA0] text-white' : 'text-[#1A1A1A]/60 hover:bg-black/[0.04]'
                }`}
                aria-pressed={lang === l}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Hero: compact card image beside the names, not a full-screen poster */}
        <section className="mt-8 text-center">
          {data.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.coverImageUrl}
              alt={`${data.coupleName} invitation`}
              className="mx-auto aspect-[5/7] w-40 rounded-xl object-cover shadow-[0_10px_30px_-10px_rgba(74,40,112,0.45)] ring-1 ring-black/[0.06] sm:w-48"
            />
          ) : null}
          <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-[#8e57b3]">{t.eyebrow}</p>
          <h1 className="mt-2 text-5xl font-semibold sm:text-6xl" style={{ ...serif, color: PURPLE_D }}>
            {data.coupleName}
          </h1>
          {dateLabel ? <p className="mt-3 text-lg text-[#1A1A1A]/75">{dateLabel}</p> : null}
          {data.city ? <p className="text-[#1A1A1A]/50">{data.city}</p> : null}
        </section>

        {/* Events */}
        {data.events.length > 0 ? (
          <section className="mt-8">
            <div className="grid gap-3 sm:gap-4">
              {data.events.map((event) => (
                <EventCard key={event.id} event={event} t={t} />
              ))}
            </div>
          </section>
        ) : null}

        {/* RSVP */}
        <section className="mt-6">
          <div className="rounded-3xl border border-black/[0.08] bg-white/85 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur sm:p-8">
            {data.hasPassed ? (
              <div className="text-center">
                <h2 className="text-2xl font-semibold" style={{ ...serif, color: PURPLE_D }}>
                  {t.passed_title}
                </h2>
                <p className="mt-2 text-sm text-[#1A1A1A]/70">{t.passed_body}</p>
              </div>
            ) : data.allowRsvp ? (
              <>
                <h2 className="mb-1 text-3xl font-semibold" style={{ ...serif, color: PURPLE_D }}>
                  {t.rsvp_title}
                </h2>
                <p className="mb-5 text-sm text-[#1A1A1A]/60">{t.rsvp_sub}</p>
                <RsvpForm slug={data.slug} questions={data.generalQuestions} t={t} />
              </>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-semibold" style={{ ...serif, color: PURPLE_D }}>
                  {t.personal_title}
                </h2>
                <p className="mt-2 text-sm text-[#1A1A1A]/70">{t.personal_body}</p>
              </div>
            )}
          </div>
          <p className="mt-6 text-center text-xs text-[#1A1A1A]/40">{t.powered}</p>
        </section>
      </div>
    </main>
  )
}
