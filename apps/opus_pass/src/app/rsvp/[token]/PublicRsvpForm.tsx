'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CalendarHeart, MapPin, Clock, Check, PartyPopper, Heart } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useT } from '@/components/providers/UIStringsProvider'
import { submitPublicRsvp, type PublicRsvpResponse } from '@/lib/dashboard/actions'
import { eventTypeLabel, type RsvpStatus } from '@/lib/dashboard/types'
import type { PublicRsvpData } from '@/lib/dashboard/queries'

const inputClass =
  'w-full rounded-xl border border-black/[0.12] bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-[#1A1A1A]/35 focus:border-[#C9A0DC] focus:ring-2 focus:ring-[#C9A0DC]/30'

interface Answer {
  rsvp_status: RsvpStatus
  party_size: number
  meal_choice: string
  dietary_notes: string
  guest_message: string
}

function formatWhen(value: string | null, tbc: string): string {
  if (!value) return tbc
  return new Date(value).toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PublicRsvpForm({ data, token }: { data: PublicRsvpData; token: string }) {
  const t = useT('forms-rsvp')
  const [answers, setAnswers] = useState<Record<string, Answer>>(() =>
    Object.fromEntries(
      data.events.map((e) => [
        e.invitation.id,
        {
          rsvp_status: e.invitation.rsvp_status,
          party_size: e.invitation.party_size || 1,
          meal_choice: e.invitation.meal_choice ?? '',
          dietary_notes: e.invitation.dietary_notes ?? '',
          guest_message: e.invitation.guest_message ?? '',
        },
      ])
    )
  )
  const [submitted, setSubmitted] = useState(
    data.events.length > 0 && data.events.every((e) => e.invitation.responded_at)
  )
  const [pending, startTransition] = useTransition()

  function update(id: string, patch: Partial<Answer>) {
    setAnswers((a) => ({ ...a, [id]: { ...a[id], ...patch } }))
  }

  function submit() {
    const responses: PublicRsvpResponse[] = data.events.map((e) => {
      const a = answers[e.invitation.id]
      return {
        invitationId: e.invitation.id,
        rsvp_status: a.rsvp_status === 'pending' ? 'pending' : a.rsvp_status,
        party_size: a.party_size,
        meal_choice: a.meal_choice || null,
        dietary_notes: a.dietary_notes || null,
        guest_message: a.guest_message || null,
      }
    })
    if (responses.some((r) => r.rsvp_status === 'pending')) {
      toast.error(t('error_answer_each'))
      return
    }
    startTransition(async () => {
      const res = await submitPublicRsvp(token, responses)
      if (res.ok) {
        setSubmitted(true)
        toast.success(t('toast_saved'))
      } else {
        toast.error(res.error ?? t('error_save'))
      }
    })
  }

  if (data.events.length === 0) {
    return (
      <Shell coupleName={data.coupleName} poweredBy={t('powered_by', { coupleName: data.coupleName })}>
        <div className="text-center">
          <PartyPopper className="mx-auto h-10 w-10 text-[#8e57b3]" />
          <h1 className="mt-4 text-2xl font-bold text-[#1A1A1A]">
            {t('empty_greeting', { name: data.guest.full_name })}
          </h1>
          <p className="mt-2 text-[#1A1A1A]/60">{t('empty_body')}</p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell
      coupleName={data.coupleName}
      weddingDate={data.weddingDate}
      poweredBy={t('powered_by', { coupleName: data.coupleName })}
    >
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[#8e57b3]">{t('eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1A1A1A]">{data.coupleName}</h1>
        <p className="mt-2 text-[#1A1A1A]/60">
          {t('header_greeting', { name: data.guest.full_name })}
        </p>
      </div>

      {submitted ? (
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <Check className="mx-auto h-8 w-8 text-emerald-600" />
          <h2 className="mt-3 text-lg font-semibold text-[#1A1A1A]">{t('submitted_title')}</h2>
          <p className="mt-1 text-sm text-[#1A1A1A]/60">{t('submitted_body')}</p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-sm font-semibold text-[#8e57b3] hover:underline"
          >
            {t('submitted_change')}
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {data.events.map((e) => {
            const a = answers[e.invitation.id]
            return (
              <div key={e.invitation.id} className="rounded-2xl border border-black/[0.08] bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C9A0DC]/15 text-[#8e57b3]">
                    <CalendarHeart className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-[#1A1A1A]">{e.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-[#8e57b3]">
                      {eventTypeLabel(e.event_type)}
                    </p>
                    <div className="mt-2 space-y-1 text-sm text-[#1A1A1A]/60">
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#1A1A1A]/35" /> {formatWhen(e.starts_at, t('date_tbc'))}
                      </p>
                      {e.venue_name || e.city ? (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#1A1A1A]/35" />
                          {[e.venue_name, e.address, e.city].filter(Boolean).join(', ')}
                        </p>
                      ) : null}
                      {e.dress_code ? <p className="text-xs">{t('dress_code_prefix')} {e.dress_code}</p> : null}
                      {e.description ? <p className="text-sm">{e.description}</p> : null}
                    </div>
                  </div>
                </div>

                {/* Attendance */}
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {(['attending', 'maybe', 'declined'] as RsvpStatus[]).map((s) => {
                    const active = a.rsvp_status === s
                    const label =
                      s === 'attending'
                        ? t('status_attending')
                        : s === 'maybe'
                          ? t('status_maybe')
                          : t('status_declined')
                    return (
                      <button
                        key={s}
                        onClick={() => update(e.invitation.id, { rsvp_status: s })}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? s === 'attending'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : s === 'maybe'
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-rose-400 bg-rose-50 text-rose-700'
                            : 'border-black/[0.12] text-[#1A1A1A]/60 hover:bg-black/[0.03]'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>

                {/* Attending extras */}
                {a.rsvp_status === 'attending' ? (
                  <div className="mt-4 space-y-3">
                    {data.guest.max_party_size > 1 ? (
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-[#1A1A1A]/80">
                          {t('party_size_label')}
                        </span>
                        <select
                          className={inputClass}
                          value={a.party_size}
                          onChange={(ev) => update(e.invitation.id, { party_size: Number(ev.target.value) })}
                        >
                          {Array.from({ length: data.guest.max_party_size }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>
                              {n === 1 ? t('party_size_one', { n }) : t('party_size_other', { n })}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}

                    {e.collect_meal_choice && e.meal_options.length > 0 ? (
                      <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-[#1A1A1A]/80">{t('meal_label')}</span>
                        <select
                          className={inputClass}
                          value={a.meal_choice}
                          onChange={(ev) => update(e.invitation.id, { meal_choice: ev.target.value })}
                        >
                          <option value="">{t('meal_placeholder')}</option>
                          {e.meal_options.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-[#1A1A1A]/80">
                        {t('dietary_label')} <span className="font-normal text-[#1A1A1A]/40">{t('dietary_optional')}</span>
                      </span>
                      <input
                        className={inputClass}
                        value={a.dietary_notes}
                        onChange={(ev) => update(e.invitation.id, { dietary_notes: ev.target.value })}
                        placeholder={t('dietary_placeholder')}
                      />
                    </label>
                  </div>
                ) : null}

                <label className="mt-3 block">
                  <span className="mb-1.5 block text-sm font-medium text-[#1A1A1A]/80">
                    {t('message_label')} <span className="font-normal text-[#1A1A1A]/40">{t('message_optional')}</span>
                  </span>
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={a.guest_message}
                    onChange={(ev) => update(e.invitation.id, { guest_message: ev.target.value })}
                  />
                </label>
              </div>
            )
          })}

          <button
            onClick={submit}
            disabled={pending}
            className="w-full rounded-xl bg-[#C9A0DC] px-4 py-3.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#b97fd0] disabled:opacity-50"
          >
            {pending ? t('send_pending') : t('send_cta')}
          </button>
        </div>
      )}
    </Shell>
  )
}

function Shell({
  children,
  weddingDate,
  poweredBy,
}: {
  children: React.ReactNode
  coupleName: string
  weddingDate?: string | null
  poweredBy: string
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3E9FA] via-[#FBF7F2] to-white">
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-16">
        <div className="mb-8 flex flex-col items-center gap-1">
          <Logo className="text-2xl" />
          {weddingDate ? (
            <p className="flex items-center gap-1.5 text-sm text-[#1A1A1A]/50">
              <Heart className="h-3.5 w-3.5 text-[#C9A0DC]" />
              {new Date(weddingDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          ) : null}
        </div>
        <div className="rounded-3xl bg-white/70 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.06)] backdrop-blur sm:p-8">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-[#1A1A1A]/40">{poweredBy}</p>
      </div>
    </div>
  )
}
