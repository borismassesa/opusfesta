'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Users, CalendarDays, Shirt, QrCode, Palette, Check, Sparkles, Plus, X,
  ZoomIn, ZoomOut, Lightbulb, HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  StructuredInvitation,
  WEDDING_THEMES,
  WEDDING_CONTENT_DEFAULT,
  type InvitationContent,
} from '@/components/guests/StructuredInvitation'
import type { CatalogProduct } from '@/data/invitations-products'

type Step = 'design' | 'review'
type Panel = 'event' | 'details' | 'dress' | 'rsvp' | 'theme'

const PANELS: { id: Panel; label: string; icon: React.ReactNode }[] = [
  { id: 'event', label: 'Event', icon: <Users size={16} /> },
  { id: 'details', label: 'Details', icon: <CalendarDays size={16} /> },
  { id: 'dress', label: 'Dress', icon: <Shirt size={16} /> },
  { id: 'rsvp', label: 'RSVP', icon: <QrCode size={16} /> },
  { id: 'theme', label: 'Theme', icon: <Palette size={16} /> },
]

const DEFAULT = WEDDING_CONTENT_DEFAULT

export default function CustomiseClient({ product }: { product: CatalogProduct }) {
  const [step, setStep] = useState<Step>('design')
  const [activePanel, setActivePanel] = useState<Panel>('event')
  const [zoom, setZoom] = useState(1)

  // Top — event title + family introduction + celebrant
  const [familyIntro, setFamilyIntro] = useState(DEFAULT.familyIntro ?? '')
  const [celebrant, setCelebrant] = useState(DEFAULT.celebrant)

  // Lower — date / time / venue
  const [dateISO, setDateISO] = useState('2026-08-22')
  const [time, setTime] = useState(DEFAULT.time ?? '')
  const [venue, setVenue] = useState(DEFAULT.venue)

  // Dress code + palette
  const [dressCode, setDressCode] = useState(DEFAULT.dressCode ?? '')
  const [palette, setPalette] = useState<string[]>(DEFAULT.palette ?? [])

  // RSVP + QR
  const [rsvpContacts, setRsvpContacts] = useState<string[]>(DEFAULT.rsvp?.contacts ?? [])
  const [qrLabel, setQrLabel] = useState<'SINGLE' | 'DOUBLE'>('SINGLE')

  // Theme (palette + floral + type)
  const [themeId, setThemeId] = useState(WEDDING_THEMES[0].id)
  const theme = WEDDING_THEMES.find((t) => t.id === themeId) ?? WEDDING_THEMES[0]

  const content: InvitationContent = useMemo(
    () => ({
      eventType: 'wedding',
      familyIntro: familyIntro || undefined,
      celebrant: celebrant.replace(/&/g, ' & '),
      date: dateISO ? dateISO.split('-').reverse().join(' · ') : '',
      time: time || undefined,
      venue,
      dressCode: dressCode || undefined,
      palette,
      rsvp: { label: 'RSVP', contacts: rsvpContacts.filter(Boolean) },
      qr: { label: qrLabel },
      branding: 'OpusFesta',
    }),
    [familyIntro, celebrant, dateISO, time, venue, dressCode, palette, rsvpContacts, qrLabel],
  )

  const handleSave = () => alert('Draft saved — you can jump back to this design any time.')
  const handleContinue = () =>
    alert(
      `Your invite is ready! In the real flow we'd save your design and continue to the send step.\n\n` +
        `Celebrant: ${celebrant}\nDate: ${dateISO} ${time}\nVenue: ${venue}\nTheme: ${theme.label}`,
    )

  const setPaletteAt = (i: number, v: string) => setPalette((p) => p.map((c, idx) => (idx === i ? v : c)))
  const setContactAt = (i: number, v: string) => setRsvpContacts((c) => c.map((x, idx) => (idx === i ? v : x)))

  const dateDisplay = dateISO ? dateISO.split('-').reverse().join(' / ') : '—'

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8] text-[#1A1A1A]">
      {/* ─── Top toolbar ─── */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
        <div className="relative flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Left — product name */}
          <div className="flex min-w-0 max-w-[40%] items-center sm:w-48">
            <p className="truncate text-[13px] font-bold text-gray-900">{product.name}</p>
          </div>

          {/* Center — step tabs */}
          <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-7" aria-label="Steps">
            {(['design', 'review'] as const).map((s) => {
              const active = step === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(s)}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'border-b-2 pb-1 text-[14px] font-medium capitalize transition',
                    active ? 'border-[#1A1A1A] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700',
                  )}
                >
                  {s}
                </button>
              )
            })}
          </nav>

          {/* Right — actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/invitations/catalog`}
              className="hidden items-center gap-1.5 text-[12px] font-bold text-gray-700 transition hover:text-gray-900 md:inline-flex"
            >
              <Palette size={15} />
              Change design
            </Link>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-full border border-gray-300 px-4 py-1.5 text-[12px] font-bold text-gray-800 transition hover:bg-gray-50 sm:px-5"
            >
              Save
            </button>
            <button
              type="button"
              onClick={step === 'design' ? () => setStep('review') : handleContinue}
              className="rounded-full bg-[#1A1A1A] px-4 py-1.5 text-[12px] font-bold text-white transition hover:bg-black sm:px-5"
            >
              {step === 'design' ? 'Next' : 'Continue to send'}
            </button>
            <Link
              href={`/invitations/p/${product.id}`}
              aria-label="Close customiser"
              className="ml-0.5 grid h-8 w-8 place-items-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <X size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Editor body ─── */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[340px_1fr]">
        {/* ─── Left sidebar — controls / review ─── */}
        <aside className="order-2 flex flex-col border-t border-gray-200 bg-white lg:order-1 lg:max-h-[calc(100vh-57px)] lg:border-r lg:border-t-0">
          <div className="border-b border-gray-200 px-5 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
              {step === 'design' ? 'Design' : 'Review'}
            </p>
            {step === 'design' && (
              <div className="mt-3 grid grid-cols-5 gap-1">
                {PANELS.map((p) => {
                  const active = activePanel === p.id
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePanel(p.id)}
                      aria-pressed={active}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-md py-2 text-[10px] font-bold uppercase tracking-[0.08em] transition',
                        active ? 'bg-[#1A1A1A] text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
                      )}
                    >
                      {p.icon}
                      {p.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            {step === 'review' ? (
              <>
                <ReviewRow label="Celebrant" value={celebrant} />
                <ReviewRow label="Date & time" value={`${dateDisplay}${time ? ` · ${time}` : ''}`} />
                <ReviewRow label="Venue" value={venue} />
                <ReviewRow label="Dress code" value={dressCode || '—'}>
                  {palette.length > 0 && (
                    <span className="flex items-center gap-1">
                      {palette.map((c, i) => (
                        <span key={i} className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: c }} />
                      ))}
                    </span>
                  )}
                </ReviewRow>
                <ReviewRow label="RSVP" value={rsvpContacts.filter(Boolean).join(', ') || '—'} />
                <ReviewRow label="QR entry" value={qrLabel} />
                <ReviewRow label="Theme" value={theme.label} />
                <p className="rounded-md border border-[#E8D9A7]/60 bg-[#F5EFE3]/60 px-3.5 py-3 text-[12px] leading-snug text-gray-700">
                  Looks good? Continue to send your invite by WhatsApp or SMS, with a live RSVP page for every guest.
                </p>
              </>
            ) : (
              <>
                {activePanel === 'event' && (
                  <>
                    <Field label="Celebrant names" hint="The large script line on the card">
                      <Input value={celebrant} onChange={setCelebrant} placeholder="e.g. Amani & Neema" />
                    </Field>
                    <Field label="Family introduction" hint="Swahili lead — “Familia ya …”">
                      <textarea
                        value={familyIntro}
                        onChange={(e) => setFamilyIntro(e.target.value)}
                        rows={3}
                        placeholder="Familia ya … pamoja na Familia ya …"
                        className="w-full resize-none rounded-md border border-gray-300 px-3.5 py-2.5 text-[14px] leading-relaxed focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                      />
                    </Field>
                  </>
                )}

                {activePanel === 'details' && (
                  <>
                    <Field label="Wedding date">
                      <input
                        type="date"
                        value={dateISO}
                        onChange={(e) => setDateISO(e.target.value)}
                        className="h-11 w-full rounded-md border border-gray-300 px-3.5 text-[14px] focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                      />
                    </Field>
                    <Field label="Time">
                      <Input value={time} onChange={setTime} placeholder="e.g. 4:00 PM" />
                    </Field>
                    <Field label="Venue / city">
                      <Input value={venue} onChange={setVenue} placeholder="e.g. Bagamoyo, Tanzania" />
                    </Field>
                  </>
                )}

                {activePanel === 'dress' && (
                  <>
                    <Field label="Dress code" hint="Shown as “Mavazi · …”">
                      <Input value={dressCode} onChange={setDressCode} placeholder="e.g. Cocktail" />
                    </Field>
                    <Field label="Colour palette" hint="The dress-code colours shown as dots">
                      <div className="flex items-center gap-3">
                        {palette.map((c, i) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <input
                              type="color"
                              value={c}
                              onChange={(e) => setPaletteAt(i, e.target.value)}
                              aria-label={`Palette colour ${i + 1}`}
                              className="h-10 w-12 cursor-pointer rounded-md border border-gray-300 bg-white p-1"
                            />
                            {palette.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setPalette((p) => p.filter((_, idx) => idx !== i))}
                                className="text-gray-500 hover:text-gray-900"
                                aria-label={`Remove colour ${i + 1}`}
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                        {palette.length < 4 && (
                          <button
                            type="button"
                            onClick={() => setPalette((p) => [...p, '#C8A35C'])}
                            className="grid h-10 w-10 place-items-center rounded-md border border-dashed border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-900"
                            aria-label="Add palette colour"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                    </Field>
                  </>
                )}

                {activePanel === 'rsvp' && (
                  <>
                    <Field label="RSVP contacts" hint="Phone numbers guests can reach">
                      <div className="space-y-2">
                        {rsvpContacts.map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="tel"
                              value={c}
                              onChange={(e) => setContactAt(i, e.target.value)}
                              placeholder="+255 7XX XXX XXX"
                              className="h-11 w-full rounded-md border border-gray-300 px-3.5 text-[14px] tabular-nums focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                            />
                            <button
                              type="button"
                              onClick={() => setRsvpContacts((list) => list.filter((_, idx) => idx !== i))}
                              className="shrink-0 text-gray-400 hover:text-gray-900"
                              aria-label={`Remove contact ${i + 1}`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        {rsvpContacts.length < 3 && (
                          <button
                            type="button"
                            onClick={() => setRsvpContacts((list) => [...list, ''])}
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-gray-700 hover:text-gray-900"
                          >
                            <Plus size={14} /> Add contact
                          </button>
                        )}
                      </div>
                    </Field>
                    <Field label="QR entry label" hint="Tagged on the QR code at the door">
                      <div className="flex gap-2">
                        {(['SINGLE', 'DOUBLE'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setQrLabel(opt)}
                            aria-pressed={qrLabel === opt}
                            className={cn(
                              'flex-1 rounded-md border px-3 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition',
                              qrLabel === opt
                                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500',
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </>
                )}

                {activePanel === 'theme' && (
                  <Field label="Card theme" hint="Palette, florals & typography as one set">
                    <div className="grid grid-cols-2 gap-2.5">
                      {WEDDING_THEMES.map((t) => {
                        const active = themeId === t.id
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setThemeId(t.id)}
                            aria-pressed={active}
                            className={cn(
                              'flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition',
                              active ? 'border-[#1A1A1A] ring-1 ring-[#1A1A1A]' : 'border-gray-300 hover:border-gray-500',
                            )}
                          >
                            <span
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 ring-black/10"
                              style={{ backgroundColor: t.surface }}
                              aria-hidden="true"
                            >
                              <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: t.accent }} />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[12px] font-bold text-gray-900">{t.label}</span>
                              {active && (
                                <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                                  <Check size={11} /> Selected
                                </span>
                              )}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </Field>
                )}

                <div className="flex items-start gap-2.5 rounded-md border border-[#E8D9A7]/60 bg-[#F5EFE3]/60 px-3.5 py-3">
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-[#7A1F2B]" aria-hidden="true" />
                  <p className="text-[12px] leading-snug text-gray-700">
                    Free design assistance and one round of revisions are included — our team polishes your
                    card before it goes out.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Sidebar footer — helper links */}
          <div className="flex items-center gap-5 border-t border-gray-200 px-5 py-3 text-[12px] font-semibold text-gray-600">
            <button type="button" className="inline-flex items-center gap-1.5 transition hover:text-gray-900">
              <HelpCircle size={15} /> Contact us
            </button>
            <button type="button" className="inline-flex items-center gap-1.5 transition hover:text-gray-900">
              <Lightbulb size={15} /> Tips
            </button>
          </div>
        </aside>

        {/* ─── Canvas — live preview ─── */}
        <div className="order-1 flex flex-col bg-[#E9E7E3] lg:order-2 lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)]">
          <div className="flex flex-1 items-center justify-center overflow-auto p-6 sm:p-10">
            <div className="w-full max-w-sm origin-center transition-transform" style={{ transform: `scale(${zoom})` }}>
              <div className="relative aspect-[5/7] overflow-hidden rounded-[4px] bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/5">
                <StructuredInvitation content={content} theme={theme} />
              </div>
            </div>
          </div>

          {/* Zoom control */}
          <div className="flex items-center justify-center gap-3 border-t border-black/5 px-6 py-3">
            <ZoomOut size={16} className="text-gray-500" aria-hidden="true" />
            <input
              type="range"
              min={0.6}
              max={1.4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom preview"
              className="w-44 accent-[#1A1A1A] sm:w-56"
            />
            <ZoomIn size={16} className="text-gray-500" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-md border border-gray-300 px-3.5 text-[14px] focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
    />
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-gray-900">{label}</label>
      {hint && <p className="mb-1.5 mt-0.5 text-[11px] text-gray-500">{hint}</p>}
      <div className={hint ? '' : 'mt-1.5'}>{children}</div>
    </div>
  )
}

function ReviewRow({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-500">{label}</span>
      <span className="flex items-center gap-2 text-right text-[13px] font-medium text-gray-900">
        {children}
        {value}
      </span>
    </div>
  )
}
