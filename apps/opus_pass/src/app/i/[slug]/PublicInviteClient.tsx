'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { submitPublicInviteRsvp } from '@/lib/dashboard/actions'
import type { PublicInviteData, PublicInviteEvent } from '@/lib/dashboard/queries'
import { formatLongDate } from '@/lib/dashboard/share'
import { eventTypeLabel } from '@/lib/dashboard/types'
import type { RsvpStatus } from '@/lib/dashboard/types'

const INK = '#1A1A1A'
const GREEN = '#14342B'
const ACCENT = '#9FE870'

function eventTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function EventCard({ event }: { event: PublicInviteEvent }) {
  const date = formatLongDate(event.starts_at)
  const time = eventTime(event.starts_at)
  const venue = [event.venue_name, event.city].filter(Boolean).join(', ')
  return (
    <div className="rounded-2xl border border-[#1A1A1A]/10 bg-white p-5 sm:p-6">
      <div className="text-xs uppercase tracking-[0.18em] text-[#14342B]/70">{eventTypeLabel(event.event_type)}</div>
      <h3 className="mt-1 text-xl font-semibold" style={{ color: GREEN }}>
        {event.name}
      </h3>
      <dl className="mt-3 space-y-1.5 text-sm text-[#1A1A1A]/80">
        {date ? (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-[#1A1A1A]/45">When</dt>
            <dd>
              {date}
              {time ? ` · ${time}` : ''}
            </dd>
          </div>
        ) : null}
        {venue ? (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-[#1A1A1A]/45">Where</dt>
            <dd>{venue}</dd>
          </div>
        ) : null}
        {event.dress_code ? (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-[#1A1A1A]/45">Dress</dt>
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

const STATUS_OPTIONS: { value: RsvpStatus; label: string; sub: string }[] = [
  { value: 'attending', label: 'Naja • I’ll be there', sub: '' },
  { value: 'maybe', label: 'Labda • Maybe', sub: '' },
  { value: 'declined', label: 'Siwezi • Can’t make it', sub: '' },
]

function RsvpForm({ slug }: { slug: string }) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<RsvpStatus>('attending')
  const [partySize, setPartySize] = useState(1)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  if (done) {
    return (
      <div className="rounded-2xl border border-[#9FE870]/60 bg-[#9FE870]/15 p-6 text-center">
        <div className="text-2xl">💚</div>
        <h3 className="mt-2 text-lg font-semibold" style={{ color: GREEN }}>
          Asante! Your reply was sent.
        </h3>
        <p className="mt-1 text-sm text-[#1A1A1A]/70">
          Thank you — the couple has received your RSVP and will confirm your spot.
        </p>
      </div>
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await submitPublicInviteRsvp(slug, {
        fullName,
        phone,
        status,
        partySize,
        message,
      })
      if (res.ok) setDone(true)
      else setError(res.error ?? 'Something went wrong — please try again.')
    })
  }

  const field =
    'mt-1 w-full rounded-xl border border-[#1A1A1A]/15 bg-white px-4 py-3 text-[15px] outline-none focus:border-[#14342B]'

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium" style={{ color: INK }}>
          Jina lako • Your name
        </label>
        <input
          className={field}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
          placeholder="Asha Juma"
        />
      </div>
      <div>
        <label className="text-sm font-medium" style={{ color: INK }}>
          Namba ya simu • Phone
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
          Utahudhuria? • Will you attend?
        </span>
        <div className="mt-2 grid gap-2">
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt.value
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`rounded-xl border px-4 py-3 text-left text-[15px] transition ${
                  active
                    ? 'border-[#14342B] bg-[#14342B] text-white'
                    : 'border-[#1A1A1A]/15 bg-white text-[#1A1A1A] hover:border-[#14342B]/40'
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
            Wangapi mtakuja? • Party size
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
          Ujumbe (hiari) • Message (optional)
        </label>
        <textarea
          className={field}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hongera! 💚"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl px-5 py-3.5 font-semibold text-[#14342B] transition active:translate-y-px disabled:opacity-60"
        style={{ background: ACCENT }}
      >
        {pending ? 'Inatuma…' : 'Tuma jibu • Send RSVP'}
      </button>
    </form>
  )
}

export default function PublicInviteClient({ data }: { data: PublicInviteData }) {
  const dateLabel = formatLongDate(data.weddingDate)

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A]">
      {/* Hero */}
      <section className="relative">
        {data.coverImageUrl ? (
          <div className="mx-auto max-w-2xl px-4 pt-8 sm:pt-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.coverImageUrl}
              alt={`${data.coupleName} invitation`}
              className="mx-auto aspect-[5/7] w-full max-w-sm rounded-2xl object-cover shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)]"
            />
          </div>
        ) : (
          <div className="h-3 w-full" style={{ background: GREEN }} />
        )}
        <div className="mx-auto max-w-2xl px-4 py-8 text-center sm:py-10">
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: GREEN }}>
            Karibu • You’re invited
          </p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl" style={{ color: GREEN }}>
            {data.coupleName}
          </h1>
          {dateLabel ? <p className="mt-3 text-lg text-[#1A1A1A]/80">{dateLabel}</p> : null}
          {data.city ? <p className="text-[#1A1A1A]/55">{data.city}</p> : null}
        </div>
      </section>

      {/* Events */}
      {data.events.length > 0 ? (
        <section className="mx-auto max-w-2xl px-4 pb-8">
          <div className="grid gap-3 sm:gap-4">
            {data.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ) : null}

      {/* RSVP */}
      <section className="mx-auto max-w-2xl px-4 pb-16">
        <div className="rounded-3xl border border-[#1A1A1A]/10 bg-white p-6 sm:p-8 shadow-sm">
          {data.hasPassed ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold" style={{ color: GREEN }}>
                Sherehe hii imepita 💚
              </h2>
              <p className="mt-2 text-sm text-[#1A1A1A]/70">
                This celebration has passed. Thank you for being part of {data.coupleName}’s journey.
              </p>
            </div>
          ) : data.allowRsvp ? (
            <>
              <h2 className="mb-1 text-xl font-semibold" style={{ color: GREEN }}>
                Thibitisha ujio wako • RSVP
              </h2>
              <p className="mb-5 text-sm text-[#1A1A1A]/60">
                Tafadhali tujibu hapa chini. We’d love to know if you can make it.
              </p>
              <RsvpForm slug={data.slug} />
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-semibold" style={{ color: GREEN }}>
                Tunafurahi umealikwa 💚
              </h2>
              <p className="mt-2 text-sm text-[#1A1A1A]/70">
                To RSVP, please use the personal link the couple sent you directly.
              </p>
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-[#1A1A1A]/40">Powered by OpusPass</p>
      </section>
    </main>
  )
}
